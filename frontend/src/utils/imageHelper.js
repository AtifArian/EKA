/**
 * Image URL normalization and reliable fallback utilities.
 * Handles missing, relative, or serverless-hosted uploads without 404/resolution crashes.
 */

export const DEFAULT_ARTICLE_COVER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%237B85C4"/><stop offset="100%" stop-color="%239BA5D4"/></linearGradient></defs><rect width="600" height="320" fill="url(%23g)"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="42" fill="white">🌿</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="bold" fill="white">Mental Wellness Guide</text></svg>`;

export const DEFAULT_DOCTOR_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%237B85C4"/><stop offset="100%" stop-color="%239BA5D4"/></linearGradient></defs><rect width="200" height="200" fill="url(%23g)"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="54" fill="white">🩺</text></svg>`;

export const DEFAULT_USER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%237F7FD5"/><stop offset="100%" stop-color="%2386A8E7"/></linearGradient></defs><rect width="200" height="200" fill="url(%23g)"/><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="54" fill="white">👤</text></svg>`;

export const getFallbackImage = (type = 'article') => {
  switch (type) {
    case 'doctor':
      return DEFAULT_DOCTOR_AVATAR;
    case 'user':
      return DEFAULT_USER_AVATAR;
    case 'article':
    default:
      return DEFAULT_ARTICLE_COVER;
  }
};

/**
 * Normalizes an image URL to prevent DNS resolution errors and 404s.
 */
export const getResolvedImageUrl = (path, fallbackType = 'article') => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return getFallbackImage(fallbackType);
  }

  const trimmed = path.trim();

  // If already a data URI or blob URI
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Handle malformed URLs like "https://uploads/..." or "http://uploads/..."
  if (/^https?:\/\/uploads\//i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\/uploads\//i, '/uploads/');
  }

  // If full valid external URL
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Normalize relative path with leading slash
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  const apiUrl = process.env.REACT_APP_API_URL;
  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    const apiBase = apiUrl.replace(/\/api\/?$/, '');
    return `${apiBase}${cleanPath}`;
  }

  return cleanPath;
};

/**
 * Smooth image error handler that immediately swaps in an SVG fallback.
 */
export const handleImageError = (e, fallbackType = 'article') => {
  if (!e || !e.currentTarget) return;
  e.currentTarget.onerror = null;
  e.currentTarget.src = getFallbackImage(fallbackType);
};
