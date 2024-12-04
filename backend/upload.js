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
        const imagePaths = req.files.map(file => file.path); // Caminhos dos arquivos enviados
        const outputPdfPath = path.join(uploadDir, 'output.pdf');

        // Chama o script Python para converter múltiplos arquivos
        await converteimagempdf(imagePaths, outputPdfPath);

        res.status(200).json({ message: [`PDF gerado com sucesso: ${outputPdfPath}`] });
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).send('Erro ao converter arquivos.');
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});