import { useMemo } from "react";

export function useComingSoonGate() {
  const isComingSoonMode = useMemo(() => {
    // Check if PUBLIC_LAUNCH is explicitly set to true
    const publicLaunch = import.meta.env.VITE_PUBLIC_LAUNCH === 'true';
    
    // Check for preview mode via environment
    const previewMode = import.meta.env.VITE_PREVIEW_MODE === 'true';
    
    // Check for preview bypass via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const previewKey = urlParams.get('preview');
    const validPreviewKey = import.meta.env.VITE_PREVIEW_KEY;
    const hasValidPreview = previewKey && validPreviewKey && previewKey === validPreviewKey;
    
    // Show full site if:
    // 1. PUBLIC_LAUNCH is true, OR
    // 2. PREVIEW_MODE is true, OR  
    // 3. Valid preview key is provided in URL
    const showFullSite = publicLaunch || previewMode || hasValidPreview;
    
    return !showFullSite;
  }, []);

  const shouldShowComingSoon = isComingSoonMode;
  
  return {
    shouldShowComingSoon,
    isPreviewMode: !shouldShowComingSoon && import.meta.env.VITE_PUBLIC_LAUNCH !== 'true'
  };
}