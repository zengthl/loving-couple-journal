import React, { useEffect, useState } from 'react';
import { getDisplayMediaUrl, getPreviewMediaUrl, MediaVariant } from '../lib/media';

type FetchPriority = 'high' | 'low' | 'auto';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  variant?: MediaVariant;
  allowPreviewFallback?: boolean;
  fetchPriority?: FetchPriority;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  variant = 'card',
  allowPreviewFallback = true,
  ...props
}) => {
  const [sources, setSources] = useState<string[]>([src]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    const imageVariant = variant as MediaVariant;
    const nextSources = [getDisplayMediaUrl(src, imageVariant)];

    if (allowPreviewFallback && imageVariant !== 'full') {
      nextSources.push(getPreviewMediaUrl(src));
    }

    nextSources.push(src);

    const uniqueSources = nextSources.filter((value, index) => value && nextSources.indexOf(value) === index);

    setSources(uniqueSources);
    setSourceIndex(0);
  }, [allowPreviewFallback, src, variant]);

  return (
    <img
      {...props}
      src={sources[sourceIndex] || src}
      alt={alt}
      onError={() => {
        setSourceIndex((current) => (current < sources.length - 1 ? current + 1 : current));
      }}
    />
  );
};
