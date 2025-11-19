import fs from "fs";
import path from "path";

const uploadsDir = path.join(process.cwd(), "uploads");
const fileName = "music_arena_general_battle.bank";

const filePath = path.join(uploadsDir, fileName);

try {
  if (!fs.existsSync(filePath)) {
    console.error("Dosya uploads içinde bulunamadı.");
  } else {
    console.log("Dosya bulundu, işleniyor:", filePath);
  }
} catch (err) {
  console.error("Hata:", err.message);
}
