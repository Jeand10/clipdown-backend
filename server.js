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

    // tentativa 1 (melhor qualidade)
    let command = `mkdir -p downloads && yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 -o "${filepath}" "${url}"`;

    exec(command, (error, stdout, stderr) => {

      if (error) {
        console.log("Tentando fallback...");

        // fallback mais leve (funciona mais)
        const fallback = `yt-dlp -f best -o "${filepath}" "${url}"`;

        exec(fallback, (err2) => {

          if (err2) {
            console.error("Falhou tudo:", err2);

            return res.status(200).json({
              title: "Não foi possível baixar esse vídeo",
              thumbnail,
              url: ""
            });
          }

          res.json({
            title,
            thumbnail,
            url: `https://clipdown-backend-production.up.railway.app/files/${filename}`
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
