const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

// Configuração da AWS S3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const bucketName = process.env.AWS_BUCKET_NAME;

/**
 * Faz o upload de um arquivo para o S3.
 * @param {string} filePath Caminho do arquivo local.
 * @param {string} fileName Nome do arquivo no S3.
 * @returns {Promise<string>} URL pública do arquivo no S3.
 */
async function uploadToS3(filePath, fileName) {
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: bucketName,
        Key: fileName, // Nome do arquivo no S3
        Body: fileContent,
        ContentType: 'application/pdf',
    };

    try {
        const data = await s3.send(new PutObjectCommand(params));
        const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        return fileUrl; // URL pública do arquivo
    } catch (err) {
        console.error('Erro ao fazer upload para o S3:', err);
        throw err;
    }
}

module.exports = {
    uploadToS3,
};
