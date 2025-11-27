# Restaurant Menu Management System - Complete Technical Blueprint

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [File Structure](#2-file-structure)
3. [Database Schema](#3-database-schema)
4. [Object Storage](#4-object-storage)
5. [Backend API](#5-backend-api)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Customer Menu Page](#7-customer-menu-page)
8. [Admin Panel](#8-admin-panel)
9. [Lazy Loading System](#9-lazy-loading-system)
10. [Internationalization](#10-internationalization)
11. [Dependencies](#11-dependencies)
12. [Implementation Steps](#12-implementation-steps)

---

## 1. Project Overview

A full-stack restaurant menu management system featuring:
- Customer-facing multilingual menu (English, Arabic, French)
- Admin dashboard for menu management
- Many-to-many category-item relationships
- Drag-and-drop ordering per category
- Professional lazy loading for images
- Object storage for image persistence

**Tech Stack:**
- Frontend: React + TypeScript + Vite
- Backend: Express.js + TypeScript
- Database: PostgreSQL with Drizzle ORM
- Styling: Tailwind CSS + shadcn/ui
- State Management: TanStack React Query

---

## 2. File Structure

```
project/
│
├── shared/
│   └── schema.ts                    # Database models + Zod validation
│
├── server/
│   ├── index.ts                     # Express server entry point
│   ├── routes.ts                    # All API endpoints
│   ├── storage.ts                   # IStorage interface + implementation
│   ├── storage-client.ts            # Object storage client (images)
│   ├── db.ts                        # Drizzle database connection
│   └── vite.ts                      # Vite dev server integration
│
├── client/
│   └── src/
│       ├── main.tsx                 # React entry point
│       ├── App.tsx                  # Router setup (wouter)
│       │
│       ├── pages/
│       │   ├── menu.tsx             # Customer menu page
│       │   ├── admin.tsx            # Admin dashboard
│       │   └── halal-certificates.tsx
│       │
│       ├── components/
│       │   ├── lazy-image.tsx       # Intersection Observer lazy loading
│       │   ├── menu-category.tsx    # Menu item cards + modal
│       │   ├── admin-sortable-items.tsx  # Drag-drop ordering
│       │   ├── language-switcher.tsx     # EN/AR/FR toggle
│       │   └── ui/                  # shadcn components
│       │       ├── button.tsx
│       │       ├── dialog.tsx
│       │       ├── form.tsx
│       │       ├── input.tsx
│       │       ├── select.tsx
│       │       ├── toast.tsx
│       │       └── ...
│       │
│       ├── lib/
│       │   ├── queryClient.ts       # React Query configuration
│       │   ├── menu-data.ts         # Default images helper
│       │   └── utils.ts             # Utility functions
│       │
│       ├── utils/
│       │   └── translation.ts       # Locale helper functions
│       │
│       ├── constants/
│       │   └── allergens.ts         # Allergen icons and labels
│       │
│       ├── hooks/
│       │   ├── use-toast.ts
│       │   └── use-auth.ts
│       │
│       ├── i18n/
│       │   └── index.ts             # i18next configuration
│       │
│       └── locales/
│           ├── en.json              # English translations
│           ├── ar.json              # Arabic translations
│           └── fr.json              # French translations
│
├── public/
│   ├── styles.css                   # Global CSS + menu styling
│   └── fonts/                       # Custom fonts
│
├── drizzle.config.ts                # Drizzle migration config
├── tailwind.config.ts               # Tailwind configuration
├── vite.config.ts                   # Vite build configuration
└── package.json
```

---

## 3. Database Schema

### 3.1 Categories Table

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,           -- English name
    name_arabic VARCHAR(255),             -- Arabic name
    name_french VARCHAR(255),             -- French name
    slug VARCHAR(255) UNIQUE NOT NULL,    -- URL-friendly: "main-course"
    "order" INTEGER DEFAULT 0             -- Display order
);
```

**Drizzle Schema:**
```typescript
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameArabic: varchar("name_arabic", { length: 255 }),
  nameFrench: varchar("name_french", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  order: integer("order").default(0),
});
```

### 3.2 Menu Items Table

```sql
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,           -- English name
    name_arabic VARCHAR(255),             -- Arabic name
    name_french VARCHAR(255),             -- French name
    description TEXT,                     -- English description
    description_arabic TEXT,              -- Arabic description
    description_french TEXT,              -- French description
    price DECIMAL(10,2) NOT NULL,         -- Price with 2 decimals
    image_url TEXT,                       -- Object storage path
    is_available BOOLEAN DEFAULT TRUE,    -- Show/hide toggle
    out_of_stock BOOLEAN DEFAULT FALSE,   -- Stock status
    category_id INTEGER REFERENCES categories(id),  -- Legacy field
    display_order INTEGER DEFAULT 0,      -- Global ordering
    allergens TEXT                        -- JSON array: '["gluten","dairy"]'
);
```

**Drizzle Schema:**
```typescript
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameArabic: varchar("name_arabic", { length: 255 }),
  nameFrench: varchar("name_french", { length: 255 }),
  description: text("description"),
  descriptionArabic: text("description_arabic"),
  descriptionFrench: text("description_french"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  outOfStock: boolean("out_of_stock").default(false),
  categoryId: integer("category_id").references(() => categories.id),
  displayOrder: integer("display_order").default(0),
  allergens: text("allergens"), // JSON string
});
```

### 3.3 Menu Item Categories (Junction Table)

```sql
CREATE TABLE menu_item_categories (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,      -- Order WITHIN this category
    UNIQUE(item_id, category_id)          -- Prevent duplicates
);
```

**Drizzle Schema:**
```typescript
export const menuItemCategories = pgTable("menu_item_categories", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull().references(() => menuItems.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").default(0),
}, (table) => ({
  uniqueItemCategory: unique().on(table.itemId, table.categoryId),
}));
```

### 3.4 Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL        -- Hashed password
);
```

### 3.5 Settings Table

```sql
CREATE TABLE settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,                           -- JSON value
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.6 Halal Certificates Table

```sql
CREATE TABLE halal_certificates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_url TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0
);
```

### 3.7 Zod Validation Schemas

```typescript
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Insert schemas (exclude auto-generated fields)
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertMenuItemCategorySchema = createInsertSchema(menuItemCategories).omit({ id: true });

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItemCategory = typeof menuItemCategories.$inferSelect;
```

---

## 4. Object Storage

### 4.1 File Naming Convention

```
Pattern: menu-item-{timestamp}-{randomString}.{extension}
Example: menu-item-1732489234567-a8b2c4.jpg
```

### 4.2 Storage Client Implementation

```typescript
// server/storage-client.ts
import { Client } from "@replit/object-storage";

const client = new Client();

export async function uploadImage(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const key = `images/${filename}`;
  await client.uploadFromBytes(key, buffer, { contentType: mimeType });
  return `/api/images/${filename}`;
}

export async function getImage(filename: string): Promise<Buffer | null> {
  try {
    const key = `images/${filename}`;
    const result = await client.downloadAsBytes(key);
    return Buffer.from(result.value);
  } catch {
    return null;
  }
}

export async function deleteImage(filename: string): Promise<void> {
  const key = `images/${filename}`;
  await client.delete(key);
}

export function generateImageFilename(originalName: string): string {
  const ext = originalName.split('.').pop() || 'jpg';
  const random = Math.random().toString(36).substring(2, 8);
  return `menu-item-${Date.now()}-${random}.${ext}`;
}
```

### 4.3 Image Upload API

```typescript
// In routes.ts
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/upload-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  const filename = generateImageFilename(req.file.originalname);
  const imageUrl = await uploadImage(req.file.buffer, filename, req.file.mimetype);
  
  res.json({ imageUrl });
});

app.get("/api/images/:filename", async (req, res) => {
  const buffer = await getImage(req.params.filename);
  if (!buffer) {
    return res.status(404).send("Image not found");
  }
  res.set("Content-Type", "image/jpeg");
  res.set("Cache-Control", "public, max-age=31536000");
  res.send(buffer);
});
```

---

## 5. Backend API

### 5.1 Storage Interface

```typescript
// server/storage.ts
export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(data: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemById(id: number): Promise<MenuItem | undefined>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  getMenuItemsByCategorySlug(slug: string): Promise<MenuItem[]>;
  createMenuItem(data: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, data: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;
  
  // Item-Category Associations
  getItemCategories(itemId: number): Promise<Category[]>;
  addItemToCategory(itemId: number, categoryId: number): Promise<void>;
  removeItemFromCategory(itemId: number, categoryId: number): Promise<void>;
  updateItemCategoryOrder(itemId: number, categoryId: number, order: number): Promise<void>;
  
  // Settings
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;
  
  // Users
  getUserByUsername(username: string): Promise<User | undefined>;
}
```

### 5.2 API Endpoints Reference

#### Authentication
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/login` | `{ username, password }` | `{ success: true }` |
| POST | `/api/auth/logout` | - | `{ success: true }` |
| GET | `/api/auth/check` | - | `{ authenticated: boolean }` |

#### Categories
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/categories` | - | `Category[]` |
| POST | `/api/categories` | `InsertCategory` | `Category` |
| PATCH | `/api/categories/:id` | `Partial<InsertCategory>` | `Category` |
| DELETE | `/api/categories/:id` | - | `{ success: true }` |
| GET | `/api/categories/:slug/items` | - | `MenuItem[]` |

#### Menu Items
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/menu-items` | - | `MenuItem[]` |
| POST | `/api/menu-items` | `InsertMenuItem` | `MenuItem` |
| PATCH | `/api/menu-items/:id` | `Partial<InsertMenuItem>` | `MenuItem` |
| DELETE | `/api/menu-items/:id` | - | `{ success: true }` |
| PATCH | `/api/menu-items/:id/toggle-availability` | - | `MenuItem` |
| POST | `/api/menu-items/:id/duplicate` | - | `MenuItem` |

#### Item-Category Associations
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/menu-items/:id/categories` | - | `Category[]` |
| POST | `/api/menu-items/:id/categories` | `{ categoryId }` | `{ success: true }` |
| DELETE | `/api/menu-items/:id/categories/:categoryId` | - | `{ success: true }` |
| PATCH | `/api/menu-items/:id/categories/:categoryId/order` | `{ displayOrder }` | `{ success: true }` |

#### Settings
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/settings/category-order` | - | `{ categoryOrder: string[] }` |
| POST | `/api/settings/category-order` | `{ categoryOrder: string[] }` | `{ success: true }` |

#### Images
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/upload-image` | `FormData (file)` | `{ imageUrl: string }` |
| GET | `/api/images/:filename` | - | `Binary image data` |

### 5.3 Routes Implementation Example

```typescript
// server/routes.ts
import express from "express";
import { storage } from "./storage";
import { insertMenuItemSchema } from "@shared/schema";

export function registerRoutes(app: express.Application) {
  
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Get items for a specific category (by slug)
  app.get("/api/categories/:slug/items", async (req, res) => {
    const items = await storage.getMenuItemsByCategorySlug(req.params.slug);
    res.json(items);
  });

  // Create menu item
  app.post("/api/menu-items", async (req, res) => {
    const parsed = insertMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const item = await storage.createMenuItem(parsed.data);
    res.status(201).json(item);
  });

  // Update item order within category
  app.patch("/api/menu-items/:id/categories/:categoryId/order", async (req, res) => {
    const { displayOrder } = req.body;
    await storage.updateItemCategoryOrder(
      parseInt(req.params.id),
      parseInt(req.params.categoryId),
      displayOrder
    );
    res.json({ success: true });
  });
}
```

---

## 6. Frontend Architecture

### 6.1 React Query Configuration

```typescript
// client/src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response;
}
```

### 6.2 Router Setup

```typescript
// client/src/App.tsx
import { Switch, Route } from "wouter";
import Menu from "./pages/menu";
import Admin from "./pages/admin";
import HalalCertificates from "./pages/halal-certificates";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Menu} />
      <Route path="/menu" component={Menu} />
      <Route path="/admin" component={Admin} />
      <Route path="/halal-certificates" component={HalalCertificates} />
      <Route>404 - Not Found</Route>
    </Switch>
  );
}
```

---

## 7. Customer Menu Page

### 7.1 Page Structure

```typescript
// client/src/pages/menu.tsx
export default function Menu() {
  // State
  const [activeCategory, setActiveCategory] = useState<string>("");
  
  // Queries
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/categories", activeCategory, "items"],
    queryFn: async () => {
      const res = await fetch(`/api/categories/${activeCategory}/items`);
      return res.json();
    },
    enabled: !!activeCategory,
  });

  // Prefetch on hover
  const handleCategoryHover = (slug: string) => {
    const cached = queryClient.getQueryData(["/api/categories", slug, "items"]);
    if (!cached && slug !== activeCategory) {
      queryClient.prefetchQuery({
        queryKey: ["/api/categories", slug, "items"],
        queryFn: async () => {
          const res = await fetch(`/api/categories/${slug}/items`);
          return res.json();
        },
        staleTime: 30000,
      });
    }
  };

  return (
    <div>
      <Header />
      <CategoryNav 
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        onHover={handleCategoryHover}
      />
      <MenuCategory 
        category={activeCategory}
        items={items}
      />
    </div>
  );
}
```

### 7.2 Category Navigation

```typescript
// Horizontal scrolling category chips
<div className="category-nav overflow-x-auto">
  <div className="flex gap-3 px-4 py-3">
    {categories.map((category) => (
      <button
        key={category.id}
        onClick={() => setActiveCategory(category.slug)}
        onMouseEnter={() => handleCategoryHover(category.slug)}
        className={`category-chip ${
          activeCategory === category.slug ? "active" : ""
        }`}
      >
        {getTranslatedName(category, locale)}
      </button>
    ))}
  </div>
</div>
```

### 7.3 Menu Item Card

```typescript
// client/src/components/menu-category.tsx
function MenuItemCard({ item, category, index }) {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const imageUrl = (item.imageUrl && !imageError)
    ? item.imageUrl
    : getDefaultImageForItem(category.slug, index);

  const handleImageLoad = (loadedSrc: string) => {
    // Only clear error if original image loaded (not fallback)
    if (imageError && item.imageUrl && loadedSrc.includes(item.imageUrl)) {
      setImageError(false);
    }
  };

  return (
    <>
      <li className="menu-card" onClick={() => setIsModalOpen(true)}>
        <div className="thumb-wrap">
          <LazyImage
            src={imageUrl}
            alt={item.name}
            className="menu-thumb"
            wrapperClassName="rounded-lg"
            width={176}
            height={152}
            onLoad={handleImageLoad}
            onError={() => setImageError(true)}
          />
        </div>
        <div className="menu-meta">
          <h3>{getTranslatedName(item, locale)}</h3>
          <p>{getTranslatedDescription(item, locale)}</p>
          <AllergenBadges allergens={item.allergens} />
        </div>
        <div className="menu-price">${item.price}</div>
      </li>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {/* Modal content with high-res image */}
      </Dialog>
    </>
  );
}
```

---

## 8. Admin Panel

### 8.1 Page Structure

```typescript
// client/src/pages/admin.tsx
export default function Admin() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoginForm />;

  return (
    <div className="admin-panel">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="admin-content">
        {activeTab === "overview" && <OverviewDashboard />}
        {activeTab === "items" && <MenuItemsManager />}
        {activeTab === "categories" && <CategoriesManager />}
        {activeTab === "certificates" && <CertificatesManager />}
      </main>
    </div>
  );
}
```

### 8.2 Drag-Drop Sortable Items

```typescript
// client/src/components/admin-sortable-items.tsx
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function AdminSortableItems({ categoryId, items }) {
  const [localItems, setLocalItems] = useState(items);
  const [dirtyCategories, setDirtyCategories] = useState<Set<number>>(new Set());

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      // Reorder items locally
      const oldIndex = localItems.findIndex(i => i.id === active.id);
      const newIndex = localItems.findIndex(i => i.id === over.id);
      const newItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(newItems);
      setDirtyCategories(prev => new Set(prev).add(categoryId));
    }
  };

  const handleSave = async () => {
    for (const [index, item] of localItems.entries()) {
      await apiRequest("PATCH", 
        `/api/menu-items/${item.id}/categories/${categoryId}/order`,
        { displayOrder: index }
      );
    }
    queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    setDirtyCategories(new Set());
  };

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {localItems.map((item, index) => (
            <SortableItem key={item.id} item={item} index={index} />
          ))}
        </SortableContext>
      </DndContext>
      
      {dirtyCategories.size > 0 && (
        <SaveBanner onSave={handleSave} />
      )}
    </>
  );
}
```

### 8.3 Menu Item Form

```typescript
// Form with multilingual fields
const formSchema = insertMenuItemSchema.extend({
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  allergens: z.array(z.string()).optional(),
});

function MenuItemForm({ item, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      nameArabic: item?.nameArabic || "",
      nameFrench: item?.nameFrench || "",
      description: item?.description || "",
      descriptionArabic: item?.descriptionArabic || "",
      descriptionFrench: item?.descriptionFrench || "",
      price: item?.price || "",
      allergens: item?.allergens ? JSON.parse(item.allergens) : [],
      isAvailable: item?.isAvailable ?? true,
      outOfStock: item?.outOfStock ?? false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Name fields (EN/AR/FR) */}
        {/* Description fields (EN/AR/FR) */}
        {/* Price input */}
        {/* Allergen multi-select */}
        {/* Availability toggles */}
        {/* Image upload */}
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

---

## 9. Lazy Loading System

### 9.1 LazyImage Component

```typescript
// client/src/components/lazy-image.tsx
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;        // Applied to <img>
  wrapperClassName?: string; // Applied to wrapper <div>
  width?: number;
  height?: number;
  onLoad?: (loadedSrc: string) => void;
  onError?: () => void;
}

export default function LazyImage({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  width,
  height,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Reset state when src changes (for fallback recovery)
  useEffect(() => {
    if (src !== currentSrc) {
      setHasError(false);
      setIsLoaded(false);
      setCurrentSrc(src);
      setIsInView(false);
    }
  }, [src, currentSrc]);

  // Intersection Observer for viewport detection
  useEffect(() => {
    if (!wrapperRef.current || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px", // Start loading 100px before viewport
        threshold: 0.01,
      }
    );

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [isInView, currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.(currentSrc);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
    onError?.();
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 text-xs">Loading...</span>
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400">⚠️</span>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} ${!isLoaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
}
```

### 9.2 Key Features

1. **Viewport Detection**: Uses IntersectionObserver with 100px margin
2. **Blur Placeholder**: Shows while image loads
3. **Error Recovery**: Resets state when src changes (allows fallback)
4. **Smooth Transitions**: 300ms opacity fade-in
5. **Separate Styling**: `className` for image, `wrapperClassName` for container

---

## 10. Internationalization

### 10.1 i18n Configuration

```typescript
// client/src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en.json";
import ar from "../locales/ar.json";
import fr from "../locales/fr.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### 10.2 Translation Files Structure

```json
// locales/en.json
{
  "menu": {
    "title": "Our Menu",
    "viewMore": "View More",
    "viewLess": "View Less",
    "outOfStock": "Out of Stock",
    "allergens": "Contains allergens"
  },
  "admin": {
    "title": "Admin Panel",
    "menuItems": "Menu Items",
    "categories": "Categories",
    "addItem": "Add New Item",
    "editItem": "Edit Item",
    "deleteConfirm": "Are you sure?"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading..."
  }
}
```

### 10.3 Translation Helpers

```typescript
// client/src/utils/translation.ts
export function useLocale(): string {
  const { i18n } = useTranslation();
  return i18n.language || "en";
}

export function getTranslatedItemName(item: MenuItem, locale: string): string {
  if (locale === "ar" && item.nameArabic) return item.nameArabic;
  if (locale === "fr" && item.nameFrench) return item.nameFrench;
  return item.name;
}

export function getTranslatedItemDescription(item: MenuItem, locale: string): string {
  if (locale === "ar" && item.descriptionArabic) return item.descriptionArabic;
  if (locale === "fr" && item.descriptionFrench) return item.descriptionFrench;
  return item.description || "";
}

export function getTranslatedCategoryName(category: Category, locale: string): string {
  if (locale === "ar" && category.nameArabic) return category.nameArabic;
  if (locale === "fr" && category.nameFrench) return category.nameFrench;
  return category.name;
}
```

### 10.4 RTL Support

```typescript
// Language Switcher Component
function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    
    // Set RTL for Arabic
    if (lang === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = lang;
    }
  };

  return (
    <div className="language-switcher">
      <button onClick={() => changeLanguage("en")}>EN</button>
      <button onClick={() => changeLanguage("ar")}>عربي</button>
      <button onClick={() => changeLanguage("fr")}>FR</button>
    </div>
  );
}
```

---

## 11. Dependencies

### 11.1 Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "express": "^4.x",
    "drizzle-orm": "^0.29.x",
    "@neondatabase/serverless": "^0.9.x",
    "drizzle-zod": "^0.5.x",
    "zod": "^3.x",
    "@tanstack/react-query": "^5.x",
    "wouter": "^3.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "i18next": "^23.x",
    "react-i18next": "^14.x",
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x",
    "multer": "^1.x",
    "express-session": "^1.x",
    "@replit/object-storage": "^1.x"
  }
}
```

### 11.2 UI Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "^3.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-checkbox": "^1.x",
    "@radix-ui/react-tabs": "^1.x",
    "@radix-ui/react-toast": "^1.x",
    "lucide-react": "^0.x",
    "framer-motion": "^11.x"
  }
}
```

### 11.3 Dev Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "drizzle-kit": "^0.20.x",
    "tsx": "^4.x",
    "@types/node": "^20.x",
    "@types/express": "^4.x",
    "@types/react": "^18.x"
  }
}
```

---

## 12. Implementation Steps

### Phase 1: Setup (Day 1)

1. **Initialize Project**
   ```bash
   npm create vite@latest restaurant-menu -- --template react-ts
   cd restaurant-menu
   ```

2. **Install Dependencies**
   - Add all packages from Section 11

3. **Configure Database**
   - Set up PostgreSQL (Neon/Supabase/local)
   - Create `drizzle.config.ts`
   - Create `shared/schema.ts` with all tables

4. **Run Migrations**
   ```bash
   npm run db:push
   ```

### Phase 2: Backend (Day 2-3)

1. **Create Storage Interface**
   - Implement `server/storage.ts` with all CRUD methods

2. **Set Up Object Storage**
   - Implement `server/storage-client.ts`

3. **Build API Routes**
   - Implement all endpoints from Section 5

4. **Test All Endpoints**
   - Use Postman/curl to verify

### Phase 3: Frontend Core (Day 4-5)

1. **Set Up React Query**
   - Configure `queryClient.ts`

2. **Build LazyImage Component**
   - Implement IntersectionObserver logic

3. **Create Translation Files**
   - Set up i18n with EN/AR/FR

4. **Build Customer Menu Page**
   - Category navigation
   - Menu item cards
   - Modal popup

### Phase 4: Admin Panel (Day 6-7)

1. **Authentication Flow**
   - Login form
   - Session management

2. **CRUD Forms**
   - Menu item create/edit
   - Category management

3. **Drag-Drop Ordering**
   - Integrate dnd-kit
   - Batch save functionality

### Phase 5: Polish (Day 8)

1. **Styling**
   - Apply brand colors
   - Responsive design

2. **Testing**
   - Cross-browser testing
   - Mobile testing

3. **Deployment**
   - Environment variables
   - Production build

---

## Quick Reference: Common Patterns

### Fetching Category Items
```typescript
const { data: items } = useQuery({
  queryKey: ["/api/categories", slug, "items"],
  queryFn: () => fetch(`/api/categories/${slug}/items`).then(r => r.json()),
  enabled: !!slug,
});
```

### Updating Item Order
```typescript
await apiRequest("PATCH", `/api/menu-items/${itemId}/categories/${categoryId}/order`, {
  displayOrder: newIndex,
});
queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
```

### Uploading Image
```typescript
const formData = new FormData();
formData.append("image", file);
const response = await fetch("/api/upload-image", {
  method: "POST",
  body: formData,
});
const { imageUrl } = await response.json();
```

### Getting Translated Text
```typescript
const locale = useLocale();
const itemName = getTranslatedItemName(item, locale);
```

---

*This blueprint provides everything needed to recreate the restaurant menu management system from scratch.*
