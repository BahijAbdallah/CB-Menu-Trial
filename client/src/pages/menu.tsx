import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Utensils, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuCategory from "@/components/menu-category";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Category, MenuItem } from "@shared/schema";
import clockTowerImage from "@/assets/chez_1750587966495.png";



export default function MenuPage() {
  const { t } = useTranslation();
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
          <p className="text-brand-green">{t('common.loading')}</p>
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
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Chez Beyrouth Logo" 
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </div>
            
            <nav className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <LanguageSwitcher />
              <Link
                href="/halal-certificates"
                className="inline-flex items-center px-2 sm:px-3 lg:px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200 font-medium text-xs sm:text-sm border border-green-200"
              >
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 lg:mr-2" />
                <span className="hidden sm:inline ml-1 lg:ml-0">{t('nav.halalCertificates')}</span>
              </Link>
              <Button className="bg-brand-green text-white hover:bg-brand-dark-green text-xs sm:text-sm px-2 sm:px-3 lg:px-4 py-2">
                <Utensils className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 lg:mr-2" />
                <span className="hidden sm:inline ml-1 lg:ml-0">{t('nav.digitalMenu')}</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-96 lg:h-96 bg-gradient-to-br from-brand-green via-brand-green to-brand-dark-green overflow-hidden z-10">
        {/* Layered background patterns */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-coral/30 via-transparent to-brand-coral/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-brand-cream/10 to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-brand-coral/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-brand-cream/20 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-brand-coral/15 rounded-full blur-md"></div>
        
        <div className="relative flex items-center h-full z-10">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto gap-8 lg:gap-12">
              {/* Content Rectangle */}
              <div className="w-full max-w-xl bg-brand-cream backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border-2 border-brand-coral/30 relative">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-coral rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-brand-green rounded-full"></div>
                
                <h2 className="font-parslay text-3xl sm:text-4xl lg:text-5xl font-bold text-title-coral mb-3 text-center lg:text-left">
                  {t('hero.title')}
                </h2>
                <p className="text-base sm:text-lg text-brand-green leading-relaxed mb-5 text-center lg:text-left">
                  {t('hero.subtitle')}
                </p>
                <div className="flex items-center justify-center lg:justify-start space-x-3 bg-brand-coral/20 rounded-full px-3 py-2 w-fit mx-auto lg:mx-0 border border-brand-coral/40">
                  <Clock className="h-4 w-4 text-brand-coral" />
                  <span className="text-brand-green font-semibold text-xs sm:text-sm">{t('hero.openHours')}</span>
                </div>
              </div>
              
              {/* Clock Tower Image */}
              <div className="flex-shrink-0 w-full lg:w-auto flex justify-center">
                <img 
                  src={clockTowerImage}
                  alt="A Place To Feel - Architectural Clock Tower" 
                  className="h-64 sm:h-72 md:h-80 lg:h-80 w-auto opacity-90 filter drop-shadow-2xl object-contain max-w-full"
                />
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
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex overflow-x-auto space-x-2 sm:space-x-4 scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                className={`whitespace-nowrap px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeCategory === category.slug
                    ? "category-button-active transform scale-105"
                    : "bg-white border-2 border-brand-green text-brand-green category-button-hover"
                }`}
              >
                {t(`categories.${category.slug}`, category.name)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items Display */}
      <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
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
