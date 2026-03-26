import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

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

  // 🔥 comando com debug
  const command = `
  mkdir -p downloads &&
  python3 -m yt_dlp -f best -o "${filepath}" "${url}" --verbose
  `;

  console.log("Rodando comando:", command);

  exec(command, (error, stdout, stderr) => {

    console.log("STDOUT:", stdout);
    console.log("STDERR:", stderr);

    if (error) {
      console.log("ERRO REAL:", error);

      return res.status(200).json({
        title: "Erro ao baixar vídeo",
        thumbnail: "",
        url: ""
      });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(200).json({
        title: "Arquivo não foi criado",
        thumbnail: "",
        url: ""
      });
    }

    res.json({
      title: "Download pronto",
      thumbnail: "",
      url: `https://clipdown-backend-production.up.railway.app/files/${filename}`
    });

  });

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
