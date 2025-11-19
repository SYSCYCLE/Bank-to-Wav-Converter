import express from "express";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "uploads");
const OUTPUT_DIR = path.join(__dirname, "output");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

app.get("/extract/:file", (req, res) => {
  const bankFile = path.join(UPLOAD_DIR, req.params.file);
  console.log("Dosya bulundu, işleniyor:", bankFile);

  if (!fs.existsSync(bankFile)) {
    return res.status(404).json({ status: "error", message: "Dosya bulunamadı" });
  }

  const wavFileName = req.params.file.replace(".bank", ".wav");
  const outputFilePath = path.join(OUTPUT_DIR, wavFileName);

  exec(`./fmod_extractor "${bankFile}" "${outputFilePath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("Extractor hatası:", err);
      return res.status(500).json({ status: "error", message: "WAV üretilemedi" });
    }

    if (!fs.existsSync(outputFilePath)) {
      console.error("WAV dosyası oluşturulamadı!");
      return res.status(500).json({ status: "error", message: "WAV dosyası yok" });
    }

    console.log("WAV kaydedildi:", outputFilePath);
    res.json({ status: "success", outputFile: outputFilePath });
  });
});

app.get("/download/:file", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Dosya bulunamadı");
  }

  res.download(filePath, (err) => {
    if (err) {
      res.status(500).send("Download sırasında hata oluştu");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server ayakta, port: ${PORT}`);
});
