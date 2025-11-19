import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const app = express();
const PORT = process.env.PORT || 10000;

const UPLOAD_DIR = path.join(__dirname, "uploads");
const OUTPUT_DIR = path.join(__dirname, "output");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/list", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.endsWith(".bank"));
  res.json({ files });
});

app.post("/convert/:filename", (req, res) => {
  const inputFile = path.join(UPLOAD_DIR, req.params.filename);
  const outputFile = path.join(OUTPUT_DIR, req.params.filename.replace(".bank", ".wav"));

  if (!fs.existsSync(inputFile)) return res.status(404).json({ error: "Dosya bulunamadı" });

  exec(`./fmod_extractor "${inputFile}" "${outputFile}"`, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: "Çevirme başarısız", details: stderr });

    console.log(`WAV kaydedildi: ${outputFile}`);
    res.json({ status: "success", outputFile: `/download/${path.basename(outputFile)}` });
  });
});

app.get("/download/:filename", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("Dosya bulunamadı");
  res.download(filePath);
});

app.listen(PORT, () => console.log(`Server ayakta, port: ${PORT}`));
