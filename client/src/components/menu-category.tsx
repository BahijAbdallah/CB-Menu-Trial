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
            <li key={item.id} className="menu-card v3">
              <img className="menu-thumb v3" src={item.imageUrl || getDefaultImageForItem(category.slug, index)} alt={item.name} />

              <div className="menu-meta v3">
                <h3 className="menu-title v3">{item.name}</h3>
                <p className="menu-desc v3">{item.description}</p>
              </div>

              <div className="menu-price v3">${parseFloat(item.price).toFixed(2)}</div>

              <div className="menu-alls v3">
                {allergens.map((slug: AllergenSlug) => {
                  const a = ALLERGENS_MAP[slug];
                  return <img key={slug} src={a.icon} alt={a.label} title={a.label} />;
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
