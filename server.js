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

  // Melhor comando
  const command = `yt-dlp -f "best[ext=mp4]" -g "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: "Erro ao processar vídeo" });
    }

    const videoUrl = stdout.trim();

    res.json({
      title: "Video pronto para download",
      thumbnail: "",
      url: videoUrl
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
