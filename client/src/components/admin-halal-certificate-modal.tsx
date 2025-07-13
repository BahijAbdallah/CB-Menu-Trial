import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, Link } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().min(1, "File URL is required"),
  isActive: z.boolean().default(true),
  displayOrder: z.number().min(0, "Display order must be 0 or greater").default(0),
});

type FormData = z.infer<typeof formSchema>;

interface HalalCertificate {
  id: number;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  isActive: boolean;
  displayOrder: number;
}

interface AdminHalalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCertificate: HalalCertificate | null;
}

export default function AdminHalalCertificateModal({ isOpen, onClose, editingCertificate }: AdminHalalCertificateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
  const [uploadedFile, setUploadedFile] = useState<{ fileName: string; fileUrl: string } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editingCertificate?.title || "",
      description: editingCertificate?.description || "",
      fileName: editingCertificate?.fileName || "",
      fileUrl: editingCertificate?.fileUrl || "",
      isActive: editingCertificate?.isActive ?? true,
      displayOrder: editingCertificate?.displayOrder || 0,
    },
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('certificate', file);
      
      const response = await fetch('/api/halal-certificates/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFile(data);
      form.setValue('fileName', data.fileName);
      form.setValue('fileUrl', data.fileUrl);
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Only PDF files are allowed",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      uploadMutation.mutate(file);
    }
  };

  // Reset form when modal opens/closes
  const handleClose = () => {
    form.reset();
    setUploadedFile(null);
    setUploadMethod("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        title: data.title,
        description: data.description || null,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        isActive: data.isActive,
        displayOrder: data.displayOrder,
      };

      if (editingCertificate) {
        await apiRequest(`/api/halal-certificates/${editingCertificate.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        await apiRequest("/api/halal-certificates", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/halal-certificates"] });
      toast({
        title: "Success",
        description: editingCertificate
          ? "Certificate updated successfully"
          : "Certificate created successfully",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save certificate",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    mutation.mutate(data);
  };

  // Reset form when certificate changes or modal closes
  const resetForm = () => {
    form.reset({
      title: editingCertificate?.title || "",
      description: editingCertificate?.description || "",
      fileName: editingCertificate?.fileName || "",
      fileUrl: editingCertificate?.fileUrl || "",
      isActive: editingCertificate?.isActive ?? true,
      displayOrder: editingCertificate?.displayOrder || 0,
    });
    setUploadedFile(null);
    setUploadMethod(editingCertificate ? "url" : "upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset when certificate changes
  if (editingCertificate && form.watch("title") !== editingCertificate.title) {
    resetForm();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-parslay text-2xl font-bold text-dark-brown">
            {editingCertificate ? "Edit Certificate" : "Add New Certificate"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dark-brown font-medium">Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Certificate title"
                        {...field}
                        className="border-gray-300 focus:border-brand-green focus:ring-brand-green"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dark-brown font-medium">File Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="certificate.pdf"
                        {...field}
                        className="border-gray-300 focus:border-brand-green focus:ring-brand-green"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel className="text-dark-brown font-medium">PDF File *</FormLabel>
              <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as "upload" | "url")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    File URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-green transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 text-brand-green mx-auto" />
                        <p className="text-sm font-medium text-green-600">File uploaded successfully!</p>
                        <p className="text-sm text-gray-600">{uploadedFile.fileName}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                        >
                          Replace File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Click to upload a PDF file</p>
                          <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadMutation.isPending}
                          className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                        >
                          {uploadMutation.isPending ? "Uploading..." : "Choose File"}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/certificate.pdf"
                            {...field}
                            className="border-gray-300 focus:border-brand-green focus:ring-brand-green"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark-brown font-medium">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description of the certificate"
                      rows={3}
                      {...field}
                      className="border-gray-300 focus:border-brand-green focus:ring-brand-green"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-dark-brown font-medium">Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="border-gray-300 focus:border-brand-green focus:ring-brand-green"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0 pt-6">
                    <FormLabel className="text-dark-brown font-medium">Active</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-brand-green"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-brand-green hover:bg-brand-green/90 text-white"
              >
                {mutation.isPending
                  ? editingCertificate
                    ? "Updating..."
                    : "Creating..."
                  : editingCertificate
                  ? "Update Certificate"
                  : "Create Certificate"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}