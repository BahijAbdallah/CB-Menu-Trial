import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Category, MenuItem, InsertMenuItem } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameArabic: z.string().optional(),
  description: z.string().optional(),
  descriptionArabic: z.string().optional(),
  price: z.string().min(1, "Price is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  categoryId: z.number().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  order: z.number().default(0),
});

type FormData = z.infer<typeof formSchema>;

interface AdminItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MenuItem | null;
  categories: Category[];
}

export default function AdminItemModal({ isOpen, onClose, editingItem, categories }: AdminItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nameArabic: "",
      description: "",
      descriptionArabic: "",
      price: "",
      categoryId: 0,
      imageUrl: "",
      isAvailable: true,
      order: 0,
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        nameArabic: editingItem.nameArabic || "",
        description: editingItem.description || "",
        descriptionArabic: editingItem.descriptionArabic || "",
        price: editingItem.price,
        categoryId: editingItem.categoryId,
        imageUrl: editingItem.imageUrl || "",
        isAvailable: editingItem.isAvailable,
        order: editingItem.order,
      });
    } else {
      form.reset({
        name: "",
        nameArabic: "",
        description: "",
        descriptionArabic: "",
        price: "",
        categoryId: 0,
        imageUrl: "",
        isAvailable: true,
        order: 0,
      });
    }
  }, [editingItem, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload: InsertMenuItem = {
        ...data,
        price: data.price,
        nameArabic: data.nameArabic || null,
        description: data.description || null,
        descriptionArabic: data.descriptionArabic || null,
        imageUrl: data.imageUrl || null,
      };

      if (editingItem) {
        return apiRequest("PUT", `/api/menu-items/${editingItem.id}`, payload);
      } else {
        return apiRequest("POST", "/api/menu-items", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: `Menu item ${editingItem ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingItem ? "update" : "create"} menu item`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await saveMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl font-bold text-dark-brown">
            {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nameArabic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name (Arabic)</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم الطبق" dir="rtl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter item description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1 hover:opacity-90"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#527A53',
                  color: '#ffffff',
                  border: 'none'
                }}
              >
                {isSubmitting ? "Saving..." : "Save Menu Item"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  borderColor: '#c86f60',
                  color: '#c86f60'
                }}
                className="hover:bg-brand-coral hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
