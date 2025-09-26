import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputDir = "./public/images";
const outputDir = "./public/optimized";

// Create optimized folder if not exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(inputDir).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
    const fileName = path.basename(file, ext);
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${fileName}.webp`);

    sharp(inputPath)
      .webp({ quality: 70 })
      .toFile(outputPath)
      .then(() => console.log(`Optimized: ${outputPath}`))
      .catch(err => console.error(`Error optimizing ${file}:`, err));
  }
});