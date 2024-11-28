const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');  // Importa o pacote CORS

const app = express();
const PORT = 3000;

// Habilita o CORS para todas as origens (ou especificar um domínio)
app.use(cors());

// Cria a pasta 'uploads' se não existir
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Salva os arquivos na pasta 'uploads'
    },
    filename: (req, file, cb) => {
        const uniqSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqSuffix + '-' + file.originalname);  // Nome único para os arquivos
    },
});

const upload = multer({ storage });

// Endpoint para upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send(' ');
    }
    res.status(200).send(`Arquivo ${req.file.filename} enviado com sucesso`);
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
