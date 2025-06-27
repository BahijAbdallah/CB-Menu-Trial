import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Layers } from "lucide-react";
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
  const { toast } = useToast();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
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
                <p className="text-saddle-brown text-sm">Organize your menu structure</p>
              </div>
            </div>
            <Button onClick={handleAddNew} className="bg-warm-gold text-white hover:bg-goldenrod">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-xs">
                    #{category.order}
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

          {categories.length === 0 && (
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