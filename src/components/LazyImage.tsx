
import { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export const LazyImage = ({ src, alt, className, ...props }: LazyImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    console.log('Image loaded successfully:', src);
    setIsLoading(false);
  };

  const handleError = () => {
    console.error('Image load error:', src);
    setIsLoading(false);
    setHasError(true);
  };

  // Use a data URI for a simple placeholder image
  const placeholderImage = "data:image/svg+xml,%3Csvg width='400' height='400' viewBox='0 0 400 400' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%23F3F4F6'/%3E%3Cpath d='M200 180C200 191.046 191.046 200 180 200C168.954 200 160 191.046 160 180C160 168.954 168.954 160 180 160C191.046 160 200 168.954 200 180Z' fill='%239CA3AF'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M240 140H160C148.954 140 140 148.954 140 160V240C140 251.046 148.954 260 160 260H240C251.046 260 260 251.046 260 240V160C260 148.954 251.046 140 240 140ZM180 220C197.673 220 212 205.673 212 188C212 170.327 197.673 156 180 156C162.327 156 148 170.327 148 188C148 205.673 162.327 220 180 220Z' fill='%239CA3AF'/%3E%3C/svg%3E";

  return (
    <div className={className} style={{ position: 'relative' }}>
      {isLoading && (
        <Skeleton 
          className="absolute inset-0 w-full h-full rounded-md" 
        />
      )}
      <img
        src={hasError ? placeholderImage : src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
};
