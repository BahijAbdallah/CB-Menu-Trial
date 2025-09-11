import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

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

export default function HalalCertificatesPage() {
  const { data: certificates = [], isLoading } = useQuery<HalalCertificate[]>({
    queryKey: ["/api/halal-certificates"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-cream to-white">
        <section className="container mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="font-parslay text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-green mb-4">
              Halal Certificates
            </h1>
            <p className="text-lg text-saddle-brown max-w-2xl mx-auto">
              Loading our halal certification documents...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-cream to-white">
      {/* Hero Section */}
      <section className="bg-brand-green/5 border-b border-brand-green/20">
        <div className="container mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button
                variant="outline"
                className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="font-parslay text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-green mb-4">
              Halal Certificates
            </h1>
            <p className="text-lg text-saddle-brown max-w-2xl mx-auto leading-relaxed">
              View our official halal certification documents ensuring all our
              food meets the highest halal standards.
            </p>
          </div>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="container mx-auto px-4 sm:px-6 py-12">
        {certificates.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Certificates Available
            </h3>
            <p className="text-gray-500">
              Halal certificates will be displayed here once they are uploaded.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card
                key={certificate.id}
                className="hover:shadow-lg transition-shadow duration-300 border-2 border-brand-green/20"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-parslay text-xl text-brand-green line-clamp-2">
                      {certificate.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 ml-2"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      PDF
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {certificate.description && (
                    <p className="text-saddle-brown text-sm leading-relaxed line-clamp-3">
                      {certificate.description}
                    </p>
                  )}

                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar className="h-3 w-3 mr-1" />
                    Uploaded{" "}
                    {format(new Date(certificate.uploadedAt), "MMM d, yyyy")}
                  </div>

                  <a
                    href={certificate.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-brand-green hover:bg-brand-green/90 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    View Certificate
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Trust Section */}
      <section className="bg-brand-green/5 border-t border-brand-green/20 mt-12">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-parslay text-3xl font-bold text-brand-green mb-4">
              Certified Halal Quality
            </h2>
            <p className="text-saddle-brown leading-relaxed">
              All our ingredients and food preparation processes are certified
              halal by recognized certification authorities. We maintain the
              highest standards to ensure our Lebanese cuisine meets your
              dietary requirements with complete confidence.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
