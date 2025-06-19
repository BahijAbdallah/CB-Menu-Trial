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
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600" 
          alt="Elegant restaurant interior with warm lighting" 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl">
              <h2 className="font-playfair text-5xl font-bold text-white mb-4">
                A Place To Feel
              </h2>
              <p className="text-xl text-cornsilk leading-relaxed mb-6">
                Chez nous, c'est chez vous. Welcome home. You don't visit Chez Beyrouth. You return to it.
              </p>
              <div className="flex items-center space-x-4 text-warm-gold">
                <Clock className="h-5 w-5" />
                <span className="text-white">Open Daily 7:00 AM - 11:00 PM</span>
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
                    ? "bg-brand-green text-white shadow-lg transform scale-105"
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
