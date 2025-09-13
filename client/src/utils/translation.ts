import { useTranslation } from 'react-i18next';
import type { MenuItem, Category } from '@shared/schema';

export type SupportedLanguage = 'en' | 'ar' | 'fr';

/**
 * Get translated menu item name with fallback to English
 */
export function getTranslatedItemName(item: MenuItem, language: SupportedLanguage): string {
  switch (language) {
    case 'ar':
      return item.nameArabic || item.name;
    case 'fr':
      return item.nameFrench || item.name;
    case 'en':
    default:
      return item.name;
  }
}

/**
 * Get translated menu item description with fallback to English
 */
export function getTranslatedItemDescription(item: MenuItem, language: SupportedLanguage): string {
  switch (language) {
    case 'ar':
      return item.descriptionArabic || item.description || '';
    case 'fr':
      return item.descriptionFrench || item.description || '';
    case 'en':
    default:
      return item.description || '';
  }
}

/**
 * Get translated category name with fallback to English
 */
export function getTranslatedCategoryName(category: Category, language: SupportedLanguage): string {
  switch (language) {
    case 'ar':
      return category.nameArabic || category.name;
    case 'fr':
      return category.nameFrench || category.name;
    case 'en':
    default:
      return category.name;
  }
}

/**
 * Hook to get current language as SupportedLanguage type
 */
export function useCurrentLanguage(): SupportedLanguage {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  // Map i18n language codes to our supported languages
  if (currentLang.startsWith('ar')) return 'ar';
  if (currentLang.startsWith('fr')) return 'fr';
  return 'en'; // Default fallback
}