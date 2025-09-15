import type { Localized } from "./i18nMap";

export type Item = {
  id: string;
  // Preferred new shape:
  title?: Localized;
  description?: Localized;
  // Legacy fields (still supported):
  name?: string; name_ar?: string; name_fr?: string;
  desc?: string; desc_ar?: string; desc_fr?: string;
  price?: number;
  image?: string;
};

export function toLocalizedFields(item: Item): { title: Localized; description: Localized } {
  return {
    title: item.title ?? { en: item.name, ar: item.name_ar, fr: item.name_fr },
    description: item.description ?? { en: item.desc, ar: item.desc_ar, fr: item.desc_fr },
  };
}