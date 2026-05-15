import { DEFAULT_ITEM_IMAGE } from "./default-image";

export const defaultMenuImages = {
  breakfast: [DEFAULT_ITEM_IMAGE],
  mainCourse: [DEFAULT_ITEM_IMAGE],
  desserts: [DEFAULT_ITEM_IMAGE],
  default: DEFAULT_ITEM_IMAGE,
};

export function getDefaultImageForItem(categorySlug: string, itemIndex: number = 0): string {
  switch (categorySlug) {
    case 'breakfast':
      return defaultMenuImages.breakfast[itemIndex % defaultMenuImages.breakfast.length];
    case 'main-course':
      return defaultMenuImages.mainCourse[itemIndex % defaultMenuImages.mainCourse.length];
    case 'desserts':
      return defaultMenuImages.desserts[itemIndex % defaultMenuImages.desserts.length];
    default:
      return defaultMenuImages.default;
  }
}
