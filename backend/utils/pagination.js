/**
 * Pagination utility for consistent pagination across the application
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse and validate pagination parameters
 * @param {Object} query - Request query object
 * @returns {Object} Validated pagination params
 */
function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Format pagination response metadata
 * @param {Object} options - Pagination options
 * @param {number} options.page - Current page
 * @param {number} options.limit - Items per page
 * @param {number} options.totalItems - Total number of items
 * @param {Array} options.data - Page data
 * @returns {Object} Formatted response with pagination metadata
 */
function formatPaginatedResponse({ page, limit, totalItems, data }) {
  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    },
  };
}

/**
 * Build cursor for cursor-based pagination
 * @param {Object} item - Last item in the result set
 * @param {string} field - Field to use as cursor (default: 'created_at')
 * @returns {string} Base64 encoded cursor
 */
function encodeCursor(item, field = 'created_at') {
  if (!item || !item[field]) return null;
  const value = item[field] instanceof Date 
    ? item[field].toISOString() 
    : item[field];
  return Buffer.from(JSON.stringify({ field, value })).toString('base64');
}

/**
 * Parse cursor for cursor-based pagination
 * @param {string} cursor - Base64 encoded cursor
 * @returns {Object|null} Decoded cursor object
 */
function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString());
  } catch {
    return null;
  }
}

/**
 * Format cursor-based pagination response
 * @param {Object} options - Cursor pagination options
 * @param {Array} options.data - Page data
 * @param {number} options.limit - Items per page
 * @param {string} options.cursorField - Field used for cursor
 * @returns {Object} Formatted response with cursor pagination metadata
 */
function formatCursorResponse({ data, limit, cursorField = 'created_at' }) {
  const hasMore = data.length === limit;
  const nextCursor = hasMore ? encodeCursor(data[data.length - 1], cursorField) : null;

  return {
    success: true,
    data,
    pagination: {
      hasMore,
      nextCursor,
      count: data.length,
    },
  };
}

module.exports = {
  getPaginationParams,
  formatPaginatedResponse,
  encodeCursor,
  decodeCursor,
  formatCursorResponse,
  MAX_LIMIT,
  DEFAULT_LIMIT,
};
