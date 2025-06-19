import MenuItemCard from "./menu-item-card";
import type { Category, MenuItem } from "@shared/schema";

interface MenuCategoryProps {
  category: Category;
  items: MenuItem[];
}

export default function MenuCategory({ category, items }: MenuCategoryProps) {
  return (
    <div>
      <div className="text-center mb-12">
        <h3 className="font-playfair text-4xl font-bold text-dark-brown mb-4">
          {category.name}
        </h3>
        {category.nameArabic && (
          <h4 className="font-playfair text-2xl text-saddle-brown mb-4" dir="rtl">
            {category.nameArabic}
          </h4>
        )}
        <p className="text-saddle-brown text-lg max-w-2xl mx-auto">
          Discover our carefully crafted selections, blending Lebanese traditions with international favorites.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.filter(item => item.isAvailable).map((item, index) => (
          <MenuItemCard key={item.id} item={item} category={category} index={index} />
        ))}
      </div>

      {items.filter(item => item.isAvailable).length === 0 && (
        <div className="text-center py-12">
          <p className="text-saddle-brown text-lg">No items available in this category at the moment.</p>
        </div>
      )}
    </div>
  );
}
