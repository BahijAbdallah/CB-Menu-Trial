import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string; // Applied to the <img> element
  wrapperClassName?: string; // Applied to the wrapper div
  width?: string | number;
  height?: string | number;
  onLoad?: (loadedSrc: string) => void; // Passes the successful src
  onError?: () => void;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  width,
  height,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Reset loading state when src changes
  useEffect(() => {
    if (src !== currentSrc) {
      setIsLoaded(false);
      setHasError(false);
      setCurrentSrc(src);
      setIsInView(false); // Reset to trigger intersection check again
    }
  }, [src, currentSrc]);

  // Intersection Observer for viewport detection
  useEffect(() => {
    if (!wrapperRef.current || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before image enters viewport
        threshold: 0.01,
      }
    );

    observer.observe(wrapperRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isInView, currentSrc]); // Re-run when src changes

  const handleLoad = () => {
    setIsLoaded(true);
    // Pass the successful src to parent so it can track which image loaded
    onLoad?.(currentSrc);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true); // Mark as loaded to hide placeholder
    onError?.();
  };

  // Only set inline dimensions if explicitly provided
  const wrapperStyle = width || height ? { width, height } : undefined;

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${wrapperClassName}`} style={wrapperStyle}>
      {/* Blur placeholder - shown while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      )}
      
      {/* Error placeholder - shown when image fails to load */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-xs">⚠️</div>
        </div>
      )}
      
      {/* Actual image - only loaded when in viewport */}
      {isInView && !hasError && (
        <img
          src={currentSrc}
          alt={alt}
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy" // Browser-level lazy loading as fallback
        />
      )}
    </div>
  );
}
