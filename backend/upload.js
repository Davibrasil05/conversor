const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 3001;

// Habilita CORS para todas as origens
app.use(cors());

// Cria a pasta de uploads, caso não exista
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
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
    // Tipos de arquivos permitidos
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos JPEG e PNG são permitidos.'));
    }
};

const upload = multer({ storage, fileFilter });

// Função para executar o script Python
function converteimagempdf(imagePath, outputPdfpath) {
    return new Promise((resolve, reject) => {
        // Caminho correto para o script Python (considerando que server.js está em backend)
        const scriptPath = path.join(__dirname, 'conversores', 'img-pdf.py');
        
        // Verificação para garantir que o caminho está correto
        console.log('Caminho do script Python:', scriptPath);

        // Comando para rodar o script Python
        const command = `python "${scriptPath}" "${imagePath}" "${outputPdfpath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Erro ao executar o script Python: ${stderr}`);
            } else {
                resolve(stdout); // Retorna a saída do script Python
            }
        });
    });
}
// Endpoint de upload
app.post('/uploads', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    try {
        const uploadedImagePath = req.file.path;
        const pdfFilename = req.file.filename.replace(/\.[^/.]+$/, '.pdf'); // Substitui a extensão para .pdf
        const pdfPath = path.join(uploadDir, pdfFilename);

        // Chama a função para converter a imagem em PDF
        await converteimagempdf(uploadedImagePath, pdfPath);

        // Resposta bem-sucedida
        res.status(200).send(`Arquivo ${pdfFilename} gerado com sucesso.`);

    } catch (error) {
        // Resposta com erro
        console.error('Erro na conversão para PDF:', error);
        res.status(500).send('Erro ao converter a imagem para PDF.');
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
