import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Save, GripVertical } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Category, MenuItem } from "@shared/schema";

interface SortableItemProps {
  item: MenuItem;
  index: number;
  onOrderChange: (id: number, newOrder: number) => void;
}

function SortableItem({ item, index, onOrderChange }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-2 flex items-center gap-4"
      data-testid={`sortable-item-${item.id}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
        data-testid={`drag-handle-${item.id}`}
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{item.name}</div>
        {item.nameArabic && (
          <div className="text-sm text-gray-500 truncate">{item.nameArabic}</div>
        )}
        {item.description && (
          <div className="text-sm text-gray-600 truncate mt-1">{item.description}</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Order:</span>
        <Input
          type="number"
          value={index + 1}
          onChange={(e) => {
            const newOrder = parseInt(e.target.value);
            if (!isNaN(newOrder) && newOrder > 0) {
              onOrderChange(item.id, newOrder - 1);
            }
          }}
          className="w-16 text-center"
          min="1"
          data-testid={`order-input-${item.id}`}
        />
      </div>

      <div className="text-sm font-medium text-gray-900">
        ${item.price}
      </div>
    </div>
  );
}

export default function AdminSortPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [sortedItems, setSortedItems] = useState<MenuItem[]>([]);
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  // Filter items for selected category and sort them
  const categoryItems = useMemo(() => {
    if (!selectedCategoryId) return [];
    
    const categoryId = parseInt(selectedCategoryId);
    return menuItems
      .filter((item) => item.categoryId === categoryId)
      .sort((a, b) => {
        // Use same sorting logic as storage: display_order ASC NULLS LAST, then order ASC
        if (a.displayOrder === null && b.displayOrder === null) return a.order - b.order;
        if (a.displayOrder === null) return 1;
        if (b.displayOrder === null) return -1;
        return a.displayOrder - b.displayOrder;
      });
  }, [menuItems, selectedCategoryId]);

  // Update sorted items when category items change
  useEffect(() => {
    setSortedItems(categoryItems);
  }, [categoryItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSortedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleOrderChange = (itemId: number, newIndex: number) => {
    setSortedItems((items) => {
      const currentIndex = items.findIndex((item) => item.id === itemId);
      if (currentIndex === -1) return items;
      
      const clampedIndex = Math.max(0, Math.min(newIndex, items.length - 1));
      return arrayMove(items, currentIndex, clampedIndex);
    });
  };

  const saveOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCategoryId) throw new Error("No category selected");
      
      const orderedItemIds = sortedItems.map(item => item.id);
      
      return apiRequest("POST", "/api/items/sort", {
        categoryId: parseInt(selectedCategoryId),
        orderedItemIds,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: "Success",
        description: "Item order updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update item order",
        variant: "destructive",
      });
    },
  });

  const handleSaveOrder = () => {
    saveOrderMutation.mutate();
  };

  const selectedCategory = categories.find(cat => cat.id.toString() === selectedCategoryId);
  const hasChanges = JSON.stringify(sortedItems.map(i => i.id)) !== JSON.stringify(categoryItems.map(i => i.id));

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/admin")}
              data-testid="back-to-admin"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Sort Menu Items</h1>
          </div>

          {hasChanges && (
            <Button
              onClick={handleSaveOrder}
              disabled={saveOrderMutation.isPending}
              data-testid="save-order-button"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveOrderMutation.isPending ? "Saving..." : "Save Order"}
            </Button>
          )}
        </div>

        {/* Category Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              data-testid="category-selector"
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a category to sort items..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Items List */}
        {selectedCategory && (
          <Card>
            <CardHeader>
              <CardTitle>
                Items in "{selectedCategory.name}" ({sortedItems.length} items)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Drag items to reorder them, or use the number inputs for precise positioning.
              </p>
            </CardHeader>
            <CardContent>
              {sortedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500" data-testid="no-items-message">
                  No items found in this category.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedItems.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div data-testid="sortable-items-list">
                      {sortedItems.map((item, index) => (
                        <SortableItem
                          key={item.id}
                          item={item}
                          index={index}
                          onOrderChange={handleOrderChange}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}