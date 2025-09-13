export interface GateConfig {
  publicLaunch: boolean;
}

export function shouldShowComingSoon(config: GateConfig): boolean {
  const { publicLaunch } = config;
  
  // Single source of truth: PUBLIC_LAUNCH environment variable
  // If PUBLIC_LAUNCH === "true", show full app (production)
  // Otherwise, show Coming Soon (development/preview)
  return publicLaunch !== true;
}

export function getGateConfig(): GateConfig {
  const publicLaunch = import.meta.env.VITE_PUBLIC_LAUNCH === "true";
  
  return {
    publicLaunch,
  };
}

export function shouldBlockSearchEngines(): boolean {
  const config = getGateConfig();
  return shouldShowComingSoon(config);
}