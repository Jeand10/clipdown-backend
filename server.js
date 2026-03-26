import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL é obrigatória" });
  }

  const command = `yt-dlp -g "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error || !stdout) {
      console.error(stderr);
      return res.status(200).json({
        title: "Erro ao processar vídeo",
        thumbnail: "",
        url: ""
      });
    }

    const videoUrl = stdout.trim();

    res.json({
      title: "Download pronto",
      thumbnail: "",
      url: videoUrl
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
