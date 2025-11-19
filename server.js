import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const app = express();
const PORT = process.env.PORT || 10000;

const uploadsDir = path.join(process.cwd(), "uploads");
const outputDir = path.join(process.cwd(), "output");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

function processBankFiles() {
  const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith(".bank"));

  if (files.length === 0) {
    console.log("Uploads içinde .bank dosyası yok.");
    return;
  }

  files.forEach(file => {
    const inputPath = path.join(uploadsDir, file);
    const outputPath = path.join(outputDir, file.replace(".bank", ".wav"));

    console.log("Dosya bulundu, işleniyor:", inputPath);

    exec(`./fmod_extractor -i "${inputPath}" -o "${outputPath}"`, (err, stdout, stderr) => {
      if (err) {
        console.error("Hata:", err);
        return;
      }
      console.log("WAV kaydedildi:", outputPath);
    });
  });
}

app.get("/extract", (req, res) => {
  processBankFiles();
  res.json({ status: "başlatıldı", message: "Uploads içindeki bank dosyaları işleniyor." });
});

app.listen(PORT, () => {
  console.log("Server ayakta, port:", PORT);
  processBankFiles();
});
