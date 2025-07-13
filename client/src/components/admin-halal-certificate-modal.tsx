import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Please enter a valid URL"),
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
      onClose();
      form.reset();
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

  const handleClose = () => {
    form.reset();
    onClose();
  };

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

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-dark-brown font-medium">PDF File URL *</FormLabel>
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