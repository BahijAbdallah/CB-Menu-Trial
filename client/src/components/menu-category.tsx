import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { Category, MenuItem } from "@shared/schema";
import { ALLERGENS_MAP, type AllergenSlug } from "@/constants/allergens";
import { getDefaultImageForItem } from "@/lib/menu-data";
import { useLocale } from "@/hooks/useLocale";
import { pick, dir, align } from "@/utils/i18nMap";
import { toLocalizedFields } from "@/utils/items";
import type { Item } from "@/utils/items";

interface MenuCategoryProps {
  category: Category;
  items: MenuItem[];
}

interface MenuItemWithImageProps {
  item: MenuItem;
  category: Category;
  index: number;
  allergens: AllergenSlug[];
  locale?: string; // Added to force re-render on language change
}

// Adapter function to convert MenuItem to Item format
function adaptMenuItem(item: MenuItem): Item {
  return {
    id: item.id.toString(),
    title: {
      en: item.name,
      ar: item.nameArabic || undefined,
      fr: item.nameFrench || undefined
    },
    description: {
      en: item.description || "",
      ar: item.descriptionArabic || undefined,
      fr: item.descriptionFrench || undefined
    },
    price: parseFloat(item.price),
    image: item.imageUrl || undefined
  };
}

function MenuItemWithImage({ item, category, index, allergens }: MenuItemWithImageProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Convert to Item format and get localized content
  const adaptedItem = adaptMenuItem(item);
  const { title, description } = toLocalizedFields(adaptedItem);
  const itemName = pick(title, locale);
  const itemDescription = pick(description, locale);
  
  // Check if item is out of stock (using outOfStock field from database)
  const isOutOfStock = item.outOfStock;
  
  return (
    <article className="menu-card" dir={dir(locale)}>
      {!imageLoaded && (
        <div className="media bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-500 text-xs">Loading...</div>
        </div>
      )}
      <img 
        className={`media ${!imageLoaded ? 'hidden' : ''}`}
        src={(item.imageUrl && !imageError) ? item.imageUrl : getDefaultImageForItem(category.slug, index)}
        alt={itemName}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
      />
      <div className="text" style={{ textAlign: align(locale) }}>
        <h3 className="title">{itemName}</h3>
        <p className="desc">{itemDescription}</p>
        
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
      <div className="price">
        {adaptedItem.price?.toFixed(2)} $
        {isOutOfStock && (
          <p style={{ color: '#B91C1C', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
            {t('menu.outOfStock')}
          </p>
        )}
      </div>
    </article>
  );
}

export default function MenuCategory({ category, items }: MenuCategoryProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  
  return (
    <section className="container">
      {/* Responsive menu list: desktop layout scaled down for mobile */}
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
              locale={locale}
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