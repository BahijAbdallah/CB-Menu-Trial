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

  // Category strip scrolling functionality
  useEffect(() => {
    (function(){
      let scroller = document.getElementById('categoryStrip');
      if(!scroller){
        // Try to find the correct container and assign the id
        const candidates = Array.from(document.querySelectorAll('.category-strip, .menu-categories, .menu-category-tabs, nav, .tabs, .chips'))
          .filter(el => el.querySelectorAll('button, a').length >= 6);
        if(candidates[0]) { candidates[0].id = 'categoryStrip'; scroller = candidates[0] as HTMLElement; }
      }
      if(!scroller) { console.warn('categoryStrip not found'); return; }

      // Unblock parent containers that hide overflow
      let p = scroller.parentElement;
      while(p){ 
        const cs = getComputedStyle(p);
        if(cs.overflowX === 'hidden') p.style.overflowX = 'visible';
        p = p.parentElement;
      }

      // Ensure required styles at runtime
      Object.assign(scroller.style, {
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      });

      // Insert arrows if missing
      const wrap = scroller.closest('.category-strip-wrap') || (()=>{
        const w = document.createElement('div');
        w.className = 'category-strip-wrap';
        scroller.parentNode!.insertBefore(w, scroller);
        w.appendChild(scroller);
        return w;
      })();

      let leftBtn = wrap.querySelector('.cat-arrow.left') as HTMLButtonElement;
      let rightBtn = wrap.querySelector('.cat-arrow.right') as HTMLButtonElement;
      if(!leftBtn){
        leftBtn = document.createElement('button') as HTMLButtonElement;
        leftBtn.className = 'cat-arrow left';
        leftBtn.type = 'button';
        leftBtn.setAttribute('aria-label','Scroll left');
        leftBtn.textContent = '‹';
        wrap.insertBefore(leftBtn, scroller);
      }
      if(!rightBtn){
        rightBtn = document.createElement('button') as HTMLButtonElement;
        rightBtn.className = 'cat-arrow right';
        rightBtn.type = 'button';
        rightBtn.setAttribute('aria-label','Scroll right');
        rightBtn.textContent = '›';
        wrap.appendChild(rightBtn);
      }

      // Helpers
      const step = () => Math.max(260, Math.round(scroller!.clientWidth * 0.85));
      function updateArrows(){
        const atStart = scroller!.scrollLeft <= 0;
        const atEnd = scroller!.scrollLeft + scroller!.clientWidth >= scroller!.scrollWidth - 1;
        leftBtn.disabled = atStart;
        rightBtn.disabled = atEnd;
      }

      // Click handlers (include hard-jumps to extremes as fallback)
      leftBtn.addEventListener('click', ()=>{
        if(scroller.scrollLeft <= step()) scroller.scrollTo({left: 0, behavior: 'smooth'});
        else scroller.scrollBy({left: -step(), behavior: 'smooth'});
      });
      rightBtn.addEventListener('click', ()=>{
        const end = scroller.scrollWidth - scroller.clientWidth;
        if((end - scroller.scrollLeft) <= step()) scroller.scrollTo({left: end, behavior: 'smooth'});
        else scroller.scrollBy({left: step(), behavior: 'smooth'});
      });

      // Convert vertical wheel to horizontal scrolling on desktop
      scroller.addEventListener('wheel', (e)=>{
        if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
          scroller.scrollBy({left: e.deltaY, behavior:'auto'});
          e.preventDefault();
        }
      }, {passive:false});

      // Center a pill when clicked
      scroller.querySelectorAll('.category-btn, button, a').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          btn.scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
        });
      });

      // Initialize at the absolute left
      scroller.scrollTo({left: 0});
      scroller.addEventListener('scroll', updateArrows);
      window.addEventListener('resize', updateArrows);
      updateArrows();
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
      // Find all descriptions safely (mapped to actual classes used)
      const descNodes = document.querySelectorAll(
        '.menu-card .menu-desc, .menu-card .description, .menu-card [data-desc]'
      );
      if(!descNodes.length) return;

      descNodes.forEach(desc=>{
        const descElement = desc as HTMLElement;
        // Skip if already processed
        if(descElement.dataset.clamped === '1') return;

        // Apply initial 2-line clamp
        descElement.classList.add('desc--clamp-2');
        descElement.dataset.clamped = '1';

        // Measure if overflow exists (only then add the toggle)
        const was = descElement.style.webkitLineClamp;
        // Reliable overflow check: clone for natural height
        const clone = descElement.cloneNode(true) as HTMLElement;
        Object.assign(clone.style, {
          position:'absolute', visibility:'hidden', height:'auto',
          WebkitLineClamp:'unset', display:'block', overflow:'visible'
        });
        document.body.appendChild(clone);
        const fullH = clone.scrollHeight;
        document.body.removeChild(clone);
        const collapsedH = descElement.getBoundingClientRect().height;

        const isOverflowing = fullH > collapsedH + 1;
        if(!isOverflowing) return;

        // Create minimal toggle button
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'desc-toggle';
        toggle.textContent = 'View more';
        toggle.setAttribute('aria-expanded','false');

        // Place toggle right after the description (no style changes)
        descElement.insertAdjacentElement('afterend', toggle);

        // Toggle behavior
        toggle.addEventListener('click', ()=>{
          const card = descElement.closest('.menu-card');
          const expanded = toggle.getAttribute('aria-expanded') === 'true';

          if(expanded){
            // Collapse back to 2 lines
            descElement.classList.add('desc--clamp-2');
            toggle.textContent = 'View more';
            toggle.setAttribute('aria-expanded','false');
            card && card.classList.remove('expanded');
          }else{
            // Expand to full
            descElement.classList.remove('desc--clamp-2');
            toggle.textContent = 'View less';
            toggle.setAttribute('aria-expanded','true');
            card && card.classList.add('expanded');
          }
        });
      });

      // Console check (no UI change)
      console.log('Description clamp initialized on', descNodes.length, 'nodes');
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
