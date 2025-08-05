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
import './i18n';

function Router() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial direction and language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

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
