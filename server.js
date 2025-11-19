import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 10000;

const UPLOAD_DIR = path.join(__dirname, "uploads");

app.get("/extract", (req, res) => {
  const input = path.join(UPLOAD_DIR, "music_arena_general_battle.bank");
  const tempOutput = "/tmp/output.wav";

  exec(`./fmod_extractor "${input}" "${tempOutput}"`, (err) => {
    if (err) return res.status(500).send("FMOD hata verdi");
    if (!fs.existsSync(tempOutput)) {
      return res.status(500).send("WAV çıkmadı");
    }

    res.download(tempOutput, "output.wav", () => {
      fs.unlink(tempOutput, () => {});
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server ayakta, port: ${PORT}`);
});
