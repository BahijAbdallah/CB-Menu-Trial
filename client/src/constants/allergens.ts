export type AllergenSlug = 'dairy'|'egg'|'gluten'|'fish'|'soya'|'nuts'|'sesame';

export const ALLERGENS: { slug: AllergenSlug; label: string; icon: string }[] = [
  { slug: 'dairy',   label: 'Dairy',   icon: '/icons/allergens/milk.png' },
  { slug: 'egg',     label: 'Egg',     icon: '/icons/allergens/egg.png' },
  { slug: 'gluten',  label: 'Gluten',  icon: '/icons/allergens/gluten.png' },
  { slug: 'fish',    label: 'Fish',    icon: '/icons/allergens/fish.png' },
  { slug: 'soya',    label: 'Soya',    icon: '/icons/allergens/soya.png' },
  { slug: 'nuts',    label: 'Nuts',    icon: '/icons/allergens/nuts.png' },
  { slug: 'sesame',  label: 'Sesame',  icon: '/icons/allergens/sesame.png' },
];

export const ALLERGENS_MAP = Object.fromEntries(
  ALLERGENS.map(a => [a.slug, a])
) as Record<AllergenSlug, {slug: AllergenSlug; label: string; icon: string}>;