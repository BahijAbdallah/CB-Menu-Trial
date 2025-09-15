#!/usr/bin/env tsx

import * as XLSX from 'xlsx';
import { db } from '../server/db';
import { categories, menuItems } from '../shared/schema';
import { eq } from 'drizzle-orm';
import path from 'path';

interface ExcelRow {
  Name: string;
  Description: string;
  Price: number | string;
  Category: string;
  Allergy: string;
  Image?: string;
}

interface ProcessedItem {
  name: string;
  description: string;
  price: string;
  categoryName: string;
  allergens: string[];
  imageUrl?: string;
}

async function readExcelFile(filePath: string): Promise<ExcelRow[]> {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Read first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON, using first row as headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
    
    console.log(`Found ${jsonData.length} rows in Excel file`);
    console.log('Sample row:', jsonData[0]);
    
    return jsonData;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
}

function processExcelData(rawData: ExcelRow[]): ProcessedItem[] {
  return rawData.map((row, index) => {
    // Parse allergens from comma/semicolon separated string
    const allergenString = row.Allergy || '';
    const allergens = allergenString
      .split(/[,;]/)
      .map(a => a.trim())
      .filter(a => a.length > 0);

    // Ensure price is a string with 2 decimal places
    let price = '0.00';
    if (typeof row.Price === 'number') {
      price = row.Price.toFixed(2);
    } else if (typeof row.Price === 'string') {
      const parsedPrice = parseFloat(row.Price.replace(/[^0-9.]/g, ''));
      price = isNaN(parsedPrice) ? '0.00' : parsedPrice.toFixed(2);
    }

    const processedItem: ProcessedItem = {
      name: row.Name || `Item ${index + 1}`,
      description: row.Description || '',
      price,
      categoryName: row.Category || 'Uncategorized',
      allergens,
      imageUrl: row.Image || undefined
    };

    return processedItem;
  });
}

async function createOrGetCategory(categoryName: string): Promise<number> {
  try {
    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, categoryName))
      .limit(1);

    if (existingCategory.length > 0) {
      return existingCategory[0].id;
    }

    // Create new category
    const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory = await db
      .insert(categories)
      .values({
        name: categoryName,
        slug,
        order: 0
      })
      .returning();

    console.log(`Created new category: ${categoryName}`);
    return newCategory[0].id;
  } catch (error) {
    console.error(`Error creating category ${categoryName}:`, error);
    throw error;
  }
}

async function clearExistingData(): Promise<void> {
  console.log('Clearing existing menu items and categories...');
  
  try {
    // Delete all menu items first (due to foreign key constraints)
    await db.delete(menuItems);
    console.log('Cleared all menu items');
    
    // Delete all categories
    await db.delete(categories);
    console.log('Cleared all categories');
  } catch (error) {
    console.error('Error clearing existing data:', error);
    throw error;
  }
}

async function importMenuItems(items: ProcessedItem[]): Promise<void> {
  console.log(`Importing ${items.length} menu items...`);
  
  // Group items by category to create categories first
  const categoryNames = [...new Set(items.map(item => item.categoryName))];
  const categoryMap = new Map<string, number>();
  
  // Create all categories
  for (const categoryName of categoryNames) {
    const categoryId = await createOrGetCategory(categoryName);
    categoryMap.set(categoryName, categoryId);
  }
  
  // Create menu items
  for (const item of items) {
    const categoryId = categoryMap.get(item.categoryName);
    if (!categoryId) {
      console.error(`Category not found for item: ${item.name}`);
      continue;
    }
    
    try {
      await db.insert(menuItems).values({
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId,
        imageUrl: item.imageUrl || null,
        allergens: JSON.stringify(item.allergens),
        isAvailable: true,
        outOfStock: false,
        order: 0
      });
      
      console.log(`Imported: ${item.name} (${item.categoryName})`);
    } catch (error) {
      console.error(`Error importing item ${item.name}:`, error);
    }
  }
}

async function main() {
  try {
    const excelFilePath = path.join(process.cwd(), 'attached_assets', 'Copy of Menu - WO Cost(1)_1757964092594.xlsx');
    
    console.log('Starting product import...');
    console.log(`Excel file path: ${excelFilePath}`);
    
    // Read Excel file
    const rawData = await readExcelFile(excelFilePath);
    
    if (rawData.length === 0) {
      console.log('No data found in Excel file');
      return;
    }
    
    // Process the data
    const processedItems = processExcelData(rawData);
    console.log(`Processed ${processedItems.length} items`);
    
    // Clear existing data
    await clearExistingData();
    
    // Import new data
    await importMenuItems(processedItems);
    
    console.log('Import completed successfully!');
    console.log(`Total items imported: ${processedItems.length}`);
    console.log(`Categories created: ${[...new Set(processedItems.map(i => i.categoryName))].length}`);
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run the import
main();