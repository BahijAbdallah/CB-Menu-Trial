import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Utensils, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuCategory from "@/components/menu-category";
import type { Category, MenuItem } from "@shared/schema";




export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>("");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  // Set first category as active when categories load
  if (categories.length > 0 && !activeCategory) {
    setActiveCategory(categories[0].slug);
  }

  const activeCategoryData = categories.find(cat => cat.slug === activeCategory);
  const categoryItems = menuItems.filter(item => 
    activeCategoryData ? item.categoryId === activeCategoryData.id : false
  );

  if (categoriesLoading || menuItemsLoading) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-gold mx-auto mb-4"></div>
          <p className="text-saddle-brown">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-warm">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-warm-gold">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Chez Beyrouth Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Button className="bg-warm-gold text-white hover:bg-goldenrod">
                <Utensils className="mr-2 h-4 w-4" />
                Digital Menu
              </Button>
              <Link href="/login">
                <Button variant="outline" className="border-warm-gold text-warm-gold hover:bg-warm-gold hover:text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden hero-section">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10"></div>
        
        <div className="absolute inset-0 z-20 flex items-end pb-8">
          <div className="container mx-auto px-6">
            <div className="flex justify-end">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 max-w-md">
                <div className="flex items-center space-x-4 text-warm-gold">
                  <Clock className="h-5 w-5" />
                  <span className="text-white font-medium">Open Daily 7:00 AM - 11:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories Navigation */}
      <section className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex overflow-x-auto space-x-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                className={`whitespace-nowrap px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  activeCategory === category.slug
                    ? "bg-gradient-to-r from-warm-gold to-goldenrod text-white shadow-lg transform scale-105"
                    : "bg-white border-2 border-warm-gold text-warm-gold category-button-hover"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items Display */}
      <section className="container mx-auto px-6 py-12">
        {activeCategoryData && (
          <MenuCategory 
            category={activeCategoryData} 
            items={categoryItems}
          />
        )}
      </section>
    </div>
  );
}
