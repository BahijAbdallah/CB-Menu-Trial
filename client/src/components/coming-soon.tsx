import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    try {
      // In a real implementation, you'd send this to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Thank you!",
        description: "We'll notify you when we launch.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-beige via-cream to-light-gold flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Brand Area */}
        <div className="mb-8">
          <h1 className="font-parslay text-6xl md:text-7xl font-bold text-dark-brown mb-4">
            Chez Byrouth
          </h1>
          <div className="w-24 h-1 bg-warm-gold mx-auto mb-6"></div>
          <p className="text-saddle-brown text-lg md:text-xl">
            Authentic Lebanese Cuisine
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="mb-12">
          <h2 className="font-billmake text-4xl md:text-5xl font-bold text-dark-brown mb-6">
            Coming Soon
          </h2>
          <p className="text-saddle-brown text-lg md:text-xl leading-relaxed mb-8">
            We're crafting an exceptional dining experience that celebrates the rich flavors 
            and traditions of Lebanon. Our digital menu will showcase authentic dishes prepared 
            with passion and served with Lebanese hospitality.
          </p>
        </div>

        {/* Email Signup */}
        <div className="mb-12">
          <p className="text-saddle-brown text-lg mb-6">
            Be the first to know when we open our doors
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white border-2 border-warm-gold focus:border-dark-brown"
              required
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-warm-gold hover:bg-dark-brown text-white font-semibold px-8 py-2 transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Notify Me"}
            </Button>
          </form>
        </div>

        {/* Decorative Element */}
        <div className="opacity-30">
          <svg
            width="100"
            height="20"
            viewBox="0 0 100 20"
            className="mx-auto text-warm-gold"
            fill="currentColor"
          >
            <path d="M50 0L55 10L50 20L45 10Z M30 5L35 10L30 15L25 10Z M70 5L75 10L70 15L65 10Z M10 8L15 10L10 12L5 10Z M90 8L95 10L90 12L85 10Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}