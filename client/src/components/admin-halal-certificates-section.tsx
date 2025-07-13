import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import AdminHalalCertificateModal from "./admin-halal-certificate-modal";

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

export default function AdminHalalCertificatesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<HalalCertificate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: certificates = [], isLoading } = useQuery<HalalCertificate[]>({
    queryKey: ["/api/halal-certificates"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/halal-certificates/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/halal-certificates"] });
      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete certificate",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (certificate: HalalCertificate) => {
    setEditingCertificate(certificate);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCertificate(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="text-green-500 h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-parslay text-xl font-bold text-dark-brown">
                  Halal Certificates
                </CardTitle>
                <p className="text-saddle-brown text-sm">Manage halal certification documents</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading certificates...</p>
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="text-green-500 h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-parslay text-xl font-bold text-dark-brown">
                  Halal Certificates
                </CardTitle>
                <p className="text-saddle-brown text-sm">Manage halal certification documents</p>
              </div>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-green hover:bg-brand-green/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Certificates</h3>
              <p className="text-gray-500 mb-4">Upload your first halal certificate to get started.</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-green hover:bg-brand-green/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Certificate
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {certificate.title}
                        </h4>
                        {!certificate.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                        {certificate.isActive && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      
                      {certificate.description && (
                        <p className="text-sm text-gray-600 mb-1 line-clamp-1">
                          {certificate.description}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(certificate.uploadedAt), "MMM d, yyyy")}
                        </span>
                        <span>Order: {certificate.displayOrder}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(certificate.fileUrl, '_blank')}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(certificate)}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(certificate.id, certificate.title)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdminHalalCertificateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingCertificate={editingCertificate}
      />
    </>
  );
}