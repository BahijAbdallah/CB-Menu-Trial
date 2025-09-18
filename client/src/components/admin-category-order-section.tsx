import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { GripVertical, Save } from "lucide-react";
import type { Category } from "@shared/schema";

export default function AdminCategoryOrderSection() {
  const { toast } = useToast();
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: categoryOrderData } = useQuery<{ categoryOrder: string[] }>({
    queryKey: ["/api/settings/category-order"],
  });

  const saveCategoryOrderMutation = useMutation({
    mutationFn: async (categoryOrder: string[]) => {
      const response = await fetch("/api/settings/category-order", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryOrder }),
      });
      if (!response.ok) throw new Error("Failed to save category order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/category-order"] });
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Category order saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to save category order",
        variant: "destructive",
      });
    },
  });

  // Apply category ordering when data is loaded
  useEffect(() => {
    if (categories.length > 0) {
      const categoryOrder = categoryOrderData?.categoryOrder || [];
      
      // Sort categories based on saved order
      const pos = (slug: string) => {
        const index = categoryOrder.indexOf(slug);
        return index === -1 ? Number.MAX_SAFE_INTEGER : index;
      };
      
      const sorted = [...categories].sort((a, b) => pos(a.slug) - pos(b.slug));
      setOrderedCategories(sorted);
    }
  }, [categories, categoryOrderData]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const newOrderedCategories = [...orderedCategories];
    const draggedItem = newOrderedCategories[draggedIndex];
    
    // Remove dragged item and insert at new position
    newOrderedCategories.splice(draggedIndex, 1);
    newOrderedCategories.splice(dropIndex, 0, draggedItem);
    
    setOrderedCategories(newOrderedCategories);
    setHasChanges(true);
  };

  const handleSave = () => {
    const categoryOrder = orderedCategories.map(cat => cat.slug);
    saveCategoryOrderMutation.mutate(categoryOrder);
  };

  const handleReset = () => {
    // Reset to original category order (by ID)
    const resetOrder = [...categories].sort((a, b) => a.order - b.order);
    setOrderedCategories(resetOrder);
    setHasChanges(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-alethia text-xl font-bold text-dark-brown">
          Category Display Order
        </CardTitle>
        <p className="text-saddle-brown">
          Drag and drop categories to reorder how they appear on the frontend menu.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {orderedCategories.map((category, index) => (
            <div
              key={category.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-brand-green transition-colors"
              data-testid={`category-item-${category.slug}`}
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <h4 className="font-medium text-brand-green">{category.name}</h4>
                {category.nameArabic && (
                  <p className="text-sm text-gray-600">{category.nameArabic}</p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Order: {index + 1}
              </div>
            </div>
          ))}
        </div>

        {orderedCategories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No categories available to order.
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveCategoryOrderMutation.isPending}
            className="bg-brand-green text-white hover:bg-brand-dark-green"
            data-testid="save-category-order"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveCategoryOrderMutation.isPending ? "Saving..." : "Save Order"}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
            data-testid="reset-category-order"
          >
            Reset to Default
          </Button>
        </div>
        
        {hasChanges && (
          <p className="text-sm text-amber-600">
            You have unsaved changes. Click "Save Order" to apply them.
          </p>
        )}
      </CardContent>
    </Card>
  );
}