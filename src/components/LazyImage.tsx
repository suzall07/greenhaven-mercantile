
import { useState, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}

export const LazyImage = ({ 
  src, 
  alt, 
  className = "", 
  placeholderSrc = "/placeholder.svg" 
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setImageSrc(placeholderSrc);
      setIsLoading(false);
    };
  }, [src, placeholderSrc]);

  return (
    <div className={`relative ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoading ? "opacity-50" : "opacity-100"
        }`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
