import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import https from "https";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/files", express.static("downloads"));

// função pra baixar imagem
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", reject);
  });
}

app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL é obrigatória" });
  }

  const filename = `video_${Date.now()}.mp4`;
  const thumbname = `thumb_${Date.now()}.jpg`;

  const filepath = path.join("downloads", filename);
  const thumbpath = path.join("downloads", thumbname);

  const infoCommand = `yt-dlp -j "${url}"`;

  exec(infoCommand, async (infoError, infoStdout) => {

    let title = "Vídeo pronto";
    let thumbnail = "https://dummyimage.com/300x200/000/fff&text=ClipDown";

    try {
      const data = JSON.parse(infoStdout);
      title = data.title || title;

      if (data.thumbnail) {
        try {
          // garante pasta
          if (!fs.existsSync("downloads")) {
            fs.mkdirSync("downloads");
          }

          await downloadImage(data.thumbnail, thumbpath);

          thumbnail = `https://clipdown-backend-production.up.railway.app/files/${thumbname}`;
        } catch (e) {
          console.log("Erro ao baixar thumb");
        }
      }

    } catch {}

    const command = `yt-dlp -f bestvideo+bestaudio --merge-output-format mp4 -o "${filepath}" "${url}"`;

    exec(command, (error) => {

      if (error) {
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

  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
