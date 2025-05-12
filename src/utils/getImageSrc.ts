export function getImageSrc(url?: string) {
  if (!url) return '';
  if (url.startsWith('http')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
} 