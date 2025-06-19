import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, PrinterCheck, Search, ArrowLeft, LogOut, Utensils, Layers } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import AdminStats from "@/components/admin-stats";
import AdminItemModal from "@/components/admin-item-modal";
import AdminCategoriesSection from "@/components/admin-categories-section";
import type { Category, MenuItem } from "@shared/schema";
import { getDefaultImageForItem } from "@/lib/menu-data";


export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
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

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/menu-items/${id}/toggle-availability`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle availability");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Item availability updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item availability",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/menu-items/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
                           categories.find(cat => cat.id === item.categoryId)?.slug === selectedCategory;
    
    const matchesStatus = selectedStatus === "all" ||
                         (selectedStatus === "available" && item.isAvailable) ||
                         (selectedStatus === "unavailable" && !item.isAvailable);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryName = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.name || "Unknown";
  };

  const getCategorySlug = (categoryId: number) => {
    return categories.find(cat => cat.id === categoryId)?.slug || "default";
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-gold mx-auto mb-4"></div>
          <p className="text-saddle-brown">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen gradient-warm">
      <div className="container mx-auto px-6 py-8">
        {/* Admin Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="/logo.png" 
                  alt="Chez Beyrouth Logo" 
                  className="h-12 w-auto object-contain"
                />
                <div>
                  <CardTitle className="font-playfair text-3xl font-bold text-dark-brown mb-2">
                    Admin Dashboard
                  </CardTitle>
                  <p className="text-saddle-brown">Welcome back, {user?.username}</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleAddNew} className="bg-warm-gold text-white hover:bg-goldenrod">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Item
                </Button>
                <Button variant="outline" className="border-warm-gold text-warm-gold hover:bg-warm-gold hover:text-white">
                  <PrinterCheck className="mr-2 h-4 w-4" />
                  Print Menu
                </Button>
                <Link href="/">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Menu
                  </Button>
                </Link>
                <Button variant="outline" onClick={logout} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <AdminStats />

        {/* Admin Content Tabs */}
        <Tabs defaultValue="menu-items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu-items" className="flex items-center space-x-2">
              <Utensils className="h-4 w-4" />
              <span>Menu Items</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu-items">
            <Card>
              <CardContent className="p-8">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-saddle-brown h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Menu Items Management Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-2 font-semibold text-dark-brown">Item</th>
                        <th className="text-left py-4 px-2 font-semibold text-dark-brown">Category</th>
                        <th className="text-left py-4 px-2 font-semibold text-dark-brown">Price</th>
                        <th className="text-left py-4 px-2 font-semibold text-dark-brown">Status</th>
                        <th className="text-left py-4 px-2 font-semibold text-dark-brown">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, index) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-2">
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.imageUrl || getDefaultImageForItem(getCategorySlug(item.categoryId), index)}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium text-dark-brown">{item.name}</p>
                                <p className="text-sm text-saddle-brown line-clamp-1">
                                  {item.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <Badge variant="secondary">
                              {getCategoryName(item.categoryId)}
                            </Badge>
                          </td>
                          <td className="py-4 px-2">
                            <span className="font-semibold text-dark-brown">${item.price}</span>
                          </td>
                          <td className="py-4 px-2">
                            <Switch
                              checked={item.isAvailable}
                              onCheckedChange={() => toggleAvailabilityMutation.mutate(item.id)}
                              disabled={toggleAvailabilityMutation.isPending}
                            />
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:bg-blue-100"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:bg-red-100"
                                disabled={deleteItemMutation.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-saddle-brown text-lg">No menu items found matching your criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <AdminCategoriesSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Item Modal */}
      <AdminItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        categories={categories}
      />
    </div>
  );
}
