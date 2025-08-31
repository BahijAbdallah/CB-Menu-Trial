import MenuItemCard from "./menu-item-card";
import { useTranslation } from "react-i18next";
import type { Category, MenuItem } from "@shared/schema";

interface MenuCategoryProps {
  category: Category;
  items: MenuItem[];
}

export default function MenuCategory({ category, items }: MenuCategoryProps) {
  const { t } = useTranslation();
  
  return (
    <div>
      <div className="text-center mb-12">
        <h3 className="font-parslay text-5xl font-bold text-title-coral mb-4">
          {t(`categories.${category.slug}`, category.name)}
        </h3>
        <p className="text-saddle-brown text-lg max-w-2xl mx-auto">
          {t('menu.subtitle')}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <MenuItemCard key={item.id} item={item} category={category} index={index} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-saddle-brown text-lg">{t('common.noItems')}</p>
        </div>
      )}
    </div>
  );
}
