#!/usr/bin/env tsx

import { db } from '../server/db';
import { menuItems } from '../shared/schema';
import { eq, inArray } from 'drizzle-orm';

/**
 * Safe category move script that preserves images
 * Usage: npm run tsx scripts/preserve-images-during-category-move.ts <productIds> <newCategoryId>
 */

interface ProductBeforeMove {
  id: number;
  name: string;
  imageUrl: string | null;
  categoryId: number;
}

async function safeCategoryMove(productIds: number[], newCategoryId: number): Promise<void> {
  console.log(`🔒 Starting safe category move for products: ${productIds.join(', ')}`);
  console.log(`📁 Moving to category ID: ${newCategoryId}`);
  
  try {
    // Step 1: Backup current product data
    console.log('📦 Backing up current product data...');
    const currentProducts = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        imageUrl: menuItems.imageUrl,
        categoryId: menuItems.categoryId,
      })
      .from(menuItems)
      .where(inArray(menuItems.id, productIds));

    if (currentProducts.length !== productIds.length) {
      throw new Error(`Found ${currentProducts.length} products, expected ${productIds.length}`);
    }

    console.log('📸 Current product state:');
    currentProducts.forEach(product => {
      console.log(`  - ${product.name} (ID: ${product.id}): ${product.imageUrl || 'NO IMAGE'}`);
    });

    // Step 2: Perform the category move while preserving images
    console.log('🔄 Updating category assignments...');
    
    for (const product of currentProducts) {
      await db
        .update(menuItems)
        .set({ 
          categoryId: newCategoryId,
          // Explicitly preserve the image URL
          imageUrl: product.imageUrl
        })
        .where(eq(menuItems.id, product.id));
    }

    // Step 3: Verify the move was successful
    console.log('✅ Verifying the move...');
    const updatedProducts = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        imageUrl: menuItems.imageUrl,
        categoryId: menuItems.categoryId,
      })
      .from(menuItems)
      .where(inArray(menuItems.id, productIds));

    console.log('📸 Updated product state:');
    let preservationSuccess = true;
    
    updatedProducts.forEach((updated, index) => {
      const original = currentProducts[index];
      console.log(`  - ${updated.name} (ID: ${updated.id}): ${updated.imageUrl || 'NO IMAGE'}`);
      
      // Check if image was preserved
      if (original.imageUrl !== updated.imageUrl) {
        console.error(`❌ Image NOT preserved for ${updated.name}!`);
        console.error(`   Original: ${original.imageUrl}`);
        console.error(`   Updated:  ${updated.imageUrl}`);
        preservationSuccess = false;
      }
      
      // Check if category was updated
      if (updated.categoryId !== newCategoryId) {
        console.error(`❌ Category NOT updated for ${updated.name}!`);
        preservationSuccess = false;
      }
    });

    if (preservationSuccess) {
      console.log('🎉 Category move completed successfully with all images preserved!');
    } else {
      throw new Error('Category move failed - images were not properly preserved');
    }

  } catch (error) {
    console.error('💥 Category move failed:', error);
    throw error;
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: npm run tsx scripts/preserve-images-during-category-move.ts <productIds> <newCategoryId>');
    console.error('Example: npm run tsx scripts/preserve-images-during-category-move.ts "487,488,489" 52');
    process.exit(1);
  }

  const productIds = args[0].split(',').map(id => parseInt(id.trim()));
  const newCategoryId = parseInt(args[1]);

  if (productIds.some(id => isNaN(id)) || isNaN(newCategoryId)) {
    console.error('❌ All IDs must be valid numbers');
    process.exit(1);
  }

  try {
    await safeCategoryMove(productIds, newCategoryId);
    console.log('✨ Script completed successfully!');
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { safeCategoryMove };

// Run if called directly
if (require.main === module) {
  main();
}