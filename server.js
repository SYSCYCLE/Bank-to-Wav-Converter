import fetch from "node-fetch";
import fs from "fs";

const url = "https://bank-to-wav-converter.onrender.com/extract";

fs.writeFileSync("test.bank", "dummy content");

const formData = new FormData();
formData.append("bank", fs.createReadStream("test.bank"));

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
  }
})();
