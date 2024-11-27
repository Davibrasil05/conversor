const { match } = require('assert')
const express = require('express')
const multer = require('multer')
const path = require('path')


const app = express()
const PORT= 3000

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename: (req,file,cb)=>{
        const uniqSufixx = Date.now() + '-'+ Math.round(Math.random()*1E9)
        cb(null,uniqSufixx + '-'+ file.originalname)

    },
})

const upload = multer({storage})

//criar pasta de upload caso não existir


const fs = require('fs')
if(!fs.existsSync('uploads')){
    fs.mkdirSync('uploads')
}

//endpoint para o upload

app.post('/upload', upload.single('file'),(req,res)=>{
    if(!req.file){
        return res.status(400).send('Nenhum arquivo enviado');

    }
    res.status(200).send(`arquivo ${req.file.filename} enviado com sucesso`)
})

app.listen(PORT,()=>{
    console.log(`servidor rodando localhost:${PORT}`)
})