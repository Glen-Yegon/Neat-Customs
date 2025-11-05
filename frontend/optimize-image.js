import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputDir = "./images";
const outputDir = "./images/minified";

// ✅ Automatically create the output folder if missing
fs.mkdirSync(outputDir, { recursive: true });

fs.readdirSync(inputDir).forEach((file) => {
  // Process only image files
  if (file.match(/\.(jpg|jpeg|png)$/i)) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${path.parse(file).name}.webp`);

    sharp(inputPath)
      .resize({ width: 800 }) // adjust width if needed
      .webp({ quality: 80 }) // 80% quality
      .toFile(outputPath)
      .then(() => console.log(`✅ Optimized: ${file}`))
      .catch((err) => console.error(`❌ Error optimizing ${file}:`, err));
  }
});