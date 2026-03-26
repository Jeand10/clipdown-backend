import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/files", express.static("downloads"));

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL é obrigatória" });
  }

  const filename = `video_${Date.now()}.mp4`;
  const filepath = path.join("downloads", filename);

  // 1️⃣ pega dados do vídeo
  const infoCommand = `yt-dlp -j "${url}"`;

  exec(infoCommand, (infoError, infoStdout) => {

    let title = "Video pronto";
    let thumbnail = "";

    try {
      const data = JSON.parse(infoStdout);
      title = data.title || title;
      thumbnail = data.thumbnail || "";
    } catch {}

    // 2️⃣ baixa vídeo com áudio
    const downloadCommand = `mkdir -p downloads && yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 -o "${filepath}" "${url}"`;

    exec(downloadCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(stderr);
        return res.status(200).json({
          title: "Erro ao processar vídeo",
          thumbnail: "",
          url: ""
        });
      }

      res.json({
        title,
        thumbnail,
        url: `https://clipdown-backend-production.up.railway.app/files/${filename}`
      });
    });

  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
