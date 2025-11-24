import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import type { MenuItem, Category } from "@shared/schema";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SortableItemRowProps {
  item: MenuItem;
  categoryName: string;
  imageUrl: string;
  onEdit: (item: MenuItem) => void;
  onDuplicate: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggleAvailability: (id: number) => void;
  isToggling: boolean;
  isDuplicating: boolean;
  isDeleting: boolean;
}

function SortableItemRow({
  item,
  categoryName,
  imageUrl,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleAvailability,
  isToggling,
  isDuplicating,
  isDeleting,
}: SortableItemRowProps) {
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
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-b border-brand-green/10 hover:bg-brand-cream/30",
        isDragging && "opacity-50 bg-brand-cream/50"
      )}
    >
      <td className="py-4 px-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5 text-brand-green/40 hover:text-brand-green" />
      </td>
      <td className="py-4 px-2">
        <div className="flex items-center space-x-3">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <p className="font-medium text-brand-green">{item.name}</p>
            <p className="text-sm text-brand-green/70 line-clamp-1">
              {item.description || "No description"}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4 px-2">
        <Badge variant="secondary" className="bg-brand-coral/20 text-brand-coral">
          {categoryName}
        </Badge>
      </td>
      <td className="py-4 px-2">
        <span className="font-semibold text-brand-green">${item.price}</span>
      </td>
      <td className="py-4 px-2">
        <Switch
          checked={item.isAvailable}
          onCheckedChange={() => onToggleAvailability(item.id)}
          disabled={isToggling}
        />
      </td>
      <td className="py-4 px-2">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(item)}
            className="text-brand-green hover:bg-brand-green/10"
            data-testid={`button-edit-${item.id}`}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDuplicate(item)}
            className="text-blue-600 hover:bg-blue-50"
            disabled={isDuplicating}
            data-testid={`button-duplicate-${item.id}`}
          >
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(item.id)}
            className="text-brand-coral hover:bg-red-50"
            disabled={isDeleting}
            data-testid={`button-delete-${item.id}`}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

interface AdminSortableItemsProps {
  items: MenuItem[];
  categories: Category[];
  dataUpdatedAt: number;
  selectedCategory: string;
  onEdit: (item: MenuItem) => void;
  onDuplicate: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggleAvailability: (id: number) => void;
  getCategoryName: (categoryId: number) => string;
  getDefaultImage: (categorySlug: string, index: number) => string;
  isToggling: boolean;
  isDuplicating: boolean;
  isDeleting: boolean;
}

export default function AdminSortableItems({
  items,
  categories,
  dataUpdatedAt,
  selectedCategory,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleAvailability,
  getCategoryName,
  getDefaultImage,
  isToggling,
  isDuplicating,
  isDeleting,
}: AdminSortableItemsProps) {
  const { toast } = useToast();
  
  const [openCategories, setOpenCategories] = useState<Set<number>>(
    new Set(categories.map(c => c.id))
  );
  
  const [localItemsByCategory, setLocalItemsByCategory] = useState<Record<number, MenuItem[]>>({});
  const [dirtyCategories, setDirtyCategories] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const hasDirtyChanges = dirtyCategories.size > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter categories based on selectedCategory
  const filteredCategories = selectedCategory === "all" 
    ? categories 
    : categories.filter(cat => cat.slug === selectedCategory);
  
  const groupedItems = filteredCategories.map(category => {
    const localItems = localItemsByCategory[category.id];
    const categoryItems = localItems || items
      .filter(item => item.categoryId === category.id)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    
    return {
      category,
      items: categoryItems
    };
  });

  const createDragEndHandler = useCallback((categoryId: number) => {
    return (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setLocalItemsByCategory(currentLocal => {
          const serverItems = items
            .filter(item => item.categoryId === categoryId)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          
          const categoryItems = currentLocal[categoryId] ?? serverItems;
          
          const oldIndex = categoryItems.findIndex(item => item.id === active.id);
          const newIndex = categoryItems.findIndex(item => item.id === over.id);
          
          const reorderedItems = arrayMove(categoryItems, oldIndex, newIndex).map((item, index) => ({
            ...item,
            displayOrder: index
          }));
          
          return {
            ...currentLocal,
            [categoryId]: reorderedItems
          };
        });
        
        setDirtyCategories(prev => new Set(prev).add(categoryId));
      }
    };
  }, [items]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Flatten all reordered items from all dirty categories into a single array
      const allReorderedItems: Array<{id: number, displayOrder: number}> = [];
      
      Array.from(dirtyCategories).forEach(categoryId => {
        const reorderedItems = localItemsByCategory[categoryId];
        if (reorderedItems) {
          reorderedItems.forEach(item => {
            allReorderedItems.push({
              id: item.id,
              displayOrder: item.displayOrder ?? 0
            });
          });
        }
      });
      
      // Send all updates in a single request to avoid race conditions
      if (allReorderedItems.length > 0) {
        await apiRequest('POST', '/api/menu-items/reorder', { items: allReorderedItems });
        
        // Invalidate cache once after successful batch save
        await queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
        
        toast({
          title: "Changes saved",
          description: `Successfully updated ${allReorderedItems.length} item${allReorderedItems.length === 1 ? '' : 's'} across ${dirtyCategories.size} categor${dirtyCategories.size === 1 ? 'y' : 'ies'}`,
        });
      }
      
      setLocalItemsByCategory({});
      setDirtyCategories(new Set());
    } catch (error) {
      console.error('Failed to save reordered items:', error);
      toast({
        title: "Failed to save changes",
        description: "An error occurred while saving your reordered items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setLocalItemsByCategory({});
    setDirtyCategories(new Set());
  };

  const toggleCategory = (categoryId: number) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getCategorySlug = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.slug || '';
  };

  return (
    <div className="space-y-4">
      {hasDirtyChanges && (
        <div className="sticky top-0 z-50 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg mb-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500 rounded-full p-2">
                <GripVertical className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900">Unsaved Changes</h4>
                <p className="text-sm text-amber-700">
                  You have reordered items in {dirtyCategories.size} {dirtyCategories.size === 1 ? 'category' : 'categories'}. 
                  Save to apply changes or discard to reset.
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleDiscardChanges}
                disabled={isSaving}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                Discard
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md font-semibold"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {groupedItems.map(({ category, items: categoryItems }) => (
        <Collapsible
          key={category.id}
          open={openCategories.has(category.id)}
          onOpenChange={() => toggleCategory(category.id)}
        >
          <div className="border border-brand-green/20 rounded-lg overflow-hidden">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4 bg-brand-cream/50 hover:bg-brand-cream/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-brand-green transition-transform",
                      openCategories.has(category.id) ? "transform rotate-0" : "transform -rotate-90"
                    )}
                  />
                  <h3 className="text-lg font-semibold text-brand-green">{category.name}</h3>
                  <Badge variant="outline" className="border-brand-green/30 text-brand-green">
                    {categoryItems.length} items
                  </Badge>
                  {dirtyCategories.has(category.id) && (
                    <Badge className="bg-amber-500 text-white">
                      Unsaved
                    </Badge>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              {categoryItems.length === 0 ? (
                <div className="p-8 text-center text-brand-green/60">
                  No items in this category
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={createDragEndHandler(category.id)}
                >
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-brand-green/20 bg-brand-cream/30">
                        <th className="text-left py-3 px-2 font-semibold text-brand-green w-12"></th>
                        <th className="text-left py-3 px-2 font-semibold text-brand-green">Item</th>
                        <th className="text-left py-3 px-2 font-semibold text-brand-green">Category</th>
                        <th className="text-left py-3 px-2 font-semibold text-brand-green">Price</th>
                        <th className="text-left py-3 px-2 font-semibold text-brand-green">Status</th>
                        <th className="text-left py-3 px-2 font-semibold text-brand-green">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <SortableContext
                        items={categoryItems.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {categoryItems.map((item, index) => (
                          <SortableItemRow
                            key={item.id}
                            item={item}
                            categoryName={getCategoryName(item.categoryId)}
                            imageUrl={
                              item.imageUrl?.startsWith('/api/storage')
                                ? item.imageUrl
                                : `${item.imageUrl || getDefaultImage(getCategorySlug(item.categoryId), index)}?v=${dataUpdatedAt}`
                            }
                            onEdit={onEdit}
                            onDuplicate={onDuplicate}
                            onDelete={onDelete}
                            onToggleAvailability={onToggleAvailability}
                            isToggling={isToggling}
                            isDuplicating={isDuplicating}
                            isDeleting={isDeleting}
                          />
                        ))}
                      </SortableContext>
                    </tbody>
                  </table>
                </DndContext>
              )}
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
}
