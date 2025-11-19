import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";
import path from "path";

const url = "https://bank-to-wav-converter.onrender.com/extract";
const testFile = path.join(process.cwd(), "uploads", "real-bank-file.bank");

const formData = new FormData();
formData.append("bank", fs.createReadStream(testFile));

(async () => {
  try {
    const res = await fetch(url, { method: "POST", body: formData });
    console.log("Status:", res.status);
    const data = await res.json().catch(() => null);
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
