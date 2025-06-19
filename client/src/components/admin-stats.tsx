import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, CheckCircle, XCircle, Layers } from "lucide-react";

interface Stats {
  totalItems: number;
  availableItems: number;
  outOfStock: number;
  categories: number;
}

export default function AdminStats() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: Utensils,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      title: "Available",
      value: stats.availableItems,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStock,
      icon: XCircle,
      bgColor: "bg-red-100",
      iconColor: "text-red-500",
      textColor: "text-red-600",
    },
    {
      title: "Categories",
      value: stats.categories,
      icon: Layers,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-500",
      textColor: "text-warm-gold",
    },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-saddle-brown text-sm font-medium">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor || 'text-dark-brown'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} h-6 w-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
