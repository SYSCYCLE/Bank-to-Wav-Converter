import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, "output");

app.use(express.json());

app.post("/extract", async (req, res) => {
  try {
    const outputFile = "music_arena_general_battle.wav";

    return res.json({
      status: "success",
      outputFile: `/download/${outputFile}`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: "Hata oluştu" });
  }
});

app.get("/download/:file", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.file);
  console.log("İndirilen dosya:", filePath);

  res.download(filePath, (err) => {
    if (err) {
      console.error("Download hatası:", err.message);
      res.status(404).send("Dosya bulunamadı");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server ayakta, port: ${PORT}`);
});
