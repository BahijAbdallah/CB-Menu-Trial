export interface GateConfig {
  hostname: string;
  publicLaunch: boolean;
  previewKey: string;
  currentUrl: string;
}

export function shouldShowComingSoon(config: GateConfig): boolean {
  const { hostname, publicLaunch, previewKey, currentUrl } = config;
  
  // If not on the custom domain, always show full app
  if (hostname !== "menu.chezbeyrouth.com") {
    return false;
  }
  
  // If public launch is enabled, show full app
  if (publicLaunch) {
    return false;
  }
  
  // Check for preview bypass
  const url = new URL(currentUrl);
  const previewParam = url.searchParams.get("preview");
  
  // If preview key matches, show full app
  if (previewParam === previewKey) {
    return false;
  }
  
  // Otherwise, show coming soon
  return true;
}

export function getGateConfig(): GateConfig {
  const hostname = window.location.hostname;
  const publicLaunch = import.meta.env.VITE_PUBLIC_LAUNCH === "true";
  const previewKey = import.meta.env.VITE_PREVIEW_KEY || "";
  const currentUrl = window.location.href;
  
  return {
    hostname,
    publicLaunch,
    previewKey,
    currentUrl,
  };
}

export function shouldBlockSearchEngines(): boolean {
  const config = getGateConfig();
  return shouldShowComingSoon(config);
}