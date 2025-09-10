import { pgTable, text, serial, integer, boolean, decimal, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameArabic: text("name_arabic"),
  slug: text("slug").notNull().unique(),
  order: integer("order").notNull().default(0),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameArabic: text("name_arabic"),
  description: text("description"),
  descriptionArabic: text("description_arabic"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  order: integer("order").notNull().default(0),
  allergens: text("allergens").default("[]"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Halal Certificates Table
export const halalCertificates = pgTable("halal_certificates", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
});

export const insertHalalCertificateSchema = createInsertSchema(halalCertificates).omit({
  id: true,
  uploadedAt: true,
});

export type InsertHalalCertificate = z.infer<typeof insertHalalCertificateSchema>;
export type HalalCertificate = typeof halalCertificates.$inferSelect;
