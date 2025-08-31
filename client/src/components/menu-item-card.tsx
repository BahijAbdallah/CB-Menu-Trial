import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { getDefaultImageForItem } from "@/lib/menu-data";
import type { Category, MenuItem } from "@shared/schema";

interface MenuItemCardProps {
  item: MenuItem;
  category: Category;
  index: number;
}

export default function MenuItemCard({ item, category, index }: MenuItemCardProps) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 relative">
      <div className="relative">
        <img
          src={item.imageUrl || getDefaultImageForItem(category.slug, index)}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        {!item.isAvailable && (
          <div className="absolute -top-3 -right-3 z-10">
            <span className="out-of-stock-badge">
              {t('menu.outOfStock')}
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h4 className="font-alethia text-xl font-semibold text-dark-brown mb-2">
          {item.name}
        </h4>
        {item.description && (
          <p className="text-saddle-brown text-sm mb-4 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex justify-between items-center">
          <span className="font-bold text-warm-gold text-[15px]">
            $ {item.price}
          </span>
        </div>
      </div>
    </div>
  );
}
