import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

import MenuCategory from "@/components/menu-category";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Category, MenuItem } from "@shared/schema";
import { ALLERGENS } from "@/constants/allergens";

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
  const { t, i18n } = useTranslation();
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
      {/* Header */}
      <header className="site-header">
        <div className="hdr container">
          <a className="brand" href="/">
            <img src="/images/logo.png" alt="Chez Beyrouth" />
          </a>

          <div className="hdr-actions">
            <select id="lang-switch" aria-label="Language" className="pill" onChange={(e) => {
              const lang = e.target.value;
              i18n.changeLanguage(lang);
            }}>
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="ar">AR</option>
            </select>

            <Link href="/halal-certificates">
              <button className="halal-chip" type="button">
                <img src="/icons/halal.svg" alt="" aria-hidden="true" />
                <span>Halal Certification</span>
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
              <span className="line-1">{t('brand.menuTitle', 'The Menu')}</span><br/>
              <span className="line-2">{t('brand.subtitle', 'OF BEYROUTH')}</span>
            </h1>
          </div>
        </div>
      </section>
      
      {/* Allergens Legend */}
      <AllergensLegend />



      {/* Menu Categories Navigation and Items Display - White Background */}
      <div style={{ background: 'white' }}>
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
    </div>
  );
}
