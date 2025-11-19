import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import { exec } from "child_process";

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

app.use(express.static("."));

app.post("/extract", upload.single("bank"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No .bank file uploaded" });
  }

  const inputPath = req.file.path;
  const outputDir = path.join("output", req.file.filename);
  fs.mkdirSync(outputDir, { recursive: true });

  const cmd = `./fmod_extractor ${inputPath} ${outputDir}`;
  
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Extractor error:", stderr);
      return res.status(500).json({ error: "Extraction failed" });
    }

    const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".wav") || f.endsWith(".ogg"));

    res.json({
      message: "Extraction complete",
      files: files.map(f => `/download/${req.file.filename}/${f}`)
    });
  });
});

app.get("/download/:id/:sound", (req, res) => {
  const filePath = path.join("output", req.params.id, req.params.sound);
  res.download(filePath);
});

app.listen(3000, () => console.log("FMOD extractor API running on port 3000"));
