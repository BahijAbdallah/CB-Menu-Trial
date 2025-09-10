import { useState, useEffect } from "react";
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

  // Scroll detection for header border
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 4) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="container hdr">
          <a className="brand" href="/">
            <img src="/images/logo.png" alt="Chez Beyrouth" />
          </a>
          <div className="hdr-actions">
            <LanguageSwitcher />
            <Link href="/halal-certificates">
              <button className="pill pill-outline" aria-label="Halal certified">
                {t('nav.halal', 'Halal')}
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner container">
          <div className="hero-lockup">
            <div className="sprout"></div>
            <h1 className="hero-title">
              <span>{t('brand.menuTitle', 'The Menu')}</span><br/>
              {t('brand.subtitle', 'OF BEYROUTH')}
            </h1>
          </div>
        </div>
      </section>
      
      {/* Allergens Legend */}
      <AllergensLegend />



      {/* Menu Categories Navigation */}
      <nav className="menu-tabs container" id="menuTabs">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.slug)}
            className={`menu-tab ${activeCategory !== category.slug ? 'is-inactive' : ''}`}
            data-cat={category.name}
          >
            {t(`categories.${category.slug}`, category.name)}
          </button>
        ))}
      </nav>

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
