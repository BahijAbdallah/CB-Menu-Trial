import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { DEFAULT_ITEM_IMAGE } from "@/lib/default-image";
import type { Category, MenuItem } from "@shared/schema";

// Helper function to safely encode image URLs for filenames with special characters
function getEncodedImageUrl(
  imageUrl: string | null | undefined,
): string | null {
  const trimmedImageUrl = imageUrl?.trim();
  if (!trimmedImageUrl) return null;

  // If it's already a full URL (starts with http), return as-is
  if (trimmedImageUrl.startsWith("http")) return trimmedImageUrl;

  // If it's a path starting with /, extract the filename and encode it
  if (trimmedImageUrl.startsWith("/")) {
    const parts = trimmedImageUrl.split("/");
    const filename = parts[parts.length - 1];
    const pathWithoutFilename = parts.slice(0, -1).join("/");
    return pathWithoutFilename + "/" + encodeURIComponent(filename);
  }

  return trimmedImageUrl;
}

interface MenuItemCardProps {
  item: MenuItem;
  category: Category;
  index: number;
}

export default function MenuItemCard({
  item,
  category,
  index,
}: MenuItemCardProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imgSrc =
    item.imageUrl?.trim() && !imageError
      ? (getEncodedImageUrl(item.imageUrl) ?? DEFAULT_ITEM_IMAGE)
      : DEFAULT_ITEM_IMAGE;

  return (
    <div className="menu-item-card bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 relative">
      <div className="relative overflow-hidden">
        {!imageLoaded && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        )}
        <img
          src={imgSrc}
          alt={item.name}
          className={`w-full h-48 object-cover ${!imageLoaded ? "hidden" : ""}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-6">
        <h4 className="font-alethia text-xl font-semibold text-dark-brown mb-2">
          {item.name}
        </h4>
        {item.description && (
          <p className="desc text-saddle-brown text-sm mb-4">
            {item.description}
          </p>
        )}
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-warm-gold text-[15px]">
              $ {item.price}
            </span>
            {item.outOfStock && (
              <p
                style={{
                  color: "#B91C1C",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                {t("menu.outOfStock")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
