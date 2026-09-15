import { API_BASE_URL } from '../services/api/apiClient';

/**
 * Returns the fully qualified URL for an uploaded file or avatar.
 * If the path starts with http://, https://, blob:, or data:, it returns as is.
 * Otherwise, prepends the backend host URL (in development, e.g. http://localhost:5047).
 */
export const getMediaUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  // Determine backend base URL from API_BASE_URL (strip trailing /api)
  const apiBase = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (apiBase) {
    return `${apiBase}${cleanPath}`;
  }

  return cleanPath;
};

export const getFileUrl = getMediaUrl;
