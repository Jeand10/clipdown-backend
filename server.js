import express from "express";
import cors from "cors";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL é obrigatória" });
  }

  const output = `video_${Date.now()}.mp4`;

  const command = `yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 -o "${output}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: "Erro ao baixar vídeo" });
    }

    const filePath = path.resolve(output);

    res.download(filePath, "video.mp4", (err) => {
      if (err) {
        console.error(err);
      }

      // apagar arquivo depois
      fs.unlink(filePath, () => {});
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
