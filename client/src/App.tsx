import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useComingSoonGate } from "@/hooks/useComingSoonGate";
import ComingSoon from "@/components/coming-soon";
import NotFound from "@/pages/not-found";
import MenuPage from "@/pages/menu";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import HalalCertificatesPage from "@/pages/halal-certificates";
import './i18n';

function Router() {
  const { i18n } = useTranslation();
  const { shouldShowComingSoon, isPreviewMode } = useComingSoonGate();

  useEffect(() => {
    // Set initial direction and language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    // Set robots meta tag based on launch status
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const shouldNoIndex = shouldShowComingSoon || isPreviewMode;
    
    if (robotsMeta) {
      robotsMeta.setAttribute('content', shouldNoIndex ? 'noindex, nofollow' : 'index, follow');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = shouldNoIndex ? 'noindex, nofollow' : 'index, follow';
      document.head.appendChild(meta);
    }
  }, [shouldShowComingSoon, isPreviewMode]);

  // Show Coming Soon for all routes when in coming soon mode
  if (shouldShowComingSoon) {
    return <ComingSoon />;
  }

  // Show full site with preview indicator if in preview mode
  return (
    <>
      {isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-1 text-sm z-50">
          PREVIEW MODE - Site not yet public
        </div>
      )}
      <div className={isPreviewMode ? "pt-8" : ""}>
        <Switch>
          <Route path="/" component={MenuPage} />
          <Route path="/halal-certificates" component={HalalCertificatesPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
