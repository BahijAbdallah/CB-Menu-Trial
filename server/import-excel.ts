import { parseExcelFile, getUploadedExcelFile, type ParsedMenuItem } from './excel-parser';
import { storage } from './storage';

export async function importExcelMenu(): Promise<{ success: boolean; message: string; itemsImported: number }> {
  try {
    // Find the uploaded Excel file
    const excelFilePath = getUploadedExcelFile();
    if (!excelFilePath) {
      return {
        success: false,
        message: 'No Excel file found. Please upload Menu - WO Cost.xlsx',
        itemsImported: 0
      };
    }
    
    console.log('Found Excel file:', excelFilePath);
    
    // Parse the Excel file
    const parsedItems = parseExcelFile(excelFilePath);
    
    if (parsedItems.length === 0) {
      return {
        success: false,
        message: 'No valid menu items found in Excel file',
        itemsImported: 0
      };
    }
    
    console.log(`Parsed ${parsedItems.length} items from Excel`);
    
    // Clear existing data
    console.log('Clearing existing menu items and categories...');
    await storage.clearAllMenuItems();
    await storage.clearAllCategories();
    
    // Get unique categories from parsed items
    const categorySet = new Set(parsedItems.map(item => item.category));
    const uniqueCategories = Array.from(categorySet);
    
    // Create categories first
    console.log('Creating categories:', uniqueCategories);
    const categoryMap = new Map<string, number>();
    
    for (let i = 0; i < uniqueCategories.length; i++) {
      const categoryName = uniqueCategories[i];
      const category = await storage.createCategory({
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
        nameArabic: categoryName, // Will be translated later if needed
        order: i + 1
      });
      categoryMap.set(categoryName, category.id);
    }
    
    // Import menu items
    console.log('Importing menu items...');
    let itemsImported = 0;
    
    for (const item of parsedItems) {
      const categoryId = categoryMap.get(item.category);
      if (!categoryId) {
        console.warn(`Category not found for item: ${item.name}`);
        continue;
      }
      
      try {
        await storage.createMenuItem({
          name: item.name,
          nameArabic: item.name, // Will be translated later if needed
          description: item.description,
          descriptionArabic: item.description, // Will be translated later if needed
          price: item.price.toString(),
          categoryId: categoryId,
          allergens: item.allergens.join(','),
          isAvailable: true,
          imageUrl: null // Will be added later via admin panel
        });
        
        itemsImported++;
      } catch (error) {
        console.error(`Error importing item "${item.name}":`, error);
      }
    }
    
    console.log(`Successfully imported ${itemsImported} menu items`);
    
    return {
      success: true,
      message: `Successfully imported ${itemsImported} menu items and ${uniqueCategories.length} categories`,
      itemsImported: itemsImported
    };
    
  } catch (error) {
    console.error('Error during Excel import:', error);
    return {
      success: false,
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      itemsImported: 0
    };
  }
}