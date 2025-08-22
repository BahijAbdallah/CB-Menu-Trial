import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NotFound from "@/pages/not-found";
import MenuPage from "@/pages/menu";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import HalalCertificatesPage from "@/pages/halal-certificates";
import ComingSoon from "@/components/coming-soon";
import { shouldShowComingSoon, getGateConfig, shouldBlockSearchEngines } from "@/lib/gate-utils";
import './i18n';

function Router() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial direction and language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Add meta robots tag if coming soon is active
    if (shouldBlockSearchEngines()) {
      const metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      metaRobots.content = 'noindex,nofollow';
      document.head.appendChild(metaRobots);
      
      // Remove existing robots meta if present
      const existingRobots = document.querySelector('meta[name="robots"]');
      if (existingRobots && existingRobots !== metaRobots) {
        existingRobots.remove();
      }
    }
  }, [i18n.language]);

  // Check if we should show coming soon page
  const gateConfig = getGateConfig();
  if (shouldShowComingSoon(gateConfig)) {
    return <ComingSoon />;
  }

  return (
    <Switch>
      <Route path="/" component={MenuPage} />
      <Route path="/halal-certificates" component={HalalCertificatesPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
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
