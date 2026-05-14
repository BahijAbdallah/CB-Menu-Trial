export const defaultMenuImages = {
  breakfast: ["/menu-item-food.jpg"],
  mainCourse: ["/menu-item-food.jpg"],
  desserts: ["/menu-item-food.jpg"],
  default: "/menu-item-food.jpg",
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
