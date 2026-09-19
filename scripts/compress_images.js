const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const categoriesDir = path.join(__dirname, '../public/categories');
console.log('Compressing images in:', categoriesDir);

const files = fs.readdirSync(categoriesDir);

async function compressAll() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    if (!file.endsWith('.jpg') && !file.endsWith('.jpeg')) continue;
    const filePath = path.join(categoriesDir, file);
    const statBefore = fs.statSync(filePath);
    totalBefore += statBefore.size;

    const tmpPath = filePath + '.tmp';
    await sharp(filePath)
      .resize({ width: 800, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(tmpPath);

    const statAfter = fs.statSync(tmpPath);
    totalAfter += statAfter.size;
    console.log(`${file}: ${(statBefore.size / 1024).toFixed(1)} KB -> ${(statAfter.size / 1024).toFixed(1)} KB`);

    fs.renameSync(tmpPath, filePath);
  }

  console.log(`\nTotal Size Before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total Size After: ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Saved: ${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%`);
}

compressAll().catch(err => {
  console.error(err);
  process.exit(1);
});
