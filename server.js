import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import multer from "multer";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 10000;

const UPLOAD_DIR = path.join(__dirname, "uploads");
const OUTPUT_DIR = path.join(__dirname, "output");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

app.use(bodyParser.json());

app.post("/extract", upload.single("bank"), (req, res) => {
  const bankFile = path.join(UPLOAD_DIR, req.file.filename);
  const wavFile = path.join(OUTPUT_DIR, req.file.filename.replace(/\.bank$/, ".wav"));

  console.log("Dosya bulundu, işleniyor:", bankFile);

  exec(`./fmod_extractor "${bankFile}" "${wavFile}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "error", message: stderr });
    }
    console.log("WAV kaydedildi:", wavFile);
    res.json({ status: "success", outputFile: wavFile });
  });
});

app.get("/download/:file", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.file);
  res.download(filePath, (err) => {
    if (err) res.status(404).send("Dosya bulunamadı");
  });
});

app.listen(PORT, () => {
  console.log(`Server ayakta, port: ${PORT}`);
});
