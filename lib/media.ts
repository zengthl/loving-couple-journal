import { supabase } from './supabase';

export type MediaVariant = 'thumb' | 'card' | 'full';

type SupabaseAsset = {
  bucket: string;
  path: string;
};

const PREVIEW_SUFFIX = '__preview.jpg';

const TRANSFORM_BY_VARIANT: Record<Exclude<MediaVariant, 'full'>, { width: number; height: number; quality: number }> = {
  thumb: { width: 360, height: 360, quality: 60 },
  card: { width: 960, height: 1200, quality: 72 },
};

export const isVideoUrl = (url: string): boolean => {
  const cleanUrl = url.split('?')[0].toLowerCase();
  return ['.mp4', '.mov', '.webm', '.avi', '.m4v'].some((extension) => cleanUrl.endsWith(extension));
};

export const isSupabaseStorageUrl = (url: string): boolean =>
  url.includes('/storage/v1/object/public/') || url.includes('/storage/v1/render/image/public/');

const parseSupabaseAsset = (url: string): SupabaseAsset | null => {
  if (!isSupabaseStorageUrl(url)) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const markers = ['/storage/v1/object/public/', '/storage/v1/render/image/public/'];

    for (const marker of markers) {
      const markerIndex = parsedUrl.pathname.indexOf(marker);
      if (markerIndex === -1) {
        continue;
      }

      const storagePath = parsedUrl.pathname.slice(markerIndex + marker.length);
      const [bucket, ...rest] = storagePath.split('/');

      if (!bucket || rest.length === 0) {
        return null;
      }

      return {
        bucket,
        path: decodeURIComponent(rest.join('/')),
      };
    }
  } catch {
    return null;
  }

  return null;
};

export const getPreviewStoragePath = (storagePath: string): string => {
  const dotIndex = storagePath.lastIndexOf('.');
  if (dotIndex === -1) {
    return `${storagePath}${PREVIEW_SUFFIX}`;
  }

  return `${storagePath.slice(0, dotIndex)}${PREVIEW_SUFFIX}`;
};

export const getPreviewMediaUrl = (url: string): string => {
  const asset = parseSupabaseAsset(url);

  if (!asset || isVideoUrl(url)) {
    return url;
  }

  return supabase.storage.from(asset.bucket).getPublicUrl(getPreviewStoragePath(asset.path)).data.publicUrl;
};

export const getDisplayMediaUrl = (url: string, variant: MediaVariant = 'card'): string => {
  if (!url || variant === 'full' || isVideoUrl(url)) {
    return url;
  }

  const asset = parseSupabaseAsset(url);
  if (!asset) {
    return url;
  }

  const transform = TRANSFORM_BY_VARIANT[variant];

  return supabase.storage.from(asset.bucket).getPublicUrl(asset.path, {
    transform: {
      width: transform.width,
      height: transform.height,
      quality: transform.quality,
      resize: 'cover',
    },
  }).data.publicUrl;
};
