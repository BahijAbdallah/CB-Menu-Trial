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
            <li key={item.id} className="menu-card">
              <div className="thumb-wrap">
                <img className="menu-thumb" src={item.imageUrl || getDefaultImageForItem(category.slug, index)} alt={item.name} />
                {item.outOfStock && (
                  <div className="out-of-stock-badge bg-[#e46f60] font-semibold pt-[5.6px] pb-[5.6px] pl-[7.2px] pr-[7.2px] text-[12px] text-center ml-[77px] mr-[77px] mt-[-3px] mb-[-3px]">
                    {t('menu.outOfStock')}
                  </div>
                )}
              </div>
              <div className="menu-meta">
                <h3 className="menu-title">{item.name}</h3>
                <p className="menu-desc">{item.description}</p>
              </div>
              <div className="menu-price">{`${parseFloat(item.price).toFixed(2)} $`}</div>
              <div className="menu-alls">
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
