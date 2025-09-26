import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function findImageFiles(dir) {
  const images = [];
  
  async function scanDir(currentDir) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
        images.push(fullPath);
      }
    }
  }
  
  await scanDir(dir);
  return images;
}

async function prewarmImages() {
  const publicDir = path.join(__dirname, 'public');
  const cacheDir = path.join(__dirname, '.img-cache');
  
  console.log('🔍 Scanning for images in:', publicDir);
  
  // Ensure cache directory exists
  await fs.promises.mkdir(cacheDir, { recursive: true });
  
  // Find all image files
  const imageFiles = await findImageFiles(publicDir);
  console.log(`📸 Found ${imageFiles.length} images to prewarm`);
  
  const formats = [
    { name: 'avif', quality: 55 },
    { name: 'webp', quality: 70 }
  ];
  
  const widths = [320, 640, 960, 1200];
  
  let processed = 0;
  let skipped = 0;
  
  for (const imagePath of imageFiles) {
    const stat = await fs.promises.stat(imagePath);
    
    for (const format of formats) {
      for (const width of widths) {
        // Create cache key (same logic as middleware)
        const cacheKey = [
          imagePath,
          Math.floor(stat.mtimeMs),
          format.name,
          format.quality,
          `w${width}`
        ].join('|');
        
        const cacheName = Buffer.from(cacheKey).toString('hex') + '.' + format.name;
        const outputPath = path.join(cacheDir, cacheName);
        
        // Skip if already cached
        if (fs.existsSync(outputPath)) {
          skipped++;
          continue;
        }
        
        try {
          let pipeline = sharp(imagePath)
            .rotate() // auto-orient
            .resize({
              width: width,
              withoutEnlargement: true
            });
          
          pipeline = format.name === 'avif'
            ? pipeline.avif({ quality: format.quality })
            : pipeline.webp({ quality: format.quality });
          
          await pipeline.toFile(outputPath);
          processed++;
          
          // Progress indicator
          if (processed % 10 === 0) {
            console.log(`⚡ Processed ${processed} variants...`);
          }
          
        } catch (error) {
          console.warn(`❌ Failed to process ${imagePath} (${format.name}@${width}px):`, error.message);
        }
      }
    }
  }
  
  console.log(`✅ Prewarming complete!`);
  console.log(`   📦 Generated: ${processed} new variants`);
  console.log(`   ⏭️  Skipped: ${skipped} existing variants`);
  console.log(`   💾 Cache directory: ${cacheDir}`);
  
  // Show cache size
  try {
    const { exec } = await import('child_process');
    exec(`du -sh "${cacheDir}"`, (error, stdout) => {
      if (!error) {
        console.log(`   💿 Cache size: ${stdout.trim().split('\t')[0]}`);
      }
    });
  } catch (e) {
    // Silent fail for size calculation
  }
}

// Run the prewarming
prewarmImages().catch(console.error);