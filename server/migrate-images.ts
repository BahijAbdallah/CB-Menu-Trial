import { storageClient } from './storage-client';
import fs from 'fs';
import path from 'path';
import { db } from './db';
import { menuItems } from '@shared/schema';
import { eq, like, sql } from 'drizzle-orm';

async function migrateImages() {
  console.log('🚀 Starting image migration to Object Storage...\n');
  
  const attachedAssetsDir = path.join(process.cwd(), 'attached_assets');
  
  // Find all menu item images (all image formats)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  const files = fs.readdirSync(attachedAssetsDir)
    .filter(file => 
      file.startsWith('menu-item-') && 
      imageExtensions.some(ext => file.endsWith(ext))
    );
  
  console.log(`📁 Found ${files.length} images to migrate\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  // Upload each image to Object Storage
  for (const filename of files) {
    const filePath = path.join(attachedAssetsDir, filename);
    const objectKey = `menu-items/${filename}`;
    
    try {
      // Check if file already exists in Object Storage
      const { ok: existsOk } = await storageClient.downloadAsBytes(objectKey);
      
      if (existsOk) {
        console.log(`⏭️  Skipped (already exists): ${filename}`);
        successCount++;
        continue;
      }
      
      // Read the file
      const imageBuffer = fs.readFileSync(filePath);
      
      // Upload to Object Storage
      const { ok, error } = await storageClient.uploadFromBytes(
        objectKey,
        imageBuffer
      );
      
      if (ok) {
        console.log(`✅ Uploaded: ${filename} (${Math.round(imageBuffer.length / 1024)}KB)`);
        successCount++;
      } else {
        console.error(`❌ Failed to upload ${filename}:`, error);
        failCount++;
      }
    } catch (err) {
      console.error(`❌ Error processing ${filename}:`, err);
      failCount++;
    }
  }
  
  console.log(`\n📊 Upload Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📦 Total: ${files.length}\n`);
  
  if (successCount === 0) {
    console.error('⚠️  No images were uploaded. Aborting database update.');
    return;
  }
  
  // Update database URLs
  console.log('🔄 Updating database URLs...\n');
  
  try {
    const result = await db
      .update(menuItems)
      .set({
        imageUrl: sql`REPLACE(image_url, '/attached_assets/', '/api/storage/menu-items/')`
      })
      .where(like(menuItems.imageUrl, '/attached_assets/%'));
    
    console.log('✅ Database updated successfully!\n');
    
    // Verify the update
    const items = await db.select({
      id: menuItems.id,
      name: menuItems.name,
      imageUrl: menuItems.imageUrl
    })
    .from(menuItems)
    .where(like(menuItems.imageUrl, '/api/storage/%'))
    .limit(5);
    
    console.log('📝 Sample updated records:');
    items.forEach((item: { name: string; imageUrl: string | null }) => {
      console.log(`   ${item.name}: ${item.imageUrl}`);
    });
    
    console.log('\n✨ Migration complete! All images are now in Object Storage.\n');
    
  } catch (err) {
    console.error('❌ Database update failed:', err);
  }
}

// Run migration
migrateImages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
