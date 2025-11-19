import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { execFile } from "child_process";

const app = express();
const PORT = process.env.PORT || 10000;

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const OUTPUT_DIR = path.join(process.cwd(), "output");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.post("/extract", upload.single("bank"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No .bank file uploaded" });

  const bankPath = req.file.path;
  const outputFileName = path.parse(req.file.originalname).name + ".wav";
  const outputPath = path.join(OUTPUT_DIR, outputFileName);

  console.log("Dosya bulundu, işleniyor:", bankPath);

  execFile("./fmod_extractor", ["-o", outputPath, bankPath], (err, stdout, stderr) => {
    if (err) {
      console.error("Extractor hatası:", err, stderr);
      return res.status(500).json({ error: "Extraction failed", details: stderr });
    }

    console.log("İşlem tamamlandı. WAV kaydedildi:", outputPath);
    return res.json({ status: "success", output: `Saved to ${outputPath}` });
  });
});

app.get("/extract/:fileName", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.fileName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });
  res.json({ status: "found", file: filePath });
});

app.listen(PORT, () => console.log(`Server ayakta, port: ${PORT}`));
