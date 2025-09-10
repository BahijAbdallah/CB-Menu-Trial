import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

import MenuCategory from "@/components/menu-category";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Category, MenuItem } from "@shared/schema";
import { ALLERGENS } from "@shared/allergens";

// Allergens Legend Component
function AllergensLegend() {
  const { t } = useTranslation();
  
  return (
    <section className="allergens-legend">
      <div className="container">
        <h3>{t('allergens.title', 'ALLERGENS')}</h3>
        <p>{t('allergens.description', 'Please ask our staff for guidance on allergens and cross-contamination.')}</p>
        <ul className="legend-row" id="legendRow">
          {ALLERGENS.map((allergen) => (
            <li key={allergen.slug}>
              <div className="chip">
                <img src={allergen.icon} alt={allergen.label} aria-label={allergen.label} />
              </div>
              <span>{allergen.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}



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
      <header className="site-header">
        <div className="container head-wrap">
          <div className="brand">
            <span className="logo-mark"></span>
            <span className="brand-lines">
              <span className="brand-top">{t('brand.menuTitle', 'The Menu')}</span>
              <span className="brand-bot">{t('brand.subtitle', 'OF BEYROUTH')}</span>
            </span>
          </div>
          <div className="head-actions">
            <LanguageSwitcher />
            <Link href="/halal-certificates" className="halal-badge">
              {t('nav.halal', 'Halal')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero"></section>
      
      {/* Allergens Legend */}
      <AllergensLegend />



      {/* Menu Categories Navigation */}
      <section className="bg-white shadow-sm border-b relative z-10">
        <div className="container mx-auto py-3 sm:py-4">
          {/* Categories scroll container with enhanced fade effects */}
          <div className="relative group">
            {/* Left fade gradient - more prominent */}
            <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
            
            {/* Right fade gradient - more prominent */}
            <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
            
            {/* Optional scroll indicators */}
            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-brand-green/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"></div>
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-brand-green/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none"></div>
            
            {/* Scrollable categories container */}
            <div 
              className="flex overflow-x-auto pb-2 smooth-scroll"
              style={{ 
                scrollBehavior: 'smooth',
                scrollSnapType: 'x proximity',
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem'
              }}
            >
              {/* First spacer for proper left padding */}
              <div className="flex-shrink-0 w-3 sm:w-6"></div>
              
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`flex-shrink-0 whitespace-nowrap px-4 sm:px-5 lg:px-7 py-2.5 sm:py-3.5 rounded-full font-medium transition-all duration-300 text-sm sm:text-base mr-3 sm:mr-5 ${
                    activeCategory === category.slug
                      ? "category-button-active transform scale-105 shadow-xl"
                      : "bg-white border-2 border-brand-green text-brand-green category-button-hover shadow-md hover:shadow-lg"
                  }`}
                  style={{ 
                    scrollSnapAlign: 'start',
                    minWidth: 'fit-content'
                  }}
                >
                  {t(`categories.${category.slug}`, category.name)}
                </button>
              ))}
              
              {/* Last spacer for proper right padding */}
              <div className="flex-shrink-0 w-3 sm:w-6"></div>
            </div>
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
