import { 
  users, 
  categories, 
  menuItems,
  menuItemCategories,
  halalCertificates,
  settings,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type MenuItemCategory,
  type InsertMenuItemCategory,
  type MenuItemWithCategories,
  type HalalCertificate,
  type InsertHalalCertificate,
  type Setting,
  type InsertSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Menu item methods (legacy - still needed for backward compatibility)
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  getMenuItemById(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  toggleMenuItemAvailability(id: number): Promise<MenuItem | undefined>;
  updateItemsDisplayOrder(categoryId: number, orderedItemIds: number[]): Promise<void>;

  // Menu item - category association methods (new many-to-many)
  getMenuItemsWithCategories(): Promise<MenuItemWithCategories[]>;
  getItemCategories(itemId: number): Promise<MenuItemCategory[]>;
  addItemToCategory(itemId: number, categoryId: number, displayOrder?: number): Promise<void>;
  removeItemFromCategory(itemId: number, categoryId: number): Promise<void>;
  updateItemCategoryOrder(itemId: number, categoryId: number, displayOrder: number): Promise<void>;
  setItemCategories(itemId: number, categoryIds: number[]): Promise<void>;

  // Bulk operations
  clearAllMenuItems(): Promise<void>;
  clearAllCategories(): Promise<void>;

  // Halal certificate methods
  getHalalCertificates(): Promise<HalalCertificate[]>;
  getHalalCertificateById(id: number): Promise<HalalCertificate | undefined>;
  createHalalCertificate(certificate: InsertHalalCertificate): Promise<HalalCertificate>;
  updateHalalCertificate(id: number, certificate: Partial<InsertHalalCertificate>): Promise<HalalCertificate | undefined>;
  deleteHalalCertificate(id: number): Promise<boolean>;

  // Settings methods
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<void>;
  getCategoryOrder(): Promise<string[]>;
  setCategoryOrder(categoryOrder: string[]): Promise<void>;
  getItemOrderByCategory(): Promise<Record<string, string[]>>;
  setItemOrderByCategory(categoryId: string, itemOrder: string[]): Promise<void>;
  deleteItemOrderByCategory(categoryId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private menuItems: Map<number, MenuItem>;
  private halalCertificates: Map<number, HalalCertificate>;
  private settings: Map<string, string>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentMenuItemId: number;
  private currentHalalCertificateId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.menuItems = new Map();
    this.halalCertificates = new Map();
    this.settings = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentMenuItemId = 1;
    this.currentHalalCertificateId = 1;

    // Initialize with default admin user
    this.initializeAdmin();
    // Initialize with default categories and menu items
    this.initializeData();
  }

  private initializeAdmin() {
    const adminUser: User = {
      id: this.currentUserId++,
      username: "ali@keemya.net",
      password: "ali@keemya.net" // In production, this should be hashed
    };
    this.users.set(adminUser.id, adminUser);
  }

  private initializeData() {
    // Create categories
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

    categoryData.forEach(cat => {
      const category: Category = { 
        ...cat, 
        id: this.currentCategoryId++,
        nameArabic: cat.nameArabic || null,
        nameFrench: null,
        order: cat.order || 0
      };
      this.categories.set(category.id, category);
    });

    // Create sample menu items based on the PDF content
    const menuItemsData = [
      // Breakfast Items
      { name: "Goat Labne Sandwich", nameArabic: "ساندويش لبنة الماعز", description: "Fresh goat labneh with cucumber, tomatoes, and mint on artisan bread", price: "12.00", categoryId: 1, isAvailable: true, order: 1 },
      { name: "Avocado Sandwich", nameArabic: "ساندويش الأفوكادو", description: "Smashed avocado with lime, chili flakes, and microgreens", price: "10.00", categoryId: 1, isAvailable: true, order: 2 },
      { name: "Avocado Salmon Sandwich", nameArabic: "ساندويش الأفوكادو والسلمون", description: "Avocado and smoked salmon on toasted bread", price: "16.00", categoryId: 1, isAvailable: true, order: 3 },
      { name: "Croissant (Arrangement of 3)", nameArabic: "كرواسون (3 قطع)", description: "Fresh baked buttery croissants served warm", price: "8.00", categoryId: 1, isAvailable: true, order: 4 },
      { name: "Oriental Breakfast", nameArabic: "فطور شرقي", description: "Goat labneh scoop, vegetables, olives, thyme, halloum & akkawi with bread", price: "18.00", categoryId: 1, isAvailable: true, order: 5 },
      { name: "Continental Breakfast", nameArabic: "فطور أوروبي", description: "Cheese platter, jams, croissants", price: "16.00", categoryId: 1, isAvailable: true, order: 6 },
      { name: "Pancakes", nameArabic: "البان كيك", description: "Fluffy pancakes served with maple syrup and fresh berries", price: "14.00", categoryId: 1, isAvailable: true, order: 7 },
      { name: "Kunafa", nameArabic: "كنافة", description: "Traditional Middle Eastern dessert with cheese and syrup", price: "16.00", categoryId: 1, isAvailable: true, order: 8 },

      // Salads
      { name: "Quinoa Fetta Frisee", nameArabic: "سلطة الكينوا والجبنة", description: "Fresh quinoa salad with feta cheese and frisee lettuce", price: "14.00", categoryId: 2, isAvailable: true, order: 1 },
      { name: "Kale Salmon Salad", nameArabic: "سلطة الكيل والسلمون", description: "Fresh kale with grilled salmon and vinaigrette", price: "18.00", categoryId: 2, isAvailable: true, order: 2 },
      { name: "Vista Chicken Salad", nameArabic: "سلطة الدجاج فيستا", description: "Grilled chicken breast with mixed greens and special dressing", price: "16.00", categoryId: 2, isAvailable: true, order: 3 },
      { name: "Caesar Salad", nameArabic: "سلطة قيصر", description: "Classic Caesar salad with parmesan and croutons", price: "12.00", categoryId: 2, isAvailable: true, order: 4 },

      // Hot Appetizers
      { name: "Dynamite Beef", nameArabic: "لحم دينامايت", description: "Spicy beef bites with dynamite sauce", price: "16.00", categoryId: 3, isAvailable: true, order: 1 },
      { name: "Fries Add Truffle Sauce", nameArabic: "بطاطا مقلية بصلصة الكمأة", description: "Golden fries with truffle sauce", price: "12.00", categoryId: 3, isAvailable: true, order: 2 },
      { name: "Shrimp Tacos", nameArabic: "تاكو الجمبري", description: "Fresh shrimp tacos with avocado and lime", price: "18.00", categoryId: 3, isAvailable: true, order: 3 },

      // Cold Appetizers  
      { name: "Hummus with Pita", nameArabic: "حمص بالخبز", description: "Traditional hummus served with fresh pita bread", price: "10.00", categoryId: 4, isAvailable: true, order: 1 },
      { name: "Tabbouleh Salad", nameArabic: "تبولة", description: "Fresh parsley salad with tomatoes, onions, and bulgur", price: "12.00", categoryId: 4, isAvailable: true, order: 2 },
      { name: "Mixed Olives", nameArabic: "زيتون مشكل", description: "Assorted Lebanese olives with herbs and olive oil", price: "8.00", categoryId: 4, isAvailable: true, order: 3 },
      { name: "Labneh with Olive Oil", nameArabic: "لبنة بزيت الزيتون", description: "Creamy labneh drizzled with olive oil and herbs", price: "9.00", categoryId: 4, isAvailable: true, order: 4 },

      // Main Course
      { name: "Grilled Salmon", nameArabic: "سلمون مشوي", description: "Fresh Atlantic salmon grilled to perfection with herbs and citrus", price: "28.00", categoryId: 5, isAvailable: true, order: 1 },
      { name: "Chicken Breast", nameArabic: "صدر دجاج", description: "Tender grilled chicken breast with seasonal vegetables", price: "22.00", categoryId: 5, isAvailable: true, order: 2 },
      { name: "Beef Filet or Wagyu", nameArabic: "فيليه لحم أو واغيو", description: "Premium beef cut prepared to your preference", price: "45.00", categoryId: 5, isAvailable: true, order: 3 },
      { name: "Pasta Truffle", nameArabic: "معكرونة بالكمأة", description: "House-made pasta with truffle sauce and parmesan", price: "32.00", categoryId: 5, isAvailable: true, order: 4 },

      // Desserts
      { name: "Cake Dubai", nameArabic: "كيك دبي", description: "Signature Dubai-style chocolate cake", price: "12.00", categoryId: 8, isAvailable: true, order: 1 },
      { name: "Tiramisu", nameArabic: "تيراميسو", description: "Classic Italian tiramisu with coffee and mascarpone", price: "10.00", categoryId: 8, isAvailable: true, order: 2 },
      { name: "Special Chocolate", nameArabic: "شوكولاتة خاصة", description: "House special chocolate dessert", price: "14.00", categoryId: 8, isAvailable: true, order: 3 },
    ];

    menuItemsData.forEach(item => {
      const menuItem: MenuItem = { 
        ...item, 
        id: this.currentMenuItemId++,
        nameFrench: null,
        imageUrl: null,
        descriptionArabic: null,
        descriptionFrench: null,
        outOfStock: false,
        displayOrder: null,
        allergens: null
      };
      this.menuItems.set(menuItem.id, menuItem);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { 
      ...category, 
      id,
      nameArabic: category.nameArabic || null,
      nameFrench: category.nameFrench || null,
      order: category.order || 0
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Menu item methods
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).sort((a, b) => {
      // Order by display_order ASC NULLS LAST, then order ASC
      if (a.displayOrder === null && b.displayOrder === null) return a.order - b.order;
      if (a.displayOrder === null) return 1; // a goes after b
      if (b.displayOrder === null) return -1; // a goes before b
      return a.displayOrder - b.displayOrder;
    });
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => {
        // Order by display_order ASC NULLS LAST, then order ASC
        if (a.displayOrder === null && b.displayOrder === null) return a.order - b.order;
        if (a.displayOrder === null) return 1; // a goes after b
        if (b.displayOrder === null) return -1; // a goes before b
        return a.displayOrder - b.displayOrder;
      });
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentMenuItemId++;
    const newItem: MenuItem = { 
      ...item, 
      id,
      categoryId: item.categoryId || null,
      nameArabic: item.nameArabic || null,
      nameFrench: item.nameFrench || null,
      description: item.description || null,
      descriptionArabic: item.descriptionArabic || null,
      descriptionFrench: item.descriptionFrench || null,
      imageUrl: item.imageUrl || null,
      order: item.order || 0,
      displayOrder: null, // Always null initially, managed via junction table
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      outOfStock: item.outOfStock || false,
      allergens: item.allergens || null
    };
    this.menuItems.set(id, newItem);
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const existing = this.menuItems.get(id);
    if (!existing) return undefined;
    
    // Preserve imageUrl only when undefined or empty string (null = explicit clear)
    const updatedItem = { ...existing, ...item };
    if (item.imageUrl === undefined || item.imageUrl === '') {
      updatedItem.imageUrl = existing.imageUrl; // Preserve existing image
    }
    // null = explicit clear, so allow it to overwrite
    
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    return this.menuItems.delete(id);
  }

  async toggleMenuItemAvailability(id: number): Promise<MenuItem | undefined> {
    const existing = this.menuItems.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, isAvailable: !existing.isAvailable };
    this.menuItems.set(id, updated);
    return updated;
  }

  async updateItemsDisplayOrder(categoryId: number, orderedItemIds: number[]): Promise<void> {
    // Validate that all items belong to the category
    for (const itemId of orderedItemIds) {
      const item = this.menuItems.get(itemId);
      if (!item || item.categoryId !== categoryId) {
        throw new Error(`Item ${itemId} does not belong to category ${categoryId}`);
      }
    }
    
    // Update display_order for each item
    orderedItemIds.forEach((itemId, index) => {
      const item = this.menuItems.get(itemId);
      if (item) {
        const updated = { ...item, displayOrder: index + 1 };
        this.menuItems.set(itemId, updated);
      }
    });
  }

  // Halal certificate methods
  async getHalalCertificates(): Promise<HalalCertificate[]> {
    return Array.from(this.halalCertificates.values())
      .filter(cert => cert.isActive)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async getHalalCertificateById(id: number): Promise<HalalCertificate | undefined> {
    return this.halalCertificates.get(id);
  }

  async createHalalCertificate(certificate: InsertHalalCertificate): Promise<HalalCertificate> {
    const id = this.currentHalalCertificateId++;
    const newCertificate: HalalCertificate = { 
      ...certificate, 
      id,
      description: certificate.description || null,
      uploadedAt: new Date(),
      isActive: certificate.isActive !== undefined ? certificate.isActive : true,
      displayOrder: certificate.displayOrder || 0
    };
    this.halalCertificates.set(id, newCertificate);
    return newCertificate;
  }

  async updateHalalCertificate(id: number, certificate: Partial<InsertHalalCertificate>): Promise<HalalCertificate | undefined> {
    const existing = this.halalCertificates.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...certificate };
    this.halalCertificates.set(id, updated);
    return updated;
  }

  async deleteHalalCertificate(id: number): Promise<boolean> {
    return this.halalCertificates.delete(id);
  }

  // Bulk operations
  async clearAllMenuItems(): Promise<void> {
    this.menuItems.clear();
  }

  async clearAllCategories(): Promise<void> {
    this.categories.clear();
  }

  // Settings methods
  async getSetting(key: string): Promise<string | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string): Promise<void> {
    this.settings.set(key, value);
  }

  async getCategoryOrder(): Promise<string[]> {
    const orderJson = this.settings.get('categoryOrder');
    if (!orderJson) return [];
    try {
      return JSON.parse(orderJson);
    } catch {
      return [];
    }
  }

  async setCategoryOrder(categoryOrder: string[]): Promise<void> {
    this.settings.set('categoryOrder', JSON.stringify(categoryOrder));
  }

  async getItemOrderByCategory(): Promise<Record<string, string[]>> {
    const orderJson = this.settings.get('itemOrderByCategory');
    if (!orderJson) return {};
    try {
      return JSON.parse(orderJson);
    } catch {
      return {};
    }
  }

  async setItemOrderByCategory(categoryId: string, itemOrder: string[]): Promise<void> {
    const current = await this.getItemOrderByCategory();
    current[categoryId] = itemOrder;
    this.settings.set('itemOrderByCategory', JSON.stringify(current));
  }

  async deleteItemOrderByCategory(categoryId: string): Promise<void> {
    const current = await this.getItemOrderByCategory();
    delete current[categoryId];
    this.settings.set('itemOrderByCategory', JSON.stringify(current));
  }

  // Many-to-many category association methods - stub implementations for MemStorage
  async getMenuItemsWithCategories(): Promise<MenuItemWithCategories[]> {
    throw new Error("getMenuItemsWithCategories not implemented in MemStorage");
  }

  async getItemCategories(itemId: number): Promise<MenuItemCategory[]> {
    throw new Error("getItemCategories not implemented in MemStorage");
  }

  async addItemToCategory(itemId: number, categoryId: number, displayOrder?: number): Promise<void> {
    throw new Error("addItemToCategory not implemented in MemStorage");
  }

  async removeItemFromCategory(itemId: number, categoryId: number): Promise<void> {
    throw new Error("removeItemFromCategory not implemented in MemStorage");
  }

  async updateItemCategoryOrder(itemId: number, categoryId: number, displayOrder: number): Promise<void> {
    throw new Error("updateItemCategoryOrder not implemented in MemStorage");
  }

  async setItemCategories(itemId: number, categoryIds: number[]): Promise<void> {
    throw new Error("setItemCategories not implemented in MemStorage");
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.order);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems).orderBy(
      sql`${menuItems.displayOrder} NULLS LAST`,
      asc(menuItems.order)
    );
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    // Join with menu_item_categories to get items in this category
    // Order by the junction table's display_order for per-category ordering
    const results = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        nameArabic: menuItems.nameArabic,
        nameFrench: menuItems.nameFrench,
        description: menuItems.description,
        descriptionArabic: menuItems.descriptionArabic,
        descriptionFrench: menuItems.descriptionFrench,
        price: menuItems.price,
        imageUrl: menuItems.imageUrl,
        categoryId: menuItems.categoryId,
        order: menuItems.order,
        isAvailable: menuItems.isAvailable,
        allergens: menuItems.allergens,
        outOfStock: menuItems.outOfStock,
        junctionDisplayOrder: menuItemCategories.displayOrder,
      })
      .from(menuItems)
      .innerJoin(
        menuItemCategories,
        eq(menuItems.id, menuItemCategories.itemId)
      )
      .where(eq(menuItemCategories.categoryId, categoryId))
      .orderBy(
        asc(menuItemCategories.displayOrder),
        asc(menuItems.order)
      );
    
    // Map results back to MenuItem type, using junction displayOrder
    return results.map(({ junctionDisplayOrder, ...item }) => ({
      ...item,
      displayOrder: junctionDisplayOrder, // Use per-category order from junction table
    }));
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item || undefined;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db
      .insert(menuItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    // Get existing item to preserve imageUrl if needed
    const [existing] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    if (!existing) return undefined;

    // Preserve imageUrl only when undefined or empty string (null = explicit clear)
    const updateData = { ...item };
    if (item.imageUrl === undefined || item.imageUrl === '') {
      updateData.imageUrl = existing.imageUrl; // Preserve existing image
    }
    // null = explicit clear, so allow it to overwrite

    const [updated] = await db
      .update(menuItems)
      .set(updateData)
      .where(eq(menuItems.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    const result = await db.delete(menuItems).where(eq(menuItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async toggleMenuItemAvailability(id: number): Promise<MenuItem | undefined> {
    const [current] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    if (!current) return undefined;

    const [updated] = await db
      .update(menuItems)
      .set({ isAvailable: !current.isAvailable })
      .where(eq(menuItems.id, id))
      .returning();
    return updated || undefined;
  }

  async updateItemsDisplayOrder(categoryId: number, orderedItemIds: number[]): Promise<void> {
    // Update display_order in the junction table for per-category ordering
    // This allows items to have different orders in different categories
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedItemIds.length; i++) {
        const itemId = orderedItemIds[i];
        // Update the junction table's display_order for this item in this category
        await tx
          .update(menuItemCategories)
          .set({ displayOrder: i })
          .where(
            and(
              eq(menuItemCategories.itemId, itemId),
              eq(menuItemCategories.categoryId, categoryId)
            )
          );
      }
    });
  }

  // Halal certificate methods
  async getHalalCertificates(): Promise<HalalCertificate[]> {
    return await db.select()
      .from(halalCertificates)
      .where(eq(halalCertificates.isActive, true))
      .orderBy(halalCertificates.displayOrder);
  }

  async getHalalCertificateById(id: number): Promise<HalalCertificate | undefined> {
    const [certificate] = await db.select().from(halalCertificates).where(eq(halalCertificates.id, id));
    return certificate || undefined;
  }

  async createHalalCertificate(certificate: InsertHalalCertificate): Promise<HalalCertificate> {
    const [newCertificate] = await db
      .insert(halalCertificates)
      .values(certificate)
      .returning();
    return newCertificate;
  }

  async updateHalalCertificate(id: number, certificate: Partial<InsertHalalCertificate>): Promise<HalalCertificate | undefined> {
    const [updated] = await db
      .update(halalCertificates)
      .set(certificate)
      .where(eq(halalCertificates.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteHalalCertificate(id: number): Promise<boolean> {
    const result = await db.delete(halalCertificates).where(eq(halalCertificates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Bulk operations
  async clearAllMenuItems(): Promise<void> {
    await db.delete(menuItems);
  }

  async clearAllCategories(): Promise<void> {
    await db.delete(categories);
  }

  // Settings methods
  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() }
      });
  }

  async getCategoryOrder(): Promise<string[]> {
    const orderJson = await this.getSetting('categoryOrder');
    if (!orderJson) return [];
    try {
      return JSON.parse(orderJson);
    } catch {
      return [];
    }
  }

  async setCategoryOrder(categoryOrder: string[]): Promise<void> {
    await this.setSetting('categoryOrder', JSON.stringify(categoryOrder));
  }

  async getItemOrderByCategory(): Promise<Record<string, string[]>> {
    const orderJson = await this.getSetting('itemOrderByCategory');
    if (!orderJson) return {};
    try {
      return JSON.parse(orderJson);
    } catch {
      return {};
    }
  }

  async setItemOrderByCategory(categoryId: string, itemOrder: string[]): Promise<void> {
    const current = await this.getItemOrderByCategory();
    current[categoryId] = itemOrder;
    await this.setSetting('itemOrderByCategory', JSON.stringify(current));
  }

  async deleteItemOrderByCategory(categoryId: string): Promise<void> {
    const current = await this.getItemOrderByCategory();
    delete current[categoryId];
    await this.setSetting('itemOrderByCategory', JSON.stringify(current));
  }

  // Many-to-many category association methods
  async getMenuItemsWithCategories(): Promise<MenuItemWithCategories[]> {
    // Get all menu items
    const items = await db.select().from(menuItems).orderBy(
      sql`${menuItems.displayOrder} NULLS LAST`,
      asc(menuItems.order)
    );

    // Get all category associations
    const associations = await db.select().from(menuItemCategories).orderBy(menuItemCategories.displayOrder);

    // Group associations by itemId
    const associationsByItem = new Map<number, Array<{ categoryId: number; displayOrder: number }>>();
    for (const assoc of associations) {
      if (!associationsByItem.has(assoc.itemId)) {
        associationsByItem.set(assoc.itemId, []);
      }
      associationsByItem.get(assoc.itemId)!.push({
        categoryId: assoc.categoryId,
        displayOrder: assoc.displayOrder
      });
    }

    // Combine items with their categories
    return items.map(item => ({
      ...item,
      categories: associationsByItem.get(item.id) || []
    }));
  }

  async getItemCategories(itemId: number): Promise<MenuItemCategory[]> {
    return await db
      .select()
      .from(menuItemCategories)
      .where(eq(menuItemCategories.itemId, itemId))
      .orderBy(menuItemCategories.displayOrder);
  }

  async addItemToCategory(itemId: number, categoryId: number, displayOrder?: number): Promise<void> {
    try {
      await db
        .insert(menuItemCategories)
        .values({
          itemId,
          categoryId,
          displayOrder: displayOrder ?? 0
        });
    } catch (error) {
      // Handle duplicate entry error
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        throw new Error(`Item ${itemId} is already associated with category ${categoryId}`);
      }
      throw error;
    }
  }

  async removeItemFromCategory(itemId: number, categoryId: number): Promise<void> {
    const result = await db
      .delete(menuItemCategories)
      .where(
        and(
          eq(menuItemCategories.itemId, itemId),
          eq(menuItemCategories.categoryId, categoryId)
        )
      );
    
    if ((result.rowCount ?? 0) === 0) {
      throw new Error(`No association found between item ${itemId} and category ${categoryId}`);
    }
  }

  async updateItemCategoryOrder(itemId: number, categoryId: number, displayOrder: number): Promise<void> {
    const result = await db
      .update(menuItemCategories)
      .set({ displayOrder })
      .where(
        and(
          eq(menuItemCategories.itemId, itemId),
          eq(menuItemCategories.categoryId, categoryId)
        )
      );
    
    if ((result.rowCount ?? 0) === 0) {
      throw new Error(`No association found between item ${itemId} and category ${categoryId}`);
    }
  }

  async setItemCategories(itemId: number, categoryIds: number[]): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete all existing associations for this item
      await tx.delete(menuItemCategories).where(eq(menuItemCategories.itemId, itemId));
      
      // Insert new associations
      if (categoryIds.length > 0) {
        const values = categoryIds.map((categoryId, index) => ({
          itemId,
          categoryId,
          displayOrder: index
        }));
        
        await tx.insert(menuItemCategories).values(values);
      }
    });
  }
}

export const storage = new DatabaseStorage();
