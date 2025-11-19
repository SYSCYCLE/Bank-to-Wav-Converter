import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import { exec } from "child_process";

const app = express();

app.use(cors({
  origin: true,
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: false
}));

app.options("/extract", cors());

app.use(express.static("."));

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 200 * 1024 * 1024 }
});

app.post("/extract", upload.single("bank"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No .bank file uploaded" });

  const inputPath = req.file.path;
  const outputDir = path.join("output", req.file.filename);
  fs.mkdirSync(outputDir, { recursive: true });

  const extractor = "./fmod_extractor";
  const outFile = path.join(outputDir, "output.wav");

  const cmd = `${extractor} ${inputPath} -o ${outFile}`;

  exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      console.error("Extractor error:", error, stderr);
      return res.status(500).json({ error: "Extraction failed", detail: stderr || error.message });
    }
    
    let files = [];
    try {
      files = fs.readdirSync(outputDir).filter(f => f.endsWith(".wav") || f.endsWith(".ogg"));
    } catch (e) {
      console.error("Read output error:", e);
    }

    const fileUrls = files.map(f => `/download/${req.file.filename}/${f}`);
    res.json({ message: "Extraction complete", files: fileUrls, stdout: stdout ? stdout.slice(0,2000) : undefined });
  });
});

app.get("/download/:id/:sound", (req, res) => {
  const filePath = path.join("output", req.params.id, req.params.sound);
  if (!fs.existsSync(filePath)) return res.status(404).send("Not found");
  res.download(filePath);
});

app.listen(process.env.PORT || 3000, () => console.log("FMOD extractor API running"));
