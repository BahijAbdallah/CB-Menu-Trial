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
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 relative ${!item.isAvailable ? 'opacity-75' : ''}`}>
      <div className="relative">
        <img
          src={item.imageUrl || getDefaultImageForItem(category.slug, index)}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
            <Badge className="bg-red-600 text-white font-semibold px-3 py-1 text-sm shadow-lg">
              {t('menu.outOfStock')}
            </Badge>
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
          {item.isAvailable ? (
            <span className="font-bold text-warm-gold text-[15px]">
              $ {item.price}
            </span>
          ) : (
            <span className="font-bold text-gray-400 text-[15px] line-through">
              $ {item.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
