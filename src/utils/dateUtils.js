/**
 * Date utility functions for goals feature
 */

/**
 * Calculate the number of days between two dates
 */
export const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculate days since a given date
 */
export const daysSince = (dateString) => {
  const then = new Date(dateString);
  const now = new Date();
  const diffTime = now - then;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format date as YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display (e.g., "Jan 2026")
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

/**
 * Get today's date as YYYY-MM-DD
 */
export const getTodayString = () => {
  return formatDateForInput(new Date());
};
