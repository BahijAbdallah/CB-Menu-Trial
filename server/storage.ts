import { 
  users, 
  categories, 
  menuItems,
  halalCertificates,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type HalalCertificate,
  type InsertHalalCertificate
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Menu item methods
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  getMenuItemById(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  toggleMenuItemAvailability(id: number): Promise<MenuItem | undefined>;

  // Halal certificate methods
  getHalalCertificates(): Promise<HalalCertificate[]>;
  getHalalCertificateById(id: number): Promise<HalalCertificate | undefined>;
  createHalalCertificate(certificate: InsertHalalCertificate): Promise<HalalCertificate>;
  updateHalalCertificate(id: number, certificate: Partial<InsertHalalCertificate>): Promise<HalalCertificate | undefined>;
  deleteHalalCertificate(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private menuItems: Map<number, MenuItem>;
  private halalCertificates: Map<number, HalalCertificate>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentMenuItemId: number;
  private currentHalalCertificateId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.menuItems = new Map();
    this.halalCertificates = new Map();
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
        imageUrl: null,
        descriptionArabic: null
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

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { 
      ...category, 
      id,
      nameArabic: category.nameArabic || null,
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
    return Array.from(this.menuItems.values()).sort((a, b) => a.order - b.order);
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentMenuItemId++;
    const newItem: MenuItem = { 
      ...item, 
      id,
      nameArabic: item.nameArabic || null,
      description: item.description || null,
      descriptionArabic: item.descriptionArabic || null,
      imageUrl: item.imageUrl || null,
      order: item.order || 0,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
    };
    this.menuItems.set(id, newItem);
    return newItem;
  }

  async updateMenuItem(id: number, item: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const existing = this.menuItems.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...item };
    this.menuItems.set(id, updated);
    return updated;
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

  // Halal certificate methods
  async getHalalCertificates(): Promise<HalalCertificate[]> {
    return Array.from(this.halalCertificates.values())
      .filter(cert => cert.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getHalalCertificateById(id: number): Promise<HalalCertificate | undefined> {
    return this.halalCertificates.get(id);
  }

  async createHalalCertificate(certificate: InsertHalalCertificate): Promise<HalalCertificate> {
    const id = this.currentHalalCertificateId++;
    const newCertificate: HalalCertificate = { 
      ...certificate, 
      id,
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
    return await db.select().from(menuItems).orderBy(menuItems.order);
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.categoryId, categoryId))
      .orderBy(menuItems.order);
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
    const [updated] = await db
      .update(menuItems)
      .set(item)
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
}

export const storage = new DatabaseStorage();
