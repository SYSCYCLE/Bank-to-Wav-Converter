import fetch from "node-fetch";
import fs from "fs";
import path from "path";

fs.writeFileSync("test.bank", "dummy content");

fs.mkdirSync("uploads", { recursive: true });
fs.mkdirSync("output", { recursive: true });

const uploadPath = path.join("uploads", "test.bank");
fs.copyFileSync("test.bank", uploadPath);

const FormData = global.FormData || (await import("form-data")).default;
const formData = new FormData();
formData.append("bank", fs.createReadStream(uploadPath));

const url = "https://bank-to-wav-converter.onrender.com/extract";

(async () => {
  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData
    });

    console.log("Status:", res.status);
    const data = await res.json().catch(() => null);
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    fs.unlinkSync("test.bank");
    fs.unlinkSync(uploadPath);
  }
})();
