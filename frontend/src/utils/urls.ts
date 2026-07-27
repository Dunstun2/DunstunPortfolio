/**
 * Centralized URL configuration for the frontend.
 *
 * All backend URLs are derived from a single env var:
 *   NEXT_PUBLIC_API_URL  (e.g. "https://web-production-f79f9.up.railway.app/api")
 *
 * In development, when the env var is not set, it falls back to
 * http://localhost:5000/api so local dev works out of the box.
 */

/** API base URL — includes the /api suffix (e.g. "https://…/api") */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
