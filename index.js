import fs from "fs";
import path from "path";
import axios from "axios";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Função para criar pastas recursivamente
const createFolders = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Função para baixar e salvar o vídeo
const dowloadVideo = async (url, filePath) => {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    const videoPath = filePath;
    const videoStream = fs.createWriteStream(videoPath);
    response.data.pipe(videoStream);

    await new Promise((resolve, reject) => {
      videoStream.on("error", reject);
      videoStream.on("finish", resolve);
    });

    console.log(`video baixado e salvo em ${filePath}`);
  } catch (erro) {
    console.error("Erro ao baixar video", erro);
  }
};

// Função principal para processar o JSON
const processJson = async (json) => {
  for (const category of json.videos) {
    for (const [categoryName, subcategories] of Object.entries(category)) {
      const categoryPath = path.join(__dirname, categoryName);
      createFolders(categoryPath);

      for (const subcategory of subcategories) {
        for (const [subcategoryName, videos] of Object.entries(subcategory)) {
          const subcategoryPath = path.join(categoryPath, subcategoryName);
          createFolders(subcategoryPath);

          for (const video of videos) {
            const videoName = `${video.name}.mp4`;
            const videoPath = path.join(subcategoryPath, videoName);
            try {
              await dowloadVideo(video.urlVideo, videoPath);
              await delay(10000);
            } catch (erro) {
              console.error(`Erro ao baixar o vídeo ${video.name}:`, erro);
            }
          }
        }
      }
    }
  }
};

const jsonFilePath = path.join(__dirname, "vimeodata.json");
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

processJson(jsonData)
  .then(() => {
    console.log("Videos salvo com Sucesso!");
  })
  .catch((erro) => {
    console.error("Falha ao tentar baixar videos", erro);
  });
