import { useEffect, useState } from "react";
import { DEFAULT_ITEM_IMAGE } from "@/lib/default-image";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string; // Applied to the <img> element
  wrapperClassName?: string; // Applied to the wrapper div
  width?: string | number;
  height?: string | number;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Image with a skeleton placeholder that swaps to a fallback if the source
 * fails. Loading is deferred by the browser's native lazy loading, which
 * already holds off until the image nears the viewport.
 */
export default function LazyImage({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  width,
  height,
  fallbackSrc = DEFAULT_ITEM_IMAGE,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    setFailed(true);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={width || height ? { width, height } : undefined}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <img
        src={failed ? fallbackSrc : src}
        alt={alt}
        className={`${className} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={failed ? handleLoad : handleError}
      />
    </div>
  );
}
