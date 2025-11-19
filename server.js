import express from "express";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

app.get("/extract/:filename", async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found in uploads" });
  }

  try {
    console.log(`Dosya bulundu, işleniyor: ${filePath}`);

    exec(`./fmod_extractor "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Extraction error:", stderr || error.message);
        return res.status(500).json({ error: "Extraction failed", details: stderr });
      }

      console.log("Extraction tamamlandı:", stdout);
      res.json({ status: "success", output: stdout });
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server ayakta, port: ${PORT}`);
});
