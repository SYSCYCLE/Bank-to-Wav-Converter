import express from "express";
import cors from "cors";
import multer from "multer";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.static("."));

const upload = multer({ dest: "uploads/" });

app.post("/extract", upload.single("bank"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No .bank file uploaded" });
  }

  const inputPath = req.file.path;
  const outputDir = path.join("output", req.file.filename);
  fs.mkdirSync(outputDir, { recursive: true });

  const extractor = "./fmod_extractor";

  const outFile = path.join(outputDir, "output.wav");
  const cmd = `${extractor} ${inputPath} -o ${outFile}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.log("Extractor Error:", stderr);
      return res.status(500).json({ error: "Extractor failed", details: stderr });
    }

    return res.json({
      message: "done",
      file: `/download/${req.file.filename}/output.wav`
    });
  });
});

app.get("/download/:id/:file", (req, res) => {
  const p = path.join("output", req.params.id, req.params.file);
  res.download(p);
});

app.listen(process.env.PORT || 3000, () => console.log("RUNNING"));
