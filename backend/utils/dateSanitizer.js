/**
 * Date Sanitizer Utility
 * Ensures incoming date strings from frontend forms or AI imports are safely
 * converted to valid YYYY-MM-DD or null so PostgreSQL date types do not fail.
 */

function sanitizeDate(val, isRequired = false, fallback = '2020-01-01') {
  if (val === undefined) return undefined;
  if (!val || val === 'Invalid date' || val === '' || val === 'null' || val === 'undefined') {
    return isRequired ? fallback : null;
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    return isRequired ? fallback : null;
  }
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    return val;
  }
  try {
    return d.toISOString().split('T')[0];
  } catch (e) {
    return isRequired ? fallback : null;
  }
}

function sanitizeObjectDates(data, spec = {}) {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };
  for (const [field, options] of Object.entries(spec)) {
    if (field in sanitized) {
      sanitized[field] = sanitizeDate(sanitized[field], options?.required, options?.fallback);
    }
  }
  return sanitized;
}

module.exports = { sanitizeDate, sanitizeObjectDates };
