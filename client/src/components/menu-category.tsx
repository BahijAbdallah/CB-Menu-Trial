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
      </div>
      <div className="menu-price">
        <div>{`${parseFloat(item.price).toFixed(2)} $`}</div>
        {item.outOfStock && (
          <p style={{ color: '#B91C1C', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
            {t('menu.outOfStock')}
          </p>
        )}
      </div>
      <div className="menu-alls">
        {allergens.map((slug: AllergenSlug) => {
          const a = ALLERGENS_MAP[slug];
          if (!a) {
            console.warn(`Unknown allergen: ${slug}`);
            return null;
          }
          return <img key={slug} src={a.icon} alt={a.label} title={a.label} />;
        }).filter(Boolean)}
      </div>
    </li>
  );
}

export default function MenuCategory({ category, items }: MenuCategoryProps) {
  const { t } = useTranslation();
  
  return (
    <section className="container">
      <ul id="menuList" className="menu-list" role="list">
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
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">{t('common.noItems')}</p>
        </div>
      )}
    </section>
  );
}