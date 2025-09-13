import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Category, MenuItem, InsertMenuItem } from "@shared/schema";
import { ALLERGENS, type AllergenSlug } from "@/constants/allergens";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameArabic: z.string().optional(),
  nameFrench: z.string().optional(),
  description: z.string().optional(),
  descriptionArabic: z.string().optional(),
  descriptionFrench: z.string().optional(),
  price: z.string().min(1, "Price is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  categoryId: z.number().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  outOfStock: z.boolean().default(false),
  order: z.number().default(0),
  allergens: z.array(z.string()).default([]),
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
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nameArabic: "",
      nameFrench: "",
      description: "",
      descriptionArabic: "",
      descriptionFrench: "",
      price: "",
      categoryId: 0,
      imageUrl: "",
      isAvailable: true,
      outOfStock: false,
      order: 0,
      allergens: [],
    },
  });

  useEffect(() => {
    if (editingItem) {
      // Parse allergens from JSON string or use array directly
      let allergens: AllergenSlug[] = [];
      if (editingItem.allergens) {
        if (typeof editingItem.allergens === 'string') {
          try {
            allergens = JSON.parse(editingItem.allergens);
          } catch {
            allergens = [];
          }
        } else {
          allergens = editingItem.allergens;
        }
      }
      
      form.reset({
        name: editingItem.name,
        nameArabic: editingItem.nameArabic || "",
        nameFrench: editingItem.nameFrench || "",
        description: editingItem.description || "",
        descriptionArabic: editingItem.descriptionArabic || "",
        descriptionFrench: editingItem.descriptionFrench || "",
        price: editingItem.price,
        categoryId: editingItem.categoryId,
        imageUrl: editingItem.imageUrl || "",
        isAvailable: editingItem.isAvailable,
        outOfStock: editingItem.outOfStock || false,
        order: editingItem.order,
        allergens: allergens,
      });
      setImagePreview(editingItem.imageUrl || "");
    } else {
      form.reset({
        name: "",
        nameArabic: "",
        nameFrench: "",
        description: "",
        descriptionArabic: "",
        descriptionFrench: "",
        price: "",
        categoryId: 0,
        imageUrl: "",
        isAvailable: true,
        outOfStock: false,
        order: 0,
        allergens: [],
      });
      setImagePreview("");
    }
  }, [editingItem, form]);

  // Image upload functionality
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      const imageUrl = data.imageUrl;
      
      form.setValue('imageUrl', imageUrl);
      setImagePreview(imageUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        return;
      }
      
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    form.setValue('imageUrl', '');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload: InsertMenuItem = {
        ...data,
        price: data.price,
        nameArabic: data.nameArabic || null,
        nameFrench: data.nameFrench || null,
        description: data.description || null,
        descriptionArabic: data.descriptionArabic || null,
        descriptionFrench: data.descriptionFrench || null,
        imageUrl: data.imageUrl || null,
        allergens: JSON.stringify(data.allergens),
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
          <DialogTitle className="font-parslay text-2xl font-bold text-dark-brown">
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
                      <Input placeholder="أدخل اسم الطبق" className="font-arabic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nameFrench"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name (French)</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le nom du plat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="descriptionArabic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Arabic)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل وصف الطبق"
                      className="font-arabic"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionFrench"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (French)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Entrez la description du plat"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image Management Section */}
            <div className="space-y-4">
              <FormLabel className="text-base font-semibold">Menu Item Image</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">No image uploaded</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-green mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Supported formats: JPG, PNG, WebP (Max 5MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

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

            {/* Allergens Selection */}
            <FormField
              control={form.control}
              name="allergens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Allergens</FormLabel>
                  <div className="text-sm text-gray-600 mb-3">
                    Select all allergens present in this menu item
                  </div>
                  <div className="admin-allergens">
                    {ALLERGENS.map((a) => (
                      <label key={a.slug} className={`allergen-chip ${field.value.includes(a.slug) ? 'is-on' : ''}`}>
                        <input
                          type="checkbox"
                          checked={field.value.includes(a.slug)}
                          onChange={() => {
                            const current = field.value as AllergenSlug[];
                            if (current.includes(a.slug)) {
                              field.onChange(current.filter((slug) => slug !== a.slug));
                            } else {
                              field.onChange([...current, a.slug]);
                            }
                          }}
                          aria-label={a.label}
                        />
                        <img src={a.icon} alt="" aria-hidden="true" />
                        <span>{a.label}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability Toggle */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Item Availability
                      </FormLabel>
                      <div className="text-sm text-gray-600">
                        Toggle to mark this item as {field.value ? 'available' : 'unavailable'}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outOfStock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Out of Stock
                      </FormLabel>
                      <div className="text-sm text-gray-600">
                        Mark this item as {field.value ? 'out of stock' : 'in stock'}
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
