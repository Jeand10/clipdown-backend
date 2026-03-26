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

  const infoCommand = `yt-dlp -j "${url}"`;

  exec(infoCommand, (infoError, infoStdout) => {

    let title = "Vídeo pronto";
    let thumbnail = "https://via.placeholder.com/300x200?text=ClipDown";

    try {
      const data = JSON.parse(infoStdout);
      title = data.title || title;
      thumbnail = data.thumbnail || thumbnail;
    } catch {}

    // TENTATIVA 1 (com áudio)
    const command = `mkdir -p downloads && yt-dlp -f best -o "${filepath}" "${url}"`;

    exec(command, (error) => {

      if (error) {
        console.log("Fallback ativado...");

        // TENTATIVA 2 (link direto)
        const fallback = `yt-dlp -g "${url}"`;

        exec(fallback, (err2, stdout2) => {

          if (err2 || !stdout2) {
            return res.status(200).json({
              title: "Não foi possível baixar esse vídeo",
              thumbnail,
              url: ""
            });
          }

          const lines = stdout2.trim().split("\n");
          const videoUrl = lines[0];

          return res.json({
            title,
            thumbnail,
            url: videoUrl
          });
        });

      } else {

        res.json({
          title,
          thumbnail,
          url: `https://clipdown-backend-production.up.railway.app/files/${filename}`
        });

      }

    });

  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
