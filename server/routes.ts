import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertMenuItemSchema, insertHalalCertificateSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import "./types";
import { importExcelMenu } from "./import-excel";

// Simple token store for demo purposes
const activeTokens = new Map<string, number>(); // token -> userId

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'halal-cert-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer configuration for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imageDir = path.join(process.cwd(), 'attached_assets');
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'menu-item-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.session?.authToken;
  const userId = activeTokens.get(token);
  
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  req.userId = userId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken();
      activeTokens.set(token, user.id);
      (req.session as any).authToken = token;
      
      // Token generated for user authentication
      console.log('User ID:', user.id);
      
      res.json({ 
        message: "Login successful", 
        user: { id: user.id, username: user.username },
        token: token
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Image upload endpoint
  app.post("/api/upload-image", requireAuth, uploadImage.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      // For now, we'll use the attached_assets directory for uploaded images
      // In production, you might want to use cloud storage
      const imageUrl = `/attached_assets/${req.file.filename}`;
      
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || (req.session as any)?.authToken;
    
    // Authentication check performed
    
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const userId = activeTokens.get(token);
    // User ID verification performed
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    storage.getUser(userId).then(user => {
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json({ user: { id: user.id, username: user.username } });
    }).catch(() => {
      res.status(500).json({ message: "Failed to get user" });
    });
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  app.put("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Menu items routes
  app.get("/api/menu-items", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : null;
      
      let menuItems;
      if (categoryId) {
        menuItems = await storage.getMenuItemsByCategory(categoryId);
      } else {
        menuItems = await storage.getMenuItems();
      }
      
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItemById(id);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  app.post("/api/menu-items", requireAuth, async (req, res) => {
    try {
      const itemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(itemData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create menu item" });
      }
    }
  });

  app.put("/api/menu-items/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const itemData = insertMenuItemSchema.partial().parse(req.body);
      const menuItem = await storage.updateMenuItem(id, itemData);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid menu item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update menu item" });
      }
    }
  });

  app.delete("/api/menu-items/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMenuItem(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  app.patch("/api/menu-items/:id/toggle-availability", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.toggleMenuItemAvailability(id);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle menu item availability" });
    }
  });

  // Stats endpoint for admin dashboard
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      const categories = await storage.getCategories();
      
      const stats = {
        totalItems: menuItems.length,
        availableItems: menuItems.filter(item => item.isAvailable).length,
        outOfStock: menuItems.filter(item => !item.isAvailable).length,
        categories: categories.length,
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // File upload endpoint for halal certificates
  app.post("/api/halal-certificates/upload", requireAuth, upload.single('certificate'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Generate the file URL for serving
      const fileUrl = `/uploads/certificates/${req.file.filename}`;
      
      res.json({
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        filePath: req.file.path,
        size: req.file.size
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // File deletion endpoint
  app.delete("/api/halal-certificates/file", requireAuth, async (req, res) => {
    try {
      const { fileUrl } = req.body;
      
      if (!fileUrl || !fileUrl.startsWith('/uploads/certificates/')) {
        return res.status(400).json({ message: "Invalid file URL" });
      }

      const fileName = path.basename(fileUrl);
      const filePath = path.join(uploadsDir, fileName);
      
      // Check if file exists and delete it
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: "File deleted successfully" });
      } else {
        res.status(404).json({ message: "File not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Halal Certificates API
  app.get("/api/halal-certificates", async (req, res) => {
    try {
      const certificates = await storage.getHalalCertificates();
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch halal certificates" });
    }
  });

  app.get("/api/halal-certificates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const certificate = await storage.getHalalCertificateById(id);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      res.json(certificate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  app.post("/api/halal-certificates", requireAuth, async (req, res) => {
    try {
      const parsed = insertHalalCertificateSchema.parse(req.body);
      const certificate = await storage.createHalalCertificate(parsed);
      res.status(201).json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid certificate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create certificate" });
    }
  });

  app.put("/api/halal-certificates/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsed = insertHalalCertificateSchema.partial().parse(req.body);
      const certificate = await storage.updateHalalCertificate(id, parsed);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      res.json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid certificate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update certificate" });
    }
  });

  app.delete("/api/halal-certificates/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get certificate details before deletion to remove file
      const certificate = await storage.getHalalCertificateById(id);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      const success = await storage.deleteHalalCertificate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      // Delete the physical file if it exists and is in our uploads directory
      if (certificate.fileUrl && certificate.fileUrl.startsWith('/uploads/certificates/')) {
        const fileName = path.basename(certificate.fileUrl);
        const filePath = path.join(uploadsDir, fileName);
        
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (error) {
            console.error('Failed to delete file:', error);
            // Continue even if file deletion fails
          }
        }
      }
      
      res.json({ message: "Certificate deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete certificate" });
    }
  });

  // Settings routes for category ordering
  app.get("/api/settings/category-order", async (req, res) => {
    try {
      const categoryOrder = await storage.getCategoryOrder();
      res.json({ categoryOrder });
    } catch (error) {
      res.status(500).json({ message: "Failed to get category order" });
    }
  });

  app.put("/api/settings/category-order", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        categoryOrder: z.array(z.string())
      });
      
      const { categoryOrder } = schema.parse(req.body);
      await storage.setCategoryOrder(categoryOrder);
      res.json({ success: true, categoryOrder });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category order format" });
      } else {
        res.status(500).json({ message: "Failed to save category order" });
      }
    }
  });

  // Item order settings routes
  app.get("/api/settings/item-order", async (req, res) => {
    try {
      const itemOrderByCategory = await storage.getItemOrderByCategory();
      res.json({ itemOrderByCategory });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch item order" });
    }
  });

  app.post("/api/settings/item-order", requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        categoryId: z.string(),
        order: z.array(z.string())
      });
      
      const { categoryId, order } = schema.parse(req.body);
      await storage.setItemOrderByCategory(categoryId, order);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request format" });
      } else {
        res.status(500).json({ message: "Failed to save item order" });
      }
    }
  });

  app.delete("/api/settings/item-order", requireAuth, async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string;
      if (!categoryId) {
        return res.status(400).json({ message: "categoryId is required" });
      }
      
      await storage.deleteItemOrderByCategory(categoryId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item order" });
    }
  });

  // Excel import endpoint
  app.post("/api/import-excel", requireAuth, async (req, res) => {
    try {
      console.log('Starting Excel import...');
      const result = await importExcelMenu();
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Excel import error:', error);
      res.status(500).json({ 
        success: false, 
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        itemsImported: 0
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
