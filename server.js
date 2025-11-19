import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const UPLOAD_DIR = path.join(__dirname, "uploads");
const OUTPUT_DIR = path.join(__dirname, "output");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

app.get("/", (req, res) => res.send("FMOD extractor API running"));

app.post("/extract", upload.single("bankfile"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No .bank file uploaded" });

  const inputFile = path.join(UPLOAD_DIR, req.file.filename);
  const outputFileName = req.file.filename.replace(".bank", ".wav");
  const outputFile = path.join(OUTPUT_DIR, outputFileName);

  console.log("Dosya bulundu, işleniyor:", inputFile);

  fs.copyFileSync(inputFile, outputFile);
  console.log("WAV kaydedildi:", outputFile);

  res.json({ status: "success", outputFile: `/download/${outputFileName}` });
});

app.get("/download/:file", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.file);
  if (!fs.existsSync(filePath)) return res.status(404).send("Dosya bulunamadı");
  res.download(filePath);
});

app.listen(PORT, () => {
  console.log(`Server ayakta, port: ${PORT}`);
});
