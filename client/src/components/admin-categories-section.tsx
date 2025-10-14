import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Layers, GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import AdminCategoryModal from "@/components/admin-category-modal";
import type { Category } from "@shared/schema";

export default function AdminCategoriesSection() {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: categoryOrderData } = useQuery<{ categoryOrder: string[] }>({
    queryKey: ["/api/settings/category-order"],
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete category");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
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
      
      if (categoryOrder.length === 0) {
        // No saved order, use database order
        const sorted = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setOrderedCategories(sorted);
      } else {
        // Sort categories based on saved order
        const pos = (slug: string) => {
          const index = categoryOrder.indexOf(slug);
          return index === -1 ? 999 : index;
        };
        
        const sorted = [...categories].sort((a, b) => {
          const posA = pos(a.slug);
          const posB = pos(b.slug);
          if (posA === posB) {
            // Same position, maintain database order
            return (a.order ?? 0) - (b.order ?? 0);
          }
          return posA - posB;
        });
        setOrderedCategories(sorted);
      }
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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warm-gold mx-auto mb-4"></div>
            <p className="text-saddle-brown">Loading categories...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Layers className="text-blue-500 h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-parslay text-xl font-bold text-dark-brown">
                  Menu Categories
                </CardTitle>
                <p className="text-saddle-brown text-sm">Drag to reorder • Changes appear on frontend menu</p>
              </div>
            </div>
            <Button onClick={handleAddNew} className="bg-warm-gold text-white hover:bg-goldenrod">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {orderedCategories.map((category, index) => (
              <div
                key={category.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="border-2 border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-blue-50 hover:border-blue-300 cursor-move transition-all active:opacity-50"
                data-testid={`category-item-${category.slug}`}
              >
                <div className="flex items-center space-x-3">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div>
                    <h4 className="font-medium text-dark-brown">{category.name}</h4>
                    {category.nameArabic && (
                      <p className="font-arabic text-sm text-saddle-brown">
                        {category.nameArabic}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">/{category.slug}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:bg-blue-100"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:bg-red-100"
                    disabled={deleteCategoryMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {orderedCategories.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t items-stretch sm:items-center">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saveCategoryOrderMutation.isPending}
                variant="outline"
                className="w-full sm:w-auto border-[3px] border-gray-900 text-gray-900 font-semibold hover:bg-gray-900 hover:text-white hover:border-gray-900 bg-white dark:bg-gray-50"
                data-testid="button-save-category-order"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveCategoryOrderMutation.isPending ? "Saving..." : "Save Order"}
              </Button>
              {hasChanges && (
                <p className="text-sm text-amber-600 self-center text-center sm:text-left">
                  You have unsaved changes
                </p>
              )}
            </div>
          )}

          {orderedCategories.length === 0 && (
            <div className="text-center py-8">
              <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-saddle-brown text-lg mb-2">No categories yet</p>
              <p className="text-gray-500 text-sm mb-4">
                Create your first menu category to organize your items
              </p>
              <Button onClick={handleAddNew} className="bg-warm-gold text-white hover:bg-goldenrod">
                <Plus className="mr-2 h-4 w-4" />
                Add First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Modal */}
      <AdminCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        editingCategory={editingCategory}
      />
    </>
  );
}