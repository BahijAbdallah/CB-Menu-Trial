import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { GripVertical, Save, RotateCcw } from "lucide-react";
import type { Category, MenuItem } from "@shared/schema";
import { getDefaultImageForItem } from "@/lib/menu-data";

export default function AdminItemOrderSection() {
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [orderedItems, setOrderedItems] = useState<MenuItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems = [] } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const { data: itemOrderData } = useQuery<{ itemOrderByCategory: Record<string, string[]> }>({
    queryKey: ["/api/settings/item-order"],
  });

  const saveItemOrderMutation = useMutation({
    mutationFn: async ({ categoryId, order }: { categoryId: string; order: string[] }) => {
      return apiRequest("POST", "/api/settings/item-order", { categoryId, order });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/item-order"] });
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Item order saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save item order",
        variant: "destructive",
      });
    },
  });

  const resetItemOrderMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return apiRequest("DELETE", `/api/settings/item-order?categoryId=${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/item-order"] });
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Item order reset to default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset item order",
        variant: "destructive",
      });
    },
  });

  // Update ordered items when category or data changes
  useEffect(() => {
    if (!selectedCategoryId || !categories.length || !menuItems.length) {
      setOrderedItems([]);
      setHasChanges(false);
      return;
    }

    const selectedCategory = categories.find(c => c.id.toString() === selectedCategoryId);
    if (!selectedCategory) return;

    const categoryItems = menuItems.filter(item => item.categoryId === selectedCategory.id);
    const savedOrder = itemOrderData?.itemOrderByCategory?.[selectedCategoryId] || [];
    
    // Apply saved order
    if (savedOrder.length > 0) {
      const pos = new Map(savedOrder.map((id, i) => [id, i]));
      const sorted = categoryItems
        .map((it, idx) => ({ it, idx }))
        .sort((a, b) => {
          const ai = pos.has(a.it.id.toString()) ? pos.get(a.it.id.toString())! : Number.MAX_SAFE_INTEGER;
          const bi = pos.has(b.it.id.toString()) ? pos.get(b.it.id.toString())! : Number.MAX_SAFE_INTEGER;
          if (ai !== bi) return ai - bi;
          return a.idx - b.idx; // stable fallback
        })
        .map(x => x.it);
      
      setOrderedItems(sorted);
    } else {
      // Default order by item order field
      setOrderedItems([...categoryItems].sort((a, b) => a.order - b.order));
    }
    
    setHasChanges(false);
  }, [selectedCategoryId, categories, menuItems, itemOrderData]);

  const selectedCategory = categories.find(c => c.id.toString() === selectedCategoryId);
  const getCategorySlug = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.slug || "default";
  };

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
    
    const newOrderedItems = [...orderedItems];
    const draggedItem = newOrderedItems[draggedIndex];
    
    // Remove dragged item and insert at new position
    newOrderedItems.splice(draggedIndex, 1);
    newOrderedItems.splice(dropIndex, 0, draggedItem);
    
    setOrderedItems(newOrderedItems);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!selectedCategoryId) return;
    const order = orderedItems.map(item => item.id.toString());
    saveItemOrderMutation.mutate({ categoryId: selectedCategoryId, order });
  };

  const handleReset = () => {
    if (!selectedCategoryId) return;
    resetItemOrderMutation.mutate(selectedCategoryId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-alethia text-xl font-bold text-dark-brown">
          Category ➝ Item Order
        </CardTitle>
        <p className="text-saddle-brown">
          Select a category and drag items to reorder how they appear on the frontend menu.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-green">Select Category:</label>
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger className="border-brand-green/30" data-testid="category-select">
              <SelectValue placeholder="Choose a category to manage item order..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name} ({menuItems.filter(item => item.categoryId === category.id).length} items)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Item List */}
        {selectedCategoryId && orderedItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-brand-green">
              Items in "{selectedCategory?.name}" (drag to reorder):
            </h4>
            
            <div className="space-y-2">
              {orderedItems.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-brand-green transition-colors"
                  data-testid={`item-${item.id}`}
                >
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <img
                    src={item.imageUrl || getDefaultImageForItem(getCategorySlug(item.categoryId), index)}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-brand-green">{item.name}</h5>
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                    )}
                    <p className="text-sm font-semibold text-brand-green">${item.price}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Position: {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCategoryId && orderedItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No items found in this category.
          </div>
        )}

        {!selectedCategoryId && (
          <div className="text-center py-8 text-gray-500">
            Select a category above to manage item ordering.
          </div>
        )}

        {/* Action Buttons */}
        {selectedCategoryId && orderedItems.length > 0 && (
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saveItemOrderMutation.isPending}
              className="bg-brand-green text-white hover:bg-brand-dark-green"
              data-testid="save-item-order"
            >
              <Save className="mr-2 h-4 w-4" />
              {saveItemOrderMutation.isPending ? "Saving..." : "Save Order"}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetItemOrderMutation.isPending}
              data-testid="reset-item-order"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {resetItemOrderMutation.isPending ? "Resetting..." : "Reset to Default"}
            </Button>
          </div>
        )}
        
        {hasChanges && (
          <p className="text-sm text-amber-600">
            You have unsaved changes. Click "Save Order" to apply them.
          </p>
        )}
      </CardContent>
    </Card>
  );
}