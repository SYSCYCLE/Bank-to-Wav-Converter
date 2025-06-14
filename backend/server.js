const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const uploadDir = 'uploads';
const convertedDir = 'converted';

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(convertedDir)) fs.mkdirSync(convertedDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

app.use('/converted', express.static(convertedDir));

app.post('/convert', upload.single('bankFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Hiç dosya yüklenmedi.' });
    }

    const inputFilePath = req.file.path;
    const originalFileName = req.file.originalname;
    const outputFileName = `${path.parse(originalFileName).name}.wav`;
    const outputFilePath = path.join(convertedDir, outputFileName);

    const conversionCommand = `cp "${inputFilePath}" "${outputFilePath}"`;

    exec(conversionCommand, (error, stdout, stderr) => {
        fs.unlink(inputFilePath, (err) => {
            if (err) console.error(`Geçici dosya silinirken hata: ${err}`);
        });

        if (error) {
            if (fs.existsSync(outputFilePath)) {
                fs.unlink(outputFilePath, (err) => {
                    if (err) console.error(`Çıktı dosyası silinirken hata: ${err}`);
                });
            }
            return res.status(500).json({ message: `Dönüştürme hatası: ${stderr || error.message}` });
        }

        const downloadUrl = `/converted/${outputFileName}`;
        res.json({
            message: 'Dosya başarıyla işlendi ve indirilmeye hazır.',
            downloadUrl: downloadUrl
        });
    });
});

app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
});
