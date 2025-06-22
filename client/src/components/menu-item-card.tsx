import { Badge } from "@/components/ui/badge";
import { getDefaultImageForItem } from "@/lib/menu-data";
import type { Category, MenuItem } from "@shared/schema";

interface MenuItemCardProps {
  item: MenuItem;
  category: Category;
  index: number;
}

export default function MenuItemCard({ item, category, index }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
      <img
        src={item.imageUrl || getDefaultImageForItem(category.slug, index)}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h4 className="font-script text-2xl font-semibold text-brand-green mb-2">
          {item.name}
        </h4>
        {item.nameArabic && (
          <h5 className="font-script text-lg text-brand-coral mb-2" dir="rtl">
            {item.nameArabic}
          </h5>
        )}
        {item.description && (
          <p className="text-saddle-brown text-sm mb-4 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-brand-coral">
            ${item.price}
          </span>
          <Badge 
            variant={item.isAvailable ? "default" : "secondary"}
            className={item.isAvailable ? "bg-green-100 text-green-800" : ""}
          >
            {item.isAvailable ? "Available" : "Out of Stock"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
