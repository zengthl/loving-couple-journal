import React, { useEffect, useState } from 'react';
import { getPreviewMediaUrl, isVideoUrl } from '../lib/media';

interface ProgressiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  previewSrc?: string;
  showLoader?: boolean;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  previewSrc,
  showLoader = true,
  className,
  alt,
  ...props
}) => {
  const fallbackPreview = previewSrc || getPreviewMediaUrl(src);
  const initialSrc = !isVideoUrl(src) && fallbackPreview && fallbackPreview !== src ? fallbackPreview : src;
  const [activeSrc, setActiveSrc] = useState(initialSrc);
  const [isLoaded, setIsLoaded] = useState(initialSrc === src);

  useEffect(() => {
    const nextPreview = previewSrc || getPreviewMediaUrl(src);
    const nextInitial = !isVideoUrl(src) && nextPreview && nextPreview !== src ? nextPreview : src;
    setActiveSrc(nextInitial);
    setIsLoaded(nextInitial === src);

    if (nextInitial === src) {
      return;
    }

    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    img.onload = () => {
      setActiveSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setActiveSrc(src);
      setIsLoaded(true);
    };
  }, [previewSrc, src]);

  return (
    <div className="relative inline-block">
      <img
        {...props}
        src={activeSrc}
        alt={alt}
        className={`${className || ''} transition-opacity duration-300`}
      />
      {!isLoaded && showLoader && (
        <div className="pointer-events-none absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
      )}
    </div>
  );
};
