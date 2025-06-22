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
      <div className="min-h-screen bg-light-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-brand-green">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-cream relative">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='decorative-pattern' x='0' y='0' width='120' height='120' patternUnits='userSpaceOnUse'%3E%3Cg transform='translate(15,15)'%3E%3Cpath d='M15,25 Q10,15 5,10 Q15,15 25,10 Q20,15 15,25 Z' fill='%23527A53' opacity='0.6'/%3E%3Cpath d='M15,5 L15,25' stroke='%23527A53' stroke-width='1.5' opacity='0.6'/%3E%3Cpath d='M8,12 L22,18' stroke='%23527A53' stroke-width='1' opacity='0.6'/%3E%3Cpath d='M22,12 L8,18' stroke='%23527A53' stroke-width='1' opacity='0.6'/%3E%3C/g%3E%3Cg transform='translate(75,15)'%3E%3Cpath d='M5,25 Q5,10 20,10 Q35,10 35,25 Z' fill='none' stroke='%23527A53' stroke-width='2' opacity='0.6'/%3E%3Cpath d='M8,22 Q15,15 22,22' stroke='%23527A53' stroke-width='1.5' opacity='0.6'/%3E%3Cpath d='M12,25 Q20,18 28,25' stroke='%23527A53' stroke-width='1.5' opacity='0.6'/%3E%3Cpath d='M10,15 L10,25' stroke='%23527A53' stroke-width='1' opacity='0.6'/%3E%3Cpath d='M20,12 L20,25' stroke='%23527A53' stroke-width='1' opacity='0.6'/%3E%3Cpath d='M30,15 L30,25' stroke='%23527A53' stroke-width='1' opacity='0.6'/%3E%3C/g%3E%3Cg transform='translate(15,75)'%3E%3Cpath d='M5,25 Q5,10 20,10 Q35,10 35,25 Z' fill='none' stroke='%23527A53' stroke-width='2' opacity='0.6'/%3E%3Cpath d='M8,22 Q15,15 22,22' stroke='%23527A53' stroke-width='1.5' opacity='0.6'/%3E%3Cpath d='M12,25 Q20,18 28,25' stroke='%23527A53' stroke-width='1.5' opacity='0.6'/%3E%3Cpath d='M10,15 L10,25' stroke='%23527A53' stroke-width='1' opacity='0.6'/%3E%3Cpath d='M20,12 L20,25' stroke='%23527A53' stroke-width='1' opacity='0.6'/%3E%3Cpath d='M30,15 L30,25' stroke='%23527A53' stroke-width='1' opacity='0.6'/%3E%3C/g%3E%3Cg transform='translate(75,75)'%3E%3Cpath d='M15,25 Q10,15 5,10 Q15,15 25,10 Q20,15 15,25 Z' fill='%23527A53' opacity='0.6'/%3E%3Cpath d='M15,5 L15,25' stroke='%23527A53' stroke-width='1.5' opacity='0.6'/%3E%3Cpath d='M8,12 L22,18' stroke='%23527A53' stroke-width='1' opacity='0.6'/%3E%3Cpath d='M22,12 L8,18' stroke='%23527A53' stroke-width='1' opacity='0.6'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23decorative-pattern)'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      ></div>
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-brand-coral relative z-10">
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
      <section className="relative h-96 bg-gradient-to-br from-brand-green via-brand-green to-brand-dark-green overflow-hidden z-10">
        {/* Layered background patterns */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-coral/30 via-transparent to-brand-coral/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-brand-cream/10 to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-brand-coral/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-brand-cream/20 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-brand-coral/15 rounded-full blur-md"></div>
        
        <div className="relative flex items-center h-full z-10">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              {/* Content Rectangle */}
              <div className="max-w-2xl bg-brand-cream backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-brand-coral/30 relative">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-coral rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-brand-green rounded-full"></div>
                
                <h2 className="font-script text-6xl font-bold text-title-coral mb-4">
                  A Place To Feel
                </h2>
                <p className="text-xl text-brand-green leading-relaxed mb-6">
                  Chez nous, c'est chez vous. Welcome home. You don't visit Chez Beyrouth. You return to it.
                </p>
                <div className="flex items-center space-x-4 bg-brand-coral/20 rounded-full px-4 py-3 w-fit border border-brand-coral/40">
                  <Clock className="h-5 w-5 text-brand-coral" />
                  <span className="text-brand-green font-semibold">Open Daily 7:00 AM - 11:00 PM</span>
                </div>
              </div>
              
              {/* Clock Tower Image */}
              <div className="hidden lg:block ml-12 flex-shrink-0">
                <div className="w-48 h-80 relative">
                  <svg viewBox="0 0 200 400" className="w-full h-full opacity-90 filter drop-shadow-2xl">
                    {/* Clock Tower Base */}
                    <rect x="20" y="350" width="160" height="50" fill="#527A53" stroke="#3D5A3E" strokeWidth="2"/>
                    
                    {/* Main Tower Body */}
                    <rect x="40" y="80" width="120" height="270" fill="#527A53" stroke="#3D5A3E" strokeWidth="2"/>
                    
                    {/* Tower Details - Vertical Lines */}
                    <line x1="50" y1="80" x2="50" y2="350" stroke="#3D5A3E" strokeWidth="2"/>
                    <line x1="60" y1="80" x2="60" y2="350" stroke="#3D5A3E" strokeWidth="2"/>
                    <line x1="70" y1="80" x2="70" y2="350" stroke="#3D5A3E" strokeWidth="2"/>
                    <line x1="80" y1="80" x2="80" y2="350" stroke="#3D5A3E" strokeWidth="2"/>
                    <line x1="90" y1="80" x2="90" y2="350" stroke="#3D5A3E" strokeWidth="2"/>
                    <line x1="110" y1="80" x2="110" y2="350" stroke="#3D5A3E" strokeWidth="2"/>
                    <line x1="120" y1="80" x2="120" y2="350" stroke="#3D5A3E" strokeWidth="2"/>
                    <line x1="130" y1="80" x2="130" y2="350" stroke="#3D5A3E" strokeWidth="2"/>
                    <line x1="140" y1="80" x2="140" y2="350" stroke="#3D5A3E" strokeWidth="2"/>
                    <line x1="150" y1="80" x2="150" y2="350" stroke="#3D5A3E" strokeWidth="2"/>
                    
                    {/* Clock Face */}
                    <circle cx="100" cy="140" r="35" fill="#F5F2E8" stroke="#3D5A3E" strokeWidth="3"/>
                    
                    {/* Clock Hands */}
                    <line x1="100" y1="140" x2="100" y2="120" stroke="#3D5A3E" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="100" y1="140" x2="115" y2="140" stroke="#3D5A3E" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="100" cy="140" r="3" fill="#3D5A3E"/>
                    
                    {/* Clock Numbers */}
                    <text x="100" y="115" textAnchor="middle" fill="#3D5A3E" fontSize="12" fontWeight="bold">12</text>
                    <text x="125" y="145" textAnchor="middle" fill="#3D5A3E" fontSize="12" fontWeight="bold">3</text>
                    <text x="100" y="170" textAnchor="middle" fill="#3D5A3E" fontSize="12" fontWeight="bold">6</text>
                    <text x="75" y="145" textAnchor="middle" fill="#3D5A3E" fontSize="12" fontWeight="bold">9</text>
                    
                    {/* Tower Top Section */}
                    <rect x="30" y="40" width="140" height="40" fill="#527A53" stroke="#3D5A3E" strokeWidth="2"/>
                    
                    {/* Tower Crown */}
                    <polygon points="25,40 175,40 160,20 40,20" fill="#527A53" stroke="#3D5A3E" strokeWidth="2"/>
                    
                    {/* Decorative Elements */}
                    <rect x="85" y="200" width="30" height="40" fill="none" stroke="#3D5A3E" strokeWidth="2"/>
                    <rect x="85" y="260" width="30" height="40" fill="none" stroke="#3D5A3E" strokeWidth="2"/>
                    
                    {/* Side Text "A Place To Feel" */}
                    <text x="185" y="120" textAnchor="start" fill="#c86f60" fontSize="16" fontFamily="cursive" fontWeight="bold" transform="rotate(90 185 120)">A Place</text>
                    <text x="185" y="200" textAnchor="start" fill="#c86f60" fontSize="16" fontFamily="cursive" fontWeight="bold" transform="rotate(90 185 200)">To Feel</text>
                    
                    {/* Decorative Leaf Elements */}
                    <g transform="translate(15,30)">
                      <path d="M10,15 Q5,5 0,0 Q10,5 20,0 Q15,5 10,15 Z" fill="#527A53" opacity="0.7"/>
                    </g>
                    
                    <g transform="translate(165,320)">
                      <path d="M10,15 Q5,5 0,0 Q10,5 20,0 Q15,5 10,15 Z" fill="#527A53" opacity="0.7"/>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced decorative pattern overlay */}
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-15">
          <div className="w-full h-full bg-gradient-to-tl from-brand-coral via-brand-coral/50 to-transparent rounded-full transform translate-x-32 translate-y-32"></div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-brand-cream to-transparent rounded-full transform -translate-x-20 -translate-y-20"></div>
        </div>
      </section>

      {/* Menu Categories Navigation */}
      <section className="bg-white shadow-sm border-b relative z-10">
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
      <section className="container mx-auto px-6 py-12 relative z-10">
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
