const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'assets');

fs.readdir(dir, async (err, files) => {
    if (err) return console.error(err);
    for (const file of files) {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
            const inputPath = path.join(dir, file);
            const outputPath = path.join(dir, file.replace(/\.(png|jpe?g)$/i, '.webp'));
            
            try {
                let s = sharp(inputPath);
                if (file === 'gmb_logo.png') {
                    s = s.resize({ width: 250, withoutEnlargement: true });
                } else {
                    s = s.resize({ width: 1000, withoutEnlargement: true });
                }
                await s.webp({ quality: 80 }).toFile(outputPath);
                console.log(`Converted ${file} to WebP`);
                fs.unlinkSync(inputPath);
            } catch (e) {
                console.error(`Error processing ${file}:`, e);
            }
        }
    }
});
