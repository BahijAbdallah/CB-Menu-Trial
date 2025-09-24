#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import glob from 'fast-glob';

const IMAGES_DIR = 'public/images/menu';
const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png'];

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...');
  
  try {
    // Find all image files in the menu directory
    const imagePattern = `${IMAGES_DIR}/**/*.{${SUPPORTED_FORMATS.join(',')}}`;
    const imagePaths = await glob(imagePattern, { caseSensitive: false });
    
    console.log(`Found ${imagePaths.length} images to optimize`);
    
    let processedCount = 0;
    let skippedCount = 0;
    
    for (const imagePath of imagePaths) {
      try {
        const { dir, name, ext } = path.parse(imagePath);
        const webpPath = path.join(dir, `${name}.webp`);
        const avifPath = path.join(dir, `${name}.avif`);
        
        // Check if optimized versions already exist
        const webpExists = await fileExists(webpPath);
        const avifExists = await fileExists(avifPath);
        
        if (webpExists && avifExists) {
          console.log(`⏭️  Skipping ${path.basename(imagePath)} (optimized versions already exist)`);
          skippedCount++;
          continue;
        }
        
        console.log(`📷  Processing ${path.basename(imagePath)}...`);
        
        // Load the original image to get dimensions
        const image = sharp(imagePath);
        const metadata = await image.metadata();
        
        // Generate WebP version if it doesn't exist
        if (!webpExists) {
          await image
            .clone()
            .webp({ 
              quality: 85,
              effort: 6 
            })
            .toFile(webpPath);
          console.log(`  ✅ Created ${path.basename(webpPath)}`);
        }
        
        // Generate AVIF version if it doesn't exist
        if (!avifExists) {
          await image
            .clone()
            .avif({ 
              quality: 80,
              effort: 9 
            })
            .toFile(avifPath);
          console.log(`  ✅ Created ${path.basename(avifPath)}`);
        }
        
        processedCount++;
        
      } catch (error) {
        console.error(`❌ Error processing ${imagePath}:`, error.message);
      }
    }
    
    console.log('\n🎉 Image optimization complete!');
    console.log(`📊 Results: ${processedCount} processed, ${skippedCount} skipped`);
    
  } catch (error) {
    console.error('❌ Error during image optimization:', error.message);
    process.exit(1);
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Run the optimization
optimizeImages();