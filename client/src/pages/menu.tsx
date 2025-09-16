import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

import MenuCategory from "@/components/menu-category";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Category, MenuItem } from "@shared/schema";
import { ALLERGENS } from "@/constants/allergens";
import { useLocale, getTranslatedCategoryName } from "@/utils/translation";

import islam from "@assets/islam.png";

// Allergens Legend Component
function AllergensLegend() {
  const { t } = useTranslation();

  return (
    <section className="allergens-legend pt-[50px] pb-[50px]">
      <div className="container">
        <h4 className="text-[18px] font-semibold">{t("allergens.title", "ALLERGENS")}</h4>
        <p>
          {t(
            "allergens.description",
            " Please be adviced that our food may contain or come  into contact with common allergens, including:",
          )}
        </p>
        <ul className="legend-row">
          {ALLERGENS.map((a) => (
            <li key={a.slug}>
              <img className="allergen-img" src={a.icon} alt={a.label} />
              <span>{a.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function MenuPage() {
  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (!langRef.current) return;
      if (!langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("click", onClickAway);
    return () => document.removeEventListener("click", onClickAway);
  }, []);

  // Scroll detection for header border
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 4) {
        document.body.classList.add("scrolled");
      } else {
        document.body.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery<
    MenuItem[]
  >({
    queryKey: ["/api/menu-items"],
  });

  // Set first category as active when categories load
  if (categories.length > 0 && !activeCategory) {
    setActiveCategory(categories[0].slug);
  }

  // Auto-scroll active chip into view on desktop
  useEffect(() => {
    if (activeCategory && window.innerWidth >= 1024) {
      const activeButton = document.querySelector(`.menu-tab.is-active`);
      if (activeButton) {
        activeButton.scrollIntoView({ 
          inline: 'center', 
          block: 'nearest', 
          behavior: 'instant' 
        });
      }
    }
  }, [activeCategory]);

  // Category strip scrolling functionality - fixed for mobile & tablet
  useEffect(() => {
    (function(){
      const strip = document.querySelector('#categoryStrip, .menu-category-strip, .menu-category-tabs, nav .categories, .categories-strip');
      if(!strip) { console.warn('category strip not found'); return; }

      // 1) Unblock any parent that hides horizontal overflow
      let p = strip.parentElement;
      while(p){
        const cs = getComputedStyle(p);
        if(cs.overflowX === 'hidden' || cs.overflowX === 'clip'){
          p.style.overflowX = 'visible';   // no visual change; just allow child scroll
        }
        p = p.parentElement;
      }

      // 2) Runtime safeties (no visual change)
      const stripElement = strip as HTMLElement;
      stripElement.style.overflowX = 'auto';
      stripElement.style.whiteSpace = 'nowrap';
      (stripElement.style as any).webkitOverflowScrolling = 'touch';
      stripElement.style.scrollBehavior = 'smooth';

      // 3) Convert vertical wheel to horizontal (desktop trackpads/mice)
      stripElement.addEventListener('wheel', (e)=>{
        if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
          stripElement.scrollBy({left: e.deltaY, behavior: 'auto'});
          e.preventDefault();
        }
      }, {passive:false});

      // 4) Verify we can reach both ends; if not, relax any sticky/clip ancestors
      function ensureEndsReachable(){
        const before = { w: stripElement.scrollWidth, c: stripElement.clientWidth };
        // try full right then full left
        stripElement.scrollTo({ left: stripElement.scrollWidth, behavior: 'auto' });
        const atEnd = Math.abs(stripElement.scrollLeft - (stripElement.scrollWidth - stripElement.clientWidth)) <= 1;
        stripElement.scrollTo({ left: 0, behavior: 'auto' });
        const atStart = stripElement.scrollLeft === 0;

        // If either end is blocked, remove clip from nearest sticky ancestor
        if(!atEnd || !atStart){
          let a = stripElement.parentElement;
          while(a){
            const cs = getComputedStyle(a);
            if(cs.position === 'sticky' || cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowX === 'clip'){
              a.style.overflowX = 'visible';
              a.style.overflow = cs.overflowY === 'hidden' ? 'visible hidden' : 'visible';
            }
            a = a.parentElement;
          }
        }
        console.log('categories widths', before, 'scrollLeft', stripElement.scrollLeft);
      }

      // 5) Run once and after a frame (in case of fonts/layout)
      ensureEndsReachable();
      requestAnimationFrame(ensureEndsReachable);
    })();
  }, [categories]);

  // Minimal category strip helper as requested
  useEffect(() => {
    (function(){
      // Category strip: select existing element (DO NOT create new elements)
      const strip = document.getElementById('categoryStrip') || 
                    document.querySelector('.menu-category-strip, .menu-category-tabs, nav .categories');
      if(strip){
        // Unblock parents that hide horizontal scroll (no visual change)
        let p = strip.parentElement;
        while(p){
          const cs = getComputedStyle(p);
          if(cs.overflowX === 'hidden') p.classList?.add('no-clip-h');
          p = p.parentElement;
        }
        // Convert vertical wheel to horizontal on desktop without changing visuals
        strip.addEventListener('wheel', (e)=>{
          if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
            strip.scrollBy({left: e.deltaY, behavior:'auto'});
            e.preventDefault();
          }
        }, {passive:false});

        // Center active pill if present
        const active = strip.querySelector('.active, .is-active, [aria-current="true"]');
        if(active) active.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});

        // Verify we can reach ends (console only)
        console.log('category pills:', strip.querySelectorAll('button,a,[role="tab"]').length);
        console.log('strip widths:', {clientWidth: strip.clientWidth, scrollWidth: strip.scrollWidth});
      }
    })();
  }, []);

  // Description clamp with toggle functionality
  useEffect(() => {
    (function(){
      const cards = document.querySelectorAll('.menu-item-card, .item-card');
      if(!cards.length) return;

      console.log('Debug: Found', cards.length, 'cards with selector .menu-item-card, .item-card');
      
      const getDesc = (card: Element)=>{
        return card.querySelector('.desc, .description, [data-desc]');
      };

      cards.forEach((card: Element)=>{
        const desc = getDesc(card) as HTMLElement;
        if(!desc) { 
          console.log('Debug: No desc found in card', card); 
          return; 
        }
        if(desc.dataset.clamped === '1') return;

        // Apply initial 2-line clamp
        desc.classList.add('desc--clamp-2');
        desc.dataset.clamped = '1';

        // Check if overflow exists; only then add toggle
        const probe = desc.cloneNode(true) as HTMLElement;
        probe.style.cssText = 'position:absolute;visibility:hidden;height:auto;display:block;overflow:visible;-webkit-line-clamp:unset;-webkit-box-orient:unset;';
        document.body.appendChild(probe);
        const fullH = probe.scrollHeight;
        document.body.removeChild(probe);
        const collapsedH = desc.getBoundingClientRect().height;
        const isOverflowing = fullH > collapsedH + 1;
        if(!isOverflowing) return;

        // Create toggle
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'desc-toggle';
        btn.textContent = 'View more';
        btn.setAttribute('aria-expanded','false');
        btn.setAttribute('aria-controls', (desc.id ||= 'desc_' + Math.random().toString(36).slice(2)));
        desc.insertAdjacentElement('afterend', btn);

        // Toggle behavior
        btn.addEventListener('click', ()=>{
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          if(expanded){
            // Collapse
            desc.classList.add('desc--clamp-2');
            btn.textContent = 'View more';
            btn.setAttribute('aria-expanded','false');
            card.classList.remove('expanded');
            // keep list compact again
          }else{
            // Expand this card only
            desc.classList.remove('desc--clamp-2');
            btn.textContent = 'View less';
            btn.setAttribute('aria-expanded','true');
            card.classList.add('expanded');
            // Ensure expanded text is fully visible
            card.scrollIntoView({behavior:'smooth', block:'nearest'});
          }
        });
      });

      console.log('Description clamp initialized on', cards.length, 'nodes');
    })();
  }, [menuItems]); // Run when menu items change

  const activeCategoryData = categories.find(
    (cat) => cat.slug === activeCategory,
  );
  const categoryItems = menuItems.filter((item) =>
    activeCategoryData ? item.categoryId === activeCategoryData.id : false,
  );

  if (categoriesLoading || menuItemsLoading) {
    return (
      <div className="min-h-screen bg-light-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-brand-green">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-cream relative">
      {/* Header */}
      <header className="site-header overlay-on-hero">
        <div className="header-inner">
          <a className="brand" href="/">
            <img src="/images/logo.png" alt="Chez Beyrouth" />
          </a>

          <div className="header-actions">
            {/* Language */}
            <div className="lang" ref={langRef}>
              <button
                className="pill lang-trigger"
                aria-haspopup="menu"
                aria-expanded={langOpen}
                onClick={() => setLangOpen(v => !v)}
              >
                {i18n.language?.toUpperCase() || 'EN'}
              </button>

              <div className={`lang-menu ${langOpen ? "is-open" : ""}`} role="menu">
                <button 
                  role="menuitem" 
                  onClick={() => { i18n.changeLanguage('en'); setLangOpen(false); }} 
                  className={i18n.language === 'en' ? 'is-active' : ''}
                >
                  EN
                </button>
                <button 
                  role="menuitem" 
                  onClick={() => { i18n.changeLanguage('fr'); setLangOpen(false); }}
                  className={i18n.language === 'fr' ? 'is-active' : ''}
                >
                  FR
                </button>
                <button 
                  role="menuitem" 
                  onClick={() => { i18n.changeLanguage('ar'); setLangOpen(false); }}
                  className={i18n.language === 'ar' ? 'is-active' : ''}
                >
                  AR
                </button>
              </div>
            </div>

            {/* Halal Certification with mosque icon */}
            <Link href="/halal" className="pill halal-btn" aria-label="Halal Certification">
              <img className="icon" src={islam} alt="" />
              <span className="halal-text">Halal Certification</span>
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner container">
          <div className="hero-lockup">
            <div className="sprout"></div>
            <h1 className="hero-title pl-[30px] pr-[30px]">
              <span className="line-1">{t("brand.menuTitle", "The Menu")}</span>
              <br />
              <span className="line-2">
                {t("brand.subtitle", "OF BEYROUTH")}
              </span>
            </h1>
          </div>
        </div>
      </section>
      {/* Allergens Legend */}
      <AllergensLegend />
      {/* Menu Categories Navigation and Items Display - White Background */}
      <div style={{ background: "white" }}>
        <div className="category-strip-wrap">
          <button className="cat-arrow left" aria-label="Scroll left" type="button">‹</button>
          <nav
            id="categoryStrip"
            className="category-strip menu-tabs text-center"
          >
            {categories.map((category, i) => {
              const COLOR_CYCLE = ["olive", "coral", "taupe", "yellow"] as const; // repeats
              const COLOR_BY_SLUG: Record<string, (typeof COLOR_CYCLE)[number]> =
                {
                  "breakfast items": "olive",
                  salads: "coral",
                  "hot appetizers": "taupe",
                  "cold appetizers": "yellow",
                  "main course": "taupe", // stays taupe when active
                  "sandwiches & burgers": "olive",
                  "plat du jour": "yellow",
                  desserts: "coral",
                };
              const norm = (s: string) => s.toLowerCase().trim();

              const categoryName = getTranslatedCategoryName(category, locale);
              const tone =
                COLOR_BY_SLUG[norm(categoryName)] ??
                COLOR_CYCLE[i % COLOR_CYCLE.length];
              const isActive = category.slug === activeCategory;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`menu-tab variant-${tone} category-btn ${isActive ? "is-active" : ""}`}
                  data-category={category.slug}
                >
                  {categoryName}
                </button>
              );
            })}
          </nav>
          <button className="cat-arrow right" aria-label="Scroll right" type="button">›</button>
        </div>

        {/* Menu Items Display */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          {activeCategoryData && (
            <MenuCategory category={activeCategoryData} items={categoryItems} />
          )}
        </section>
      </div>
    </div>
  );
}
