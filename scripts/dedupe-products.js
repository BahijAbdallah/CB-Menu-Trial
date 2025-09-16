#!/usr/bin/env node

/**
 * TASK 2 - Duplicate Product Detection and Removal System
 * Detects and removes duplicate menu items based on normalized names
 * Keeps the best record (with image or oldest)
 */

import { db } from '../server/db.js';
import { menuItems } from '../shared/schema.js';
import { eq, sql } from 'drizzle-orm';

console.log('🔍 TASK 2 - Duplicate Product Detection System');
console.log('================================================');

// Database detection
console.log('📊 Database: PostgreSQL (Neon serverless)');

async function detectDuplicates() {
  console.log('\n📋 DUPLICATE DETECTION REPORT');
  console.log('===============================');
  
  // Get all items with duplicate names (normalized)
  const duplicateGroups = await db.execute(sql`
    WITH normalized_items AS (
      SELECT 
        id,
        name,
        LOWER(TRIM(name)) as normalized_name,
        image_url,
        CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 ELSE 0 END as has_image,
        category_id,
        price
      FROM menu_items
    ),
    duplicate_candidates AS (
      SELECT 
        normalized_name,
        COUNT(*) as count
      FROM normalized_items
      GROUP BY normalized_name
      HAVING COUNT(*) > 1
    )
    SELECT 
      ni.id,
      ni.name as name_original,
      ni.normalized_name,
      ni.has_image,
      ni.image_url,
      dc.count as total_duplicates
    FROM normalized_items ni
    JOIN duplicate_candidates dc ON ni.normalized_name = dc.normalized_name
    ORDER BY ni.normalized_name, ni.has_image DESC, ni.id ASC
  `);

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicates found! Database is clean.');
    return { duplicates: [], totalItems: await getTotalCount() };
  }

  console.log(`Found ${duplicateGroups.length} duplicate items:`);
  console.log('\nDuplicate Report:');
  console.log('ID    | Name                      | Has Image | Image URL');
  console.log('------|---------------------------|-----------|----------');
  
  duplicateGroups.forEach(item => {
    console.log(`${String(item.id).padEnd(5)} | ${String(item.name_original).padEnd(25)} | ${item.has_image ? 'YES      ' : 'NO       '} | ${item.image_url || 'null'}`);
  });

  return { duplicates: duplicateGroups, totalItems: await getTotalCount() };
}

async function getTotalCount() {
  const result = await db.execute(sql`SELECT COUNT(*) as count FROM menu_items`);
  return result[0].count;
}

async function removeDuplicates(dryRun = true) {
  console.log(`\n🧹 DEDUPLICATION ${dryRun ? '(DRY RUN)' : '(LIVE)'}`);
  console.log('==============================');

  if (dryRun) {
    console.log('📝 This is a dry run - no actual deletions will be performed');
  }

  // PostgreSQL query to find duplicates and determine which to keep
  const duplicateAnalysis = await db.execute(sql`
    WITH normalized_items AS (
      SELECT 
        id,
        name,
        LOWER(TRIM(name)) as normalized_name,
        image_url,
        CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 ELSE 0 END as has_image,
        category_id
      FROM menu_items
    ),
    ranked_items AS (
      SELECT 
        id,
        name,
        normalized_name,
        has_image,
        image_url,
        ROW_NUMBER() OVER (
          PARTITION BY normalized_name 
          ORDER BY has_image DESC, id ASC
        ) as rank,
        COUNT(*) OVER (PARTITION BY normalized_name) as group_size
      FROM normalized_items
    )
    SELECT 
      id,
      name,
      normalized_name,
      has_image,
      image_url,
      rank,
      group_size,
      CASE WHEN rank = 1 THEN 'KEEP' ELSE 'DELETE' END as action
    FROM ranked_items
    WHERE group_size > 1
    ORDER BY normalized_name, rank
  `);

  if (duplicateAnalysis.length === 0) {
    console.log('✅ No duplicates to process');
    return { kept: 0, deleted: 0 };
  }

  const toKeep = duplicateAnalysis.filter(item => item.action === 'KEEP');
  const toDelete = duplicateAnalysis.filter(item => item.action === 'DELETE');

  console.log('\nDeduplication Plan:');
  console.log('Action | ID    | Name                      | Has Image | Reason');
  console.log('-------|-------|---------------------------|-----------|-------');
  
  duplicateAnalysis.forEach(item => {
    const reason = item.rank === 1 ? (item.has_image ? 'Has image' : 'Oldest ID') : 'Duplicate';
    console.log(`${item.action.padEnd(6)} | ${String(item.id).padEnd(5)} | ${String(item.name).padEnd(25)} | ${item.has_image ? 'YES      ' : 'NO       '} | ${reason}`);
  });

  if (!dryRun && toDelete.length > 0) {
    console.log('\n🗑️  Executing deletions...');
    for (const item of toDelete) {
      console.log(`Deleting item ${item.id}: ${item.name}`);
      await db.delete(menuItems).where(eq(menuItems.id, item.id));
    }
  }

  return { kept: toKeep.length, deleted: toDelete.length };
}

async function verifyImages() {
  console.log('\n🖼️  IMAGE VERIFICATION');
  console.log('======================');
  
  // Sample 10 random items with images
  const itemsWithImages = await db.execute(sql`
    SELECT id, name, image_url 
    FROM menu_items 
    WHERE image_url IS NOT NULL AND image_url != ''
    ORDER BY RANDOM()
    LIMIT 10
  `);

  console.log('Sample items with images:');
  console.log('ID    | Name                      | Image URL');
  console.log('------|---------------------------|----------');
  
  itemsWithImages.forEach(item => {
    console.log(`${String(item.id).padEnd(5)} | ${String(item.name).padEnd(25)} | ${item.image_url}`);
  });

  // Verify web paths
  const webPathItems = itemsWithImages.filter(item => 
    item.image_url && (item.image_url.startsWith('/attached_assets/') || item.image_url.startsWith('/menu/'))
  );
  
  console.log(`\n✅ ${webPathItems.length}/${itemsWithImages.length} items use proper web paths`);
  
  return itemsWithImages;
}

// Main execution
async function main() {
  try {
    // Step 1: Detect duplicates
    const detection = await detectDuplicates();
    
    // Step 2: Show deduplication plan (dry run)
    const dryRunResult = await removeDuplicates(true);
    
    // Step 3: Execute deduplication if duplicates exist
    if (detection.duplicates.length > 0) {
      console.log('\n❓ Execute live deduplication? (This would run in production)');
      console.log('For this demo, skipping live execution...');
      // const liveResult = await removeDuplicates(false);
    }
    
    // Step 4: Verify images
    await verifyImages();
    
    // Step 5: Final count
    const finalCount = await getTotalCount();
    console.log(`\n📊 Final item count: ${finalCount}`);
    
    // Step 6: Check for remaining duplicates
    const remainingDuplicates = await detectDuplicates();
    if (remainingDuplicates.duplicates.length === 0) {
      console.log('✅ No remaining duplicates - database is clean!');
    }
    
    console.log('\n🎯 TASK 2 COMPLETED - Duplicate detection system implemented');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { detectDuplicates, removeDuplicates, verifyImages };