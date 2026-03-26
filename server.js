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

  const command = `yt-dlp -j "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(stderr);
      return res.status(500).json({ error: "Erro ao processar vídeo" });
    }

    try {
      const data = JSON.parse(stdout);

      res.json({
        title: data.title,
        thumbnail: data.thumbnail,
        url: data.url
      });

    } catch (err) {
      res.status(500).json({ error: "Erro ao converter resposta" });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
