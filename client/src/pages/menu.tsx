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
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-brand-green">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-brand-coral">
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
              <Button className="bg-brand-green text-white hover:bg-brand-dark-green">
                <Utensils className="mr-2 h-4 w-4" />
                Digital Menu
              </Button>
              <Link href="/login">
                <Button variant="outline" className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-brand-green via-brand-green to-brand-dark-green">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-coral/20 to-transparent"></div>
        
        <div className="relative flex items-center h-full z-10">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl bg-brand-cream/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <h2 className="font-playfair text-5xl font-bold text-brand-green mb-4">
                A Place To Feel
              </h2>
              <p className="text-xl text-brand-green leading-relaxed mb-6">
                Chez nous, c'est chez vous. Welcome home. You don't visit Chez Beyrouth. You return to it.
              </p>
              <div className="flex items-center space-x-4 text-brand-coral">
                <Clock className="h-5 w-5" />
                <span className="text-brand-green">Open Daily 7:00 AM - 11:00 PM</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative pattern overlay */}
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10">
          <div className="w-full h-full bg-gradient-to-tl from-brand-coral to-transparent rounded-full transform translate-x-32 translate-y-32"></div>
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
                    ? "category-button-active transform scale-105"
                    : "bg-white border-2 border-brand-green text-brand-green category-button-hover"
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
