export type AllergenSlug = 'gluten'|'fish'|'peanuts'|'nuts'|'sesame';

export const ALLERGENS: { slug: AllergenSlug; label: string; icon: string }[] = [
  { slug: 'gluten',  label: 'Gluten',  icon: '/icons/allergens/gluten.png' },
  { slug: 'fish',    label: 'Fish',    icon: '/icons/allergens/fish.png' },
  { slug: 'peanuts', label: 'Peanuts', icon: '/icons/allergens/peanuts.png' },
  { slug: 'nuts',    label: 'Nuts',    icon: '/icons/allergens/nuts.png' },
  { slug: 'sesame',  label: 'Sesame',  icon: '/icons/allergens/sesame.png' },
];

export const ALLERGENS_MAP = Object.fromEntries(
  ALLERGENS.map(a => [a.slug, a])
) as Record<AllergenSlug, {slug: AllergenSlug; label: string; icon: string}>;