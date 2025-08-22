import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - in production this would save to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Thank You!",
      description: "We'll notify you when the menu is ready.",
    });
    
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-beige via-cream to-soft-gold flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo/Brand Area */}
        <div className="space-y-4">
          <div className="text-6xl">🚧</div>
          <h1 className="font-parslay text-4xl md:text-5xl font-bold text-dark-brown">
            Coming Soon
          </h1>
          <div className="text-6xl">🚧</div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <p className="text-xl text-saddle-brown font-medium">
            We're preparing the menu. Stay tuned!
          </p>
          <p className="text-saddle-brown/80">
            Chez Beirut's digital menu experience is being crafted with care. 
            Enter your email to be the first to know when we launch.
          </p>
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleNotifyMe} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-center border-2 border-warm-gold/30 focus:border-warm-gold rounded-lg bg-white/80 backdrop-blur-sm"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-warm-gold hover:bg-warm-gold/90 text-dark-brown font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? "Sending..." : "Notify Me"}
          </Button>
        </form>

        {/* Footer */}
        <div className="pt-8 border-t border-warm-gold/20">
          <p className="text-sm text-saddle-brown/60">
            © 2025 Chez Beirut. Lebanese Cuisine Excellence.
          </p>
        </div>
      </div>
    </div>
  );
}