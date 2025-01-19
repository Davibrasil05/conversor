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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    req.setTimeout(0); // Sem limite de tempo
    next();
});

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
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos JPEG e PNG são permitidos.'));
    }
};

const upload = multer({ storage, fileFilter });

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
        console.log('teste',outputPdfPath)
        // Envia o arquivo convertido como resposta para download
        res.status(200).json({url:`/uploads/output-${uniqueSuffix}.pdf`})
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).send('Erro ao converter arquivos.');
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});