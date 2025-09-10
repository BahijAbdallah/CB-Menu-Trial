import { useTranslation } from "react-i18next";
import type { Category, MenuItem } from "@shared/schema";
import { ALLERGENS_MAP, type AllergenSlug } from "@/constants/allergens";

interface MenuCategoryProps {
  category: Category;
  items: MenuItem[];
}

export default function MenuCategory({ category, items }: MenuCategoryProps) {
  const { t } = useTranslation();
  
  const getDefaultImageForItem = (categorySlug: string, index: number) => {
    return `/assets/menu-item-food.jpg`; // Default placeholder image
  };
  
  return (
    <section className="container">
      <ul id="menuList" className="menu-list">
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
            <li key={item.id} className="menu-card">
              <img 
                src={item.imageUrl || getDefaultImageForItem(category.slug, index)} 
                alt={item.name}
                className="menu-thumb"
              />
              <div className="menu-meta">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
              <div className="menu-price">
                ${parseFloat(item.price).toFixed(2)}
              </div>
              <div className="menu-alls">
                {allergens.map((slug: AllergenSlug) => {
                  const a = ALLERGENS_MAP[slug];
                  return <img key={slug} src={a.icon} title={a.label} alt={a.label} className="allergen-icon"/>;
                })}
              </div>
            </li>
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
