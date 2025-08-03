# Restaurant Menu Management System

## Overview

This is a full-stack restaurant menu management system built with React, Express, and PostgreSQL. The application provides both a customer-facing menu interface and an admin dashboard for managing menu items and categories. It features bilingual support (English/Arabic) and modern UI components.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Lebanese-themed color palette
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: PostgreSQL (persistent database)
- **Authentication**: Express sessions for admin access
- **Development**: tsx for TypeScript execution
- **Build**: esbuild for production bundling

### Database Schema
- **Categories Table**: Stores menu categories with bilingual names and ordering
- **Menu Items Table**: Stores individual menu items with prices, descriptions, and availability
- **Users Table**: Admin authentication with username/password

## Key Components

### Data Layer
- **Drizzle Schema**: Centralized schema definitions in `shared/schema.ts`
- **Storage Interface**: Abstract storage layer with in-memory implementation for development
- **Type Safety**: Full TypeScript integration with Drizzle-Zod for runtime validation

### API Layer
- **RESTful Routes**: Express routes for CRUD operations
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Validation**: Zod schema validation for all API endpoints

### UI Components
- **Menu Display**: Category-based menu organization with responsive design
- **Admin Dashboard**: Full CRUD interface for menu management
- **Modal Forms**: Dynamic forms for creating/editing menu items
- **Statistics Dashboard**: Admin overview with key metrics

## Data Flow

1. **Client Requests**: React components make API calls through TanStack Query
2. **API Processing**: Express routes validate requests and interact with storage layer
3. **Data Persistence**: Drizzle ORM handles database operations with PostgreSQL
4. **Response Handling**: Data flows back through the same path with error handling
5. **UI Updates**: React Query manages cache invalidation and UI synchronization

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL for production
- **Connection**: Uses DATABASE_URL environment variable
- **Migrations**: Drizzle Kit for schema migrations

### Third-party Services
- **Unsplash**: Default menu item images
- **Replit Integration**: Development environment optimizations

### Build Tools
- **Vite**: Frontend build tool with React plugin
- **PostCSS**: CSS processing with Tailwind
- **TypeScript**: Type checking and compilation

## Deployment Strategy

### Development
- **Hot Reload**: Vite dev server with HMR
- **TypeScript**: Real-time type checking
- **Database**: Local or cloud PostgreSQL instance

### Production
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Replit autoscale deployment
- **Environment**: NODE_ENV=production with optimizations

### Database Management
- **Schema Push**: `npm run db:push` for development
- **Migrations**: Drizzle Kit handles schema changes
- **Connection Pooling**: Neon handles connection management

## Changelog
- June 19, 2025: Initial setup with in-memory storage
- June 19, 2025: Added PostgreSQL database with persistent storage
- June 19, 2025: Implemented authentication system with ali@keemya.net credentials  
- June 19, 2025: Added category management (create, edit, delete) in admin panel
- June 19, 2025: Fixed authentication issues with token-based system
- June 19, 2025: Applied complete brand color scheme across application
- June 22, 2025: Removed background image from banner, replaced with branded design using official colors
- June 22, 2025: Added Parsley font for main headings while maintaining Playfair Display for menu item content
- June 22, 2025: Implemented decorative leaf and dome pattern as subtle background with low opacity
- June 22, 2025: Added architectural clock tower PNG image to hero banner with transparent background and Art Deco styling
- June 22, 2025: Implemented fully responsive design across all screen sizes with mobile-first approach
- June 22, 2025: Enhanced admin panel with proper brand colors and improved Add New Item functionality
- June 27, 2025: Implemented Ubuntu-Arabic font family for proper Arabic text rendering with bilingual menu support
- June 27, 2025: Configured Adero font family as default body text with Parslay reserved for headlines and decorative elements
- July 13, 2025: Added comprehensive halal certificates management system with database schema, API endpoints, admin interface, and customer-facing page
- August 3, 2025: Integrated AlethiaNext font family as new global default with light and italic variants replacing previous font hierarchy
- August 3, 2025: Replaced all fonts with Billmake-Regular.otf as the new global default font across the entire website
- August 3, 2025: Implemented Clash Display font family with complete weight range (Extralight 200, Light 300, Regular 400, Medium 500, Semibold 600, Bold 700) as new global typography system

## User Preferences

Preferred communication style: Simple, everyday language.