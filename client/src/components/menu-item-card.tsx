import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { getDefaultImageForItem } from "@/lib/menu-data";
import { useState } from "react";
import type { Category, MenuItem } from "@shared/schema";

// Helper function to safely encode image URLs for filenames with special characters
function getEncodedImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // If it's already a full URL (starts with http), return as-is
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // If it's a path starting with /, extract the filename and encode it
  if (imageUrl.startsWith('/')) {
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const pathWithoutFilename = parts.slice(0, -1).join('/');
    return pathWithoutFilename + '/' + encodeURIComponent(filename);
  }
  
  return imageUrl;
}

interface MenuItemCardProps {
  item: MenuItem;
  category: Category;
  index: number;
}

export default function MenuItemCard({ item, category, index }: MenuItemCardProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 relative">
      <div className="relative overflow-hidden">
        {!imageLoaded && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        )}
        <img
          src={(item.imageUrl && !imageError) ? (getEncodedImageUrl(item.imageUrl) || getDefaultImageForItem(category.slug, index)) : getDefaultImageForItem(category.slug, index)}
          alt={item.name}
          className={`w-full h-48 object-cover ${!imageLoaded ? 'hidden' : ''}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
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
          <div>
            <span className="font-bold text-warm-gold text-[15px]">
              $ {item.price}
            </span>
            {item.outOfStock && (
              <p style={{ color: '#B91C1C', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
                {t('menu.outOfStock')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
