import express from "express";
import cors from "cors";
import fs from "fs";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES module style
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/run", (req, res) => {
  const code = req.body.code;
  const filePath = path.join(__dirname, "temp.py");

  fs.writeFileSync(filePath, code);

  exec(`python3 ${filePath}`, (err, stdout, stderr) => {
    if (err || stderr) {
      return res.json({ error: stderr || err.message });
    }

    res.json({ output: stdout });

    fs.unlinkSync(filePath); // delete temp file
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
