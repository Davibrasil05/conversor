const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 3001;

app.use(cors());

// Criação da pasta uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos JPEG e PNG são permitidos.'));
        }
    },
}).array('files', 10); // Suporte a múltiplos arquivos (máximo de 10)

// Função para converter imagens em PDF
function convertImageToPdf(imagePath, outputPdfPath) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'conversores', 'img-pdf.py');
        const command = `python "${scriptPath}" "${imagePath}" "${outputPdfPath}"`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
}

// Endpoint de upload
app.post('/uploads', async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send(err.message);
        }

        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).send('Nenhum arquivo enviado.');
        }

        try {
            const results = [];
            for (const file of files) {
                const pdfPath = file.path.replace(/\.[^/.]+$/, '.pdf');
                await convertImageToPdf(file.path, pdfPath);
                results.push(`Arquivo ${path.basename(pdfPath)} gerado com sucesso.`);
            }

            res.status(200).json({ message: results });
        } catch (error) {
            console.error('Erro na conversão:', error);
            res.status(500).send('Erro ao converter arquivos.');
        }
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
