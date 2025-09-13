import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { Category, MenuItem } from "@shared/schema";
import { ALLERGENS_MAP, type AllergenSlug } from "@/constants/allergens";
import { getDefaultImageForItem } from "@/lib/menu-data";

interface MenuCategoryProps {
  category: Category;
  items: MenuItem[];
}

interface MenuItemWithImageProps {
  item: MenuItem;
  category: Category;
  index: number;
  allergens: AllergenSlug[];
}

function MenuItemWithImage({ item, category, index, allergens }: MenuItemWithImageProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Check if item is out of stock (using outOfStock field from database)
  const isOutOfStock = item.outOfStock;
  
  return (
    <li className="menu-card">
      <div className="thumb-wrap">
        {!imageLoaded && (
          <div className="menu-thumb bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-500 text-xs">Loading...</div>
          </div>
        )}
        <img 
          className={`menu-thumb ${!imageLoaded ? 'hidden' : ''}`}
          src={(item.imageUrl && !imageError) ? item.imageUrl : getDefaultImageForItem(category.slug, index)}
          alt={item.name}
          loading="lazy"
          width="176"
          height="152"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
      </div>
      <div className="menu-meta">
        <h3 className="menu-title">{item.name}</h3>
        <p className="menu-desc">{item.description}</p>
        
        {/* Allergy badges under description */}
        {allergens.length > 0 && (
          <div className="allergen-badges" role="list" aria-label={t('menu.allergens', 'Contains allergens')}>
            {allergens.map((slug: AllergenSlug) => {
              const a = ALLERGENS_MAP[slug];
              if (!a) {
                console.warn(`Unknown allergen: ${slug}`);
                return null;
              }
              return (
                <span 
                  key={slug} 
                  className="allergen-badge"
                  role="listitem"
                  aria-label={`${t('menu.allergen', 'Allergen')}: ${a.label}`}
                  title={a.label}
                >
                  <img src={a.icon} alt={a.label} aria-hidden="true" />
                  <span className="allergen-label">{a.label}</span>
                </span>
              );
            }).filter(Boolean)}
          </div>
        )}
      </div>
      <div className="menu-price">
        <div>{`${parseFloat(item.price).toFixed(2)} $`}</div>
        {isOutOfStock && (
          <p style={{ color: '#B91C1C', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
            {t('menu.outOfStock')}
          </p>
        )}
      </div>
    </li>
  );
}

export default function MenuCategory({ category, items }: MenuCategoryProps) {
  const { t } = useTranslation();
  
  return (
    <section className="container">
      {/* Desktop/tablet: centered stacked cards */}
      <ul id="menuList" className="menu-list desktop-menu-list" role="list">
        {items.map((item, index) => {
          // Parse allergens from JSON string or use array directly
          let allergens: AllergenSlug[] = [];
          if (item.allergens) {
            if (typeof item.allergens === 'string') {
              try {
                allergens = JSON.parse(item.allergens);
              } catch {
                allergens = [];
              }
            } else {
              allergens = item.allergens;
            }
          }
          
          return (
            <MenuItemWithImage 
              key={item.id} 
              item={item} 
              category={category} 
              index={index} 
              allergens={allergens}
            />
          );
        })}
      </ul>
      
      {/* Mobile: horizontal scroll cards */}
      <div className="mobile-menu-container">
        <ul className="menu-list mobile-menu-list" role="list">
          {items.map((item, index) => {
            // Parse allergens from JSON string or use array directly
            let allergens: AllergenSlug[] = [];
            if (item.allergens) {
              if (typeof item.allergens === 'string') {
                try {
                  allergens = JSON.parse(item.allergens);
                } catch {
                  allergens = [];
                }
              } else {
                allergens = item.allergens;
              }
            }
            
            return (
              <MenuItemWithImage 
                key={item.id} 
                item={item} 
                category={category} 
                index={index} 
                allergens={allergens}
              />
            );
          })}
        </ul>
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">{t('common.noItems')}</p>
        </div>
      )}
    </section>
  );
}