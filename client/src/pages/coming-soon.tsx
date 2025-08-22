import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically send the email to your backend
    console.log("Email submitted:", email);
    setIsSubmitted(true);
    toast({
      title: "Success!",
      description: "We'll notify you when we launch!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-warm-beige to-light-gold flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-warm-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-brown/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-warm-gold/20 p-8 sm:p-10 text-center">
          {/* Logo/Brand area */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-warm-gold to-amber-brown rounded-full flex items-center justify-center mb-4">
              <div className="text-2xl font-bold text-white">C</div>
            </div>
            <h1 className="text-2xl font-bold text-dark-brown">
              Chez Byrouth
            </h1>
          </div>

          {/* Main heading */}
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl font-bold text-dark-brown mb-4">
              🚧 Coming Soon 🚧
            </h2>
            <p className="text-lg text-saddle-brown leading-relaxed">
              We're working on something exciting. Stay tuned!
            </p>
          </div>

          {/* Email signup form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-center border-2 border-warm-gold/30 rounded-xl focus:border-warm-gold focus:ring-2 focus:ring-warm-gold/20 text-dark-brown placeholder:text-saddle-brown/60"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-warm-gold to-amber-brown hover:from-amber-brown hover:to-warm-gold text-white font-semibold py-3 px-6 rounded-xl transform transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Notify Me
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-brown">Thank You!</h3>
              <p className="text-saddle-brown">We'll notify you as soon as we launch.</p>
            </div>
          )}

          {/* Footer message */}
          <div className="mt-8 pt-6 border-t border-warm-gold/20">
            <p className="text-sm text-saddle-brown/80">
              Lebanese cuisine crafted with passion
            </p>
          </div>
        </div>

        {/* Access link to current site */}
        <div className="mt-6 text-center">
          <a
            href="/menu"
            className="inline-flex items-center text-sm text-saddle-brown hover:text-dark-brown transition-colors duration-200"
          >
            <span>Preview our menu</span>
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}