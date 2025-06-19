import { db } from "./db";
import { users, categories, menuItems } from "@shared/schema";

async function initializeDatabase() {
  console.log("🗃️  Initializing database...");

  try {
    // Create admin user
    console.log("👤 Creating admin user...");
    await db.insert(users).values({
      username: "ali@keemya.net",
      password: "ali@keemya.net", // In production, this should be hashed
    }).onConflictDoNothing();

    // Create categories
    console.log("📂 Creating categories...");
    const categoryData = [
      { name: "Breakfast Items", nameArabic: "وجبات الإفطار", slug: "breakfast", order: 1 },
      { name: "Salads", nameArabic: "السلطات", slug: "salads", order: 2 },
      { name: "Hot Appetizers", nameArabic: "المقبلات الساخنة", slug: "hot-appetizers", order: 3 },
      { name: "Cold Appetizers", nameArabic: "المقبلات الباردة", slug: "cold-appetizers", order: 4 },
      { name: "Main Course", nameArabic: "الأطباق الرئيسية", slug: "main-course", order: 5 },
      { name: "Sandwiches & Burgers", nameArabic: "الساندويشات والبرجر", slug: "sandwiches", order: 6 },
      { name: "Plat Du Jour", nameArabic: "طبق اليوم", slug: "plat-du-jour", order: 7 },
      { name: "Desserts", nameArabic: "الحلويات", slug: "desserts", order: 8 },
    ];

    for (const cat of categoryData) {
      await db.insert(categories).values(cat).onConflictDoNothing();
    }

    // Get category IDs for menu items
    const createdCategories = await db.select().from(categories);
    const categoryMap = new Map(createdCategories.map(cat => [cat.slug, cat.id]));

    // Create sample menu items
    console.log("🍽️  Creating menu items...");
    const menuItemsData = [
      // Breakfast Items
      { name: "Goat Labne Sandwich", nameArabic: "ساندويش لبنة الماعز", description: "Fresh goat labneh with cucumber, tomatoes, and mint on artisan bread", price: "12.00", categoryId: categoryMap.get("breakfast")!, isAvailable: true, order: 1 },
      { name: "Avocado Sandwich", nameArabic: "ساندويش الأفوكادو", description: "Smashed avocado with lime, chili flakes, and microgreens", price: "10.00", categoryId: categoryMap.get("breakfast")!, isAvailable: true, order: 2 },
      { name: "Avocado Salmon Sandwich", nameArabic: "ساندويش الأفوكادو والسلمون", description: "Avocado and smoked salmon on toasted bread", price: "16.00", categoryId: categoryMap.get("breakfast")!, isAvailable: true, order: 3 },
      { name: "Croissant (Arrangement of 3)", nameArabic: "كرواسون (3 قطع)", description: "Fresh baked buttery croissants served warm", price: "8.00", categoryId: categoryMap.get("breakfast")!, isAvailable: true, order: 4 },
      { name: "Oriental Breakfast", nameArabic: "فطور شرقي", description: "Goat labneh scoop, vegetables, olives, thyme, halloum & akkawi with bread", price: "18.00", categoryId: categoryMap.get("breakfast")!, isAvailable: true, order: 5 },
      { name: "Continental Breakfast", nameArabic: "فطور أوروبي", description: "Cheese platter, jams, croissants", price: "16.00", categoryId: categoryMap.get("breakfast")!, isAvailable: true, order: 6 },
      { name: "Pancakes", nameArabic: "البان كيك", description: "Fluffy pancakes served with maple syrup and fresh berries", price: "14.00", categoryId: categoryMap.get("breakfast")!, isAvailable: true, order: 7 },
      { name: "Kunafa", nameArabic: "كنافة", description: "Traditional Middle Eastern dessert with cheese and syrup", price: "16.00", categoryId: categoryMap.get("breakfast")!, isAvailable: true, order: 8 },

      // Salads
      { name: "Quinoa Fetta Frisee", nameArabic: "سلطة الكينوا والجبنة", description: "Fresh quinoa salad with feta cheese and frisee lettuce", price: "14.00", categoryId: categoryMap.get("salads")!, isAvailable: true, order: 1 },
      { name: "Kale Salmon Salad", nameArabic: "سلطة الكيل والسلمون", description: "Fresh kale with grilled salmon and vinaigrette", price: "18.00", categoryId: categoryMap.get("salads")!, isAvailable: true, order: 2 },
      { name: "Vista Chicken Salad", nameArabic: "سلطة الدجاج فيستا", description: "Grilled chicken breast with mixed greens and special dressing", price: "16.00", categoryId: categoryMap.get("salads")!, isAvailable: true, order: 3 },
      { name: "Caesar Salad", nameArabic: "سلطة قيصر", description: "Classic Caesar salad with parmesan and croutons", price: "12.00", categoryId: categoryMap.get("salads")!, isAvailable: true, order: 4 },

      // Hot Appetizers
      { name: "Dynamite Beef", nameArabic: "لحم دينامايت", description: "Spicy beef bites with dynamite sauce", price: "16.00", categoryId: categoryMap.get("hot-appetizers")!, isAvailable: true, order: 1 },
      { name: "Fries Add Truffle Sauce", nameArabic: "بطاطا مقلية بصلصة الكمأة", description: "Golden fries with truffle sauce", price: "12.00", categoryId: categoryMap.get("hot-appetizers")!, isAvailable: true, order: 2 },
      { name: "Shrimp Tacos", nameArabic: "تاكو الجمبري", description: "Fresh shrimp tacos with avocado and lime", price: "18.00", categoryId: categoryMap.get("hot-appetizers")!, isAvailable: true, order: 3 },

      // Main Course
      { name: "Grilled Salmon", nameArabic: "سلمون مشوي", description: "Fresh Atlantic salmon grilled to perfection with herbs and citrus", price: "28.00", categoryId: categoryMap.get("main-course")!, isAvailable: true, order: 1 },
      { name: "Chicken Breast", nameArabic: "صدر دجاج", description: "Tender grilled chicken breast with seasonal vegetables", price: "22.00", categoryId: categoryMap.get("main-course")!, isAvailable: true, order: 2 },
      { name: "Beef Filet or Wagyu", nameArabic: "فيليه لحم أو واغيو", description: "Premium beef cut prepared to your preference", price: "45.00", categoryId: categoryMap.get("main-course")!, isAvailable: true, order: 3 },
      { name: "Pasta Truffle", nameArabic: "معكرونة بالكمأة", description: "House-made pasta with truffle sauce and parmesan", price: "32.00", categoryId: categoryMap.get("main-course")!, isAvailable: true, order: 4 },

      // Desserts
      { name: "Cake Dubai", nameArabic: "كيك دبي", description: "Signature Dubai-style chocolate cake", price: "12.00", categoryId: categoryMap.get("desserts")!, isAvailable: true, order: 1 },
      { name: "Tiramisu", nameArabic: "تيراميسو", description: "Classic Italian tiramisu with coffee and mascarpone", price: "10.00", categoryId: categoryMap.get("desserts")!, isAvailable: true, order: 2 },
      { name: "Special Chocolate", nameArabic: "شوكولاتة خاصة", description: "House special chocolate dessert", price: "14.00", categoryId: categoryMap.get("desserts")!, isAvailable: true, order: 3 },
    ];

    for (const item of menuItemsData) {
      await db.insert(menuItems).values({
        ...item,
        imageUrl: null,
        descriptionArabic: null,
      }).onConflictDoNothing();
    }

    console.log("✅ Database initialized successfully!");
    console.log(`📊 Created ${categoryData.length} categories and ${menuItemsData.length} menu items`);
    
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

export { initializeDatabase };

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log("Database initialization complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database initialization failed:", error);
      process.exit(1);
    });
}