
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
    setIsLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.svg';
    if (props.onError) {
      props.onError(e);
    }
  };

  return (
    <div className={className}>
      {isLoading && <Skeleton className="w-full h-full" />}
      <img
        src={hasError ? '/placeholder.svg' : src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};
