import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import { exec } from "child_process";

const app = express();
app.use(cors({ origin: "*" }));

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const OUTPUT_DIR = path.join(process.cwd(), "output");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const upload = multer({ dest: UPLOADS_DIR });

app.use(express.static("."));

app.post("/extract", upload.single("bank"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No .bank file uploaded" });

  const inputPath = path.join(UPLOADS_DIR, req.file.filename);
  const outputDir = path.join(OUTPUT_DIR, req.file.filename);
  fs.mkdirSync(outputDir, { recursive: true });

  const cmd = `./fmod_extractor "${inputPath}" "${outputDir}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Extractor error:", stderr);
      return res.status(500).json({ error: "Extraction failed", details: stderr });
    }

    const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".wav") || f.endsWith(".ogg"));
    res.json({
      message: "Extraction complete",
      files: files.map(f => `/download/${req.file.filename}/${f}`)
    });
  });
});

app.get("/download/:id/:sound", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.id, req.params.sound);
  res.download(filePath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FMOD extractor API running on port ${PORT}`));
