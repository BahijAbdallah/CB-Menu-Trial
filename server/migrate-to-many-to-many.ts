import { db } from "./db";
import { menuItems, menuItemCategories } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * Migration script to convert from single category to many-to-many categories
 * This populates the menu_item_categories junction table from existing categoryId data
 */
async function migrateToManyToMany() {
  console.log("Starting migration to many-to-many categories...");

  try {
    // First, create the junction table if it doesn't exist
    console.log("Ensuring junction table exists...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS menu_item_categories (
        id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        UNIQUE(item_id, category_id)
      )
    `);

    // Get all menu items with their current categoryId
    const items = await db.select().from(menuItems);
    console.log(`Found ${items.length} menu items to migrate`);

    // Insert into junction table
    let migratedCount = 0;
    for (const item of items) {
      if (item.categoryId) {
        try {
          await db.insert(menuItemCategories).values({
            itemId: item.id,
            categoryId: item.categoryId,
            displayOrder: item.displayOrder ?? item.order ?? 0,
          }).onConflictDoNothing();
          migratedCount++;
        } catch (error) {
          console.error(`Error migrating item ${item.id}:`, error);
        }
      }
    }

    console.log(`Successfully migrated ${migratedCount} item-category associations`);
    console.log("Migration complete!");
    
    // Note: We keep the categoryId column for now for backward compatibility
    // It can be dropped later once all code is updated

  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration
migrateToManyToMany()
  .then(() => {
    console.log("✓ Migration successful");
    process.exit(0);
  })
  .catch((error) => {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  });
