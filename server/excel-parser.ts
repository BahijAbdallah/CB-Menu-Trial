import { read, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';

export interface ExcelMenuItem {
  itemName: string;
  itemDescription: string;
  price: number;
  allergies: string;
  category?: string;
}

export interface ParsedMenuItem {
  name: string;
  description: string;
  price: number;
  allergens: string[];
  category: string;
}

// Allergy code mappings based on user requirements
const ALLERGY_MAPPINGS: Record<string, string> = {
  'G': 'gluten',
  'D': 'dairy',
  'S': 'sesame',
  'SOY': 'soy',
  'F': 'fish',
  'P': 'peanuts',
  'N': 'nuts',
  'P/N': 'peanuts'
};

// Category assignment patterns
const CATEGORY_PATTERNS = {
  'Breakfast': ['eggs', 'pancakes', 'benedict', 'croissant', 'continental', 'oriental', 'yogurt', 'breakfast'],
  'Sandwiches': ['halloumi', 'labne', 'chicken', 'burger', 'wrap', 'sandwich'],
  'Desserts': ['kunafa', 'cake', 'pastries', 'sweet', 'chocolate', 'dessert'],
  'Drinks': ['coffee', 'tea', 'juice', 'smoothie', 'drink', 'beverage'],
  'Salads': ['salad', 'frisee', 'quinoa', 'arugula'],
  'Main Courses': ['salmon', 'tuna', 'beef', 'lamb', 'shrimp', 'grilled'],
  'Appetizers': ['hummus', 'baba', 'meze', 'appetizer', 'starter']
};

function parseAllergies(allergyString: string): string[] {
  if (!allergyString || allergyString.trim() === '') {
    return [];
  }
  
  const codes = allergyString.split(/[,\s]+/).filter(code => code.trim() !== '');
  return codes.map(code => {
    const trimmedCode = code.trim().toUpperCase();
    return ALLERGY_MAPPINGS[trimmedCode] || trimmedCode.toLowerCase();
  }).filter(Boolean);
}

function assignCategory(itemName: string, itemDescription: string, existingCategory?: string): string {
  // If category is already provided in the Excel, use it
  if (existingCategory && existingCategory.trim() !== '') {
    return existingCategory.trim();
  }
  
  const combinedText = `${itemName} ${itemDescription}`.toLowerCase();
  
  // Check each category pattern
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some(pattern => combinedText.includes(pattern))) {
      return category;
    }
  }
  
  return 'Other';
}

export function parseExcelFile(filePath: string): ParsedMenuItem[] {
  try {
    // Read the Excel file
    const data = fs.readFileSync(filePath);
    const workbook = read(data, { type: 'buffer' });
    
    // Get the "Menu" sheet
    if (!workbook.SheetNames.includes('Menu')) {
      throw new Error('Excel file must contain a sheet named "Menu"');
    }
    
    const worksheet = workbook.Sheets['Menu'];
    
    // Convert to JSON
    const rawData: any[] = utils.sheet_to_json(worksheet, { header: 1 });
    
    if (rawData.length < 2) {
      throw new Error('Excel file must contain at least a header row and one data row');
    }
    
    // Get headers
    const headers = rawData[0].map((h: any) => h?.toString().trim() || '');
    
    // Find column indices
    const itemNameIndex = headers.findIndex((h: string) => 
      h.toLowerCase().includes('item name') || h.toLowerCase().includes('name')
    );
    const itemDescriptionIndex = headers.findIndex((h: string) => 
      h.toLowerCase().includes('item description') || h.toLowerCase().includes('description')
    );
    const priceIndex = headers.findIndex((h: string) => 
      h.toLowerCase().includes('price') || h.toLowerCase().trim() === 'price'
    );
    const allergiesIndex = headers.findIndex((h: string) => 
      h.toLowerCase().includes('allergies') || h.toLowerCase().includes('allergy')
    );
    const categoryIndex = headers.findIndex((h: string) => 
      h.toLowerCase().includes('category')
    );
    
    if (itemNameIndex === -1) {
      throw new Error('Could not find "Item Name" column in Excel file');
    }
    if (itemDescriptionIndex === -1) {
      throw new Error('Could not find "Item Description" column in Excel file');
    }
    if (priceIndex === -1) {
      throw new Error('Could not find "Price" column in Excel file');
    }
    
    console.log('Found columns:', {
      itemName: itemNameIndex,
      itemDescription: itemDescriptionIndex,
      price: priceIndex,
      allergies: allergiesIndex,
      category: categoryIndex
    });
    
    // Parse data rows
    const parsedItems: ParsedMenuItem[] = [];
    
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[itemNameIndex]) {
        continue;
      }
      
      const itemName = row[itemNameIndex]?.toString().trim();
      const itemDescription = row[itemDescriptionIndex]?.toString().trim() || '';
      const priceValue = row[priceIndex];
      const allergiesValue = row[allergiesIndex]?.toString().trim() || '';
      const categoryValue = categoryIndex >= 0 ? row[categoryIndex]?.toString().trim() : '';
      
      // Skip if essential fields are missing
      if (!itemName) {
        console.warn(`Skipping row ${i + 1}: Missing item name`);
        continue;
      }
      
      // Parse price
      let price = 0;
      if (typeof priceValue === 'number') {
        price = priceValue;
      } else if (typeof priceValue === 'string') {
        // Remove currency symbols and spaces, then parse
        const cleanPrice = priceValue.replace(/[^0-9.]/g, '');
        price = parseFloat(cleanPrice) || 0;
      }
      
      if (price <= 0) {
        console.warn(`Skipping row ${i + 1}: Invalid price for "${itemName}"`);
        continue;
      }
      
      // Parse allergies
      const allergens = parseAllergies(allergiesValue);
      
      // Assign category
      const category = assignCategory(itemName, itemDescription, categoryValue);
      
      parsedItems.push({
        name: itemName,
        description: itemDescription,
        price: price,
        allergens: allergens,
        category: category
      });
    }
    
    console.log(`Successfully parsed ${parsedItems.length} menu items from Excel file`);
    return parsedItems;
    
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw error;
  }
}

export function getUploadedExcelFile(): string | null {
  const attachedAssetsDir = path.join(process.cwd(), 'attached_assets');
  
  if (!fs.existsSync(attachedAssetsDir)) {
    return null;
  }
  
  const files = fs.readdirSync(attachedAssetsDir);
  const excelFile = files.find(file => 
    file.includes('Menu') && file.includes('WO Cost') && 
    (file.endsWith('.xlsx') || file.endsWith('.xls'))
  );
  
  return excelFile ? path.join(attachedAssetsDir, excelFile) : null;
}