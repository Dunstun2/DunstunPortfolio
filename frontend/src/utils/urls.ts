/**
 * Centralized URL configuration for the frontend.
 *
 * All backend URLs are derived from a single env var:
 *   NEXT_PUBLIC_API_URL  (e.g. "https://web-production-f79f9.up.railway.app/api")
 *
 * In development, when the env var is not set, it falls back to
 * http://localhost:5000/api so local dev works out of the box.
 */

const defaultLocalUrl = typeof window === 'undefined' 
  ? 'http://127.0.0.1:5000/api' // Use 127.0.0.1 on SSR to prevent Node.js IPv6 resolution issues
  : 'http://localhost:5000/api'; // Use localhost on client

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || defaultLocalUrl;

/** Backend origin — without /api (e.g. "https://…") for uploads, WebSocket, etc. */
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/** WebSocket URL — uses NEXT_PUBLIC_WS_URL if set, otherwise derives from BACKEND_URL */
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || BACKEND_URL;

/**
 * Convert a relative file/upload path to a full URL.
 *
 * - Already-absolute URLs (http/https) are returned as-is.
 * - Relative paths like "/uploads/foo.jpg" get the backend origin prepended.
 */
export const getFileUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_URL}${path}`;
};

/**
 * Get an optimized image URL.
 * Supports Cloudinary on-the-fly transformations (quality, format, dimensions).
 */
export const getOptimizedImageUrl = (
  path: string,
  options?: { width?: number; height?: number; quality?: number }
): string => {
  if (!path) return '';

  // Get full URL
  const fullUrl = getFileUrl(path);

  // Cloudinary optimization
  if (fullUrl.includes('cloudinary.com') && fullUrl.includes('/upload/')) {
    const parts = fullUrl.split('/upload/');
    if (parts.length === 2) {
      const transformations = ['f_auto', 'q_auto'];

      if (options?.width) {
        transformations.push(`w_${options.width}`);
      }
      if (options?.height) {
        transformations.push(`h_${options.height}`);
      }

      // If both width and height are provided, use fill crop to fit the container
      if (options?.width && options?.height) {
        transformations.push('c_fill');
      } else if (options?.width || options?.height) {
        transformations.push('c_limit');
      }

      return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }
  }

  return fullUrl;
};

