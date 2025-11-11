import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import type { Category, MenuItem } from "@shared/schema";
import { ALLERGENS_MAP, type AllergenSlug } from "@/constants/allergens";
import { getDefaultImageForItem } from "@/lib/menu-data";
import { useLocale, getTranslatedItemName, getTranslatedItemDescription } from "@/utils/translation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface ExpandableDescriptionProps {
  text: string;
  maxLines?: number;
}

function ExpandableDescription({ text, maxLines = 2 }: ExpandableDescriptionProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  
  useEffect(() => {
    if (textRef.current) {
      // Temporarily remove line clamp to measure full height
      const element = textRef.current;
      element.style.webkitLineClamp = 'unset';
      element.style.display = 'block';
      const fullHeight = element.scrollHeight;
      
      // Set to 2 lines and measure clamped height
      element.style.webkitLineClamp = maxLines.toString();
      element.style.display = '-webkit-box';
      const clampedHeight = element.scrollHeight;
      
      // If full height is greater than clamped height, we need truncation
      setNeedsTruncation(fullHeight > clampedHeight);
      
      // Reset to appropriate state
      if (!needsTruncation || isExpanded) {
        element.style.webkitLineClamp = 'unset';
        element.style.display = 'block';
      }
    }
  }, [text, maxLines, isExpanded, needsTruncation]);
  
  if (!needsTruncation) {
    return <p ref={textRef} className="menu-desc">{text}</p>;
  }
  
  return (
    <div className="expandable-description">
      <p 
        ref={textRef}
        className={`menu-desc ${!isExpanded ? 'line-clamped' : 'expanded'}`}
      >
        {text}
      </p>
      <button
        className="view-more-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        data-testid={`toggle-description-${isExpanded ? 'less' : 'more'}`}
      >
        {isExpanded ? t('menu.viewLess', 'View Less') : t('menu.viewMore', 'View More')}
      </button>
    </div>
  );
}

interface MenuCategoryProps {
  category: Category;
  items: MenuItem[];
}

interface MenuItemWithImageProps {
  item: MenuItem;
  category: Category;
  index: number;
  allergens: AllergenSlug[];
}

function MenuItemWithImage({ item, category, index, allergens }: MenuItemWithImageProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get translated content with fallback to English
  const itemName = getTranslatedItemName(item, locale);
  const itemDescription = getTranslatedItemDescription(item, locale);
  
  // Check if item is out of stock (using outOfStock field from database)
  const isOutOfStock = item.outOfStock;
  
  const imageUrl = (item.imageUrl && !imageError) 
    ? (getEncodedImageUrl(item.imageUrl) || getDefaultImageForItem(category.slug, index)) 
    : getDefaultImageForItem(category.slug, index);
  
  // High-resolution image for modal - use original URL without constraints
  const highResImageUrl = item.imageUrl 
    ? (getEncodedImageUrl(item.imageUrl) || imageUrl)
    : imageUrl;
  
  return (
    <>
      <li 
        className="menu-card cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsModalOpen(true)}
        data-testid={`menu-card-${item.id}`}
      >
      <div className="thumb-wrap">
        {!imageLoaded && (
          <div className="menu-thumb bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-500 text-xs">Loading...</div>
          </div>
        )}
        <img 
          className={`menu-thumb ${!imageLoaded ? 'hidden' : ''}`}
          src={imageUrl}
          alt={itemName}
          loading="lazy"
          width="176"
          height="152"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
      </div>
      <div className="menu-meta">
        <h3 className="menu-title">{itemName}</h3>
        <ExpandableDescription text={itemDescription} />
        
        {/* Allergy badges under description */}
        {allergens.length > 0 && (
          <div className="allergen-badges" role="list" aria-label={t('menu.allergens', 'Contains allergens')}>
            {allergens.map((slug: AllergenSlug) => {
              const a = ALLERGENS_MAP[slug];
              if (!a) {
                console.warn(`Unknown allergen: ${slug}`);
                return null;
              }
              return (
                <span 
                  key={slug} 
                  className="allergen-badge"
                  role="listitem"
                  aria-label={`${t('menu.allergen', 'Allergen')}: ${a.label}`}
                  title={a.label}
                >
                  <img src={a.icon} alt={a.label} aria-hidden="true" />
                  <span className="allergen-label">{a.label}</span>
                </span>
              );
            }).filter(Boolean)}
          </div>
        )}
      </div>
      <div className="menu-price">
        <div>{`${parseFloat(item.price).toFixed(2)} $`}</div>
        {isOutOfStock && (
          <p style={{ color: '#B91C1C', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
            {t('menu.outOfStock')}
          </p>
        )}
      </div>
      </li>

      {/* Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#f0eee7]">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left side - Large High-Resolution Image */}
            <div className="relative h-[400px] md:h-[500px] bg-white">
              <img 
                src={highResImageUrl}
                alt={itemName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right side - Item Details */}
            <div className="p-8 flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-[#3b4b30] mb-4" style={{ fontFamily: 'Billmake, sans-serif' }}>
                  {itemName}
                </DialogTitle>
              </DialogHeader>

              {/* Description */}
              <div className="flex-1 mb-6">
                <div className="text-[#6d756f] text-base leading-relaxed whitespace-pre-line" style={{ fontFamily: 'Billmake, sans-serif' }}>
                  {itemDescription}
                </div>
              </div>

              {/* Price */}
              <div className="text-2xl font-bold text-[#efa25f] mb-4" style={{ fontFamily: 'Billmake, sans-serif' }}>
                ${parseFloat(item.price).toFixed(2)}
              </div>

              {/* Allergens */}
              {allergens.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-3">
                    {allergens.map((slug: AllergenSlug) => {
                      const a = ALLERGENS_MAP[slug];
                      if (!a) return null;
                      return (
                        <div 
                          key={slug} 
                          className="flex items-center gap-2 px-3 py-2 bg-white/70 rounded-full border border-[#3b4b30]/20"
                          title={a.label}
                        >
                          <img src={a.icon} alt={a.label} className="w-5 h-5" />
                          <span className="text-sm font-semibold text-[#3b4b30]" style={{ fontFamily: 'Billmake, sans-serif' }}>
                            {a.label}
                          </span>
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                </div>
              )}

              {/* Out of Stock Badge */}
              {isOutOfStock && (
                <div className="mt-2 px-4 py-2 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 font-bold text-center" style={{ fontFamily: 'Billmake, sans-serif' }}>
                    {t('menu.outOfStock', 'Out of Stock')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function MenuCategory({ category, items }: MenuCategoryProps) {
  const { t } = useTranslation();
  
  return (
    <section className="container">
      {/* Responsive menu list: desktop layout scaled down for mobile */}
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
            <MenuItemWithImage 
              key={item.id} 
              item={item} 
              category={category} 
              index={index} 
              allergens={allergens}
            />
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