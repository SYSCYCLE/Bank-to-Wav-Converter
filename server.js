import express from "express";
import fs from "fs";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const UPLOAD_DIR = join(__dirname, "uploads");
const OUTPUT_DIR = join(__dirname, "output");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

app.get("/convert/:filename", (req, res) => {
  const { filename } = req.params;
  const inputFile = join(UPLOAD_DIR, filename);
  const outputFile = join(OUTPUT_DIR, filename.replace(".bank", ".wav"));

  if (!fs.existsSync(inputFile)) {
    return res.status(404).json({ error: "Dosya bulunamadı" });
  }

  exec(`./fmod_extractor "${inputFile}" "${outputFile}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("Hata:", err.message);
      return res.status(500).json({ error: "Dönüştürme başarısız", details: err.message });
    }

    console.log(`WAV kaydedildi: ${outputFile}`);
    res.json({ status: "success", outputFile });
  });
});

app.listen(PORT, () => {
  console.log(`Server ayakta, port: ${PORT}`);
});
