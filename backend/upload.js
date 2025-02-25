const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');
const { uploadToS3 } = require('./services/s3Services');


const app = express();
const PORT = 3001;

// Habilita CORS para todas as origens
app.use(cors());

// Cria a pasta de uploads, caso não exista
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const uploadCompressDir = path.join(__dirname,'uploadsCompress');
if(!fs.existsSync(uploadCompressDir)){
    fs.mkdirSync(uploadCompressDir)
}

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Salva os arquivos na pasta uploads
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Nome único para os arquivos
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos JPEG e PNG são permitidos.'));
    }
};

const upload = multer({ storage, fileFilter });

// Configura a pasta "uploads" como pública
app.use('/uploads', express.static(uploadDir));
app.use('/uploadsCompress', express.static(uploadCompressDir))

// Função para executar o script Python para múltiplos arquivos
function converteimagempdf(imagePaths, outputPdfPath) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'conversores', 'img-pdf.py'); // Nome do script Python

        const command = `python "${scriptPath}" ${imagePaths.map(path => `"${path}"`).join(' ')} "${outputPdfPath}"`;

        console.log('Comando gerado:', command);

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Erro ao executar o script Python: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
}

function comprimiImage (imagePaths,imgcomprimido){
    return new Promise((resolve,reject)=>{
        const scriptPath = path.join(__dirname, 'conversores', 'compressorImage.py');
   console.log(scriptPath)
        const command = `python "${scriptPath}" "${imagePaths}" "${imgcomprimido}"`;

         console.log('funcinou')
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Erro ao executar o script Python: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    })


}
app.post('/upload-compress', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    try {
        const imCompressPath = req.file.path; // Caminho do arquivo enviado
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const imgComprees = path.join(uploadCompressDir, `image-${uniqueSuffix}.jpg`); // Caminho da imagem comprimida
        console.log(imCompressPath)
        console.log('chamando a função ')

        // Chamando o script Python com um único arquivo de entrada
        await comprimiImage(imCompressPath, imgComprees);

        if (!fs.existsSync(imgComprees)) {
            throw new Error('Arquivo comprimido não foi salvo.');
        }
        res.status(200).json({ 
            message: 'Imagem comprimida com sucesso!', 
            url: `/uploadsCompress/${path.basename(imgComprees)}` 
        });
    } catch (error) {
        console.error('Erro ao comprimir imagem:', error);
        res.status(500).send('Erro ao comprimir imagem.');
    }
});
// Endpoint para upload de múltiplos arquivos
app.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    try {
        const imagePaths = req.files.map(file => file.path);

        // Define um nome único para o arquivo PDF
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const outputPdfPath = path.join(uploadDir, `output-${uniqueSuffix}.pdf`);

        // Chama o script Python para converter múltiplos arquivos
        await converteimagempdf(imagePaths, outputPdfPath);

        // Faz o upload do PDF gerado para o S3
        const s3Url = await uploadToS3(outputPdfPath, `output-${uniqueSuffix}.pdf`);

        // Retorna a URL pública do S3 para o cliente
        res.status(200).json({
            message: 'PDF gerado com sucesso!',
            url: s3Url, // URL pública do arquivo no S3
        });

        // Opcional: Remove o arquivo local após o upload para o S3
        fs.unlinkSync(outputPdfPath);
        imagePaths.forEach(path => fs.unlinkSync(path));

    } catch (error) {
        console.error('Erro ao gerar PDF ou fazer upload:', error);
        res.status(500).send('Erro ao converter arquivos.');
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
