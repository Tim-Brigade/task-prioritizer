/**
 * Check if a date is overdue (before today)
 * @param {string} dueDate - ISO date string (YYYY-MM-DD)
 * @returns {boolean} - True if the date is before today
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

/**
 * Format a due date in a human-readable way
 * @param {string} dueDate - ISO date string (YYYY-MM-DD)
 * @returns {string} - Formatted date string (e.g., "Today", "3d", "Jan 15")
 */
export const formatDueDate = (dueDate) => {
  if (!dueDate) return '';
  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays <= 7) return `${diffDays}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get the Monday of the current week
 * @returns {string} - ISO date string (YYYY-MM-DD)
 */
export const getWeekStart = () => {
  const today = new Date();
  const monday = new Date(today);
  const dayOfWeek = today.getDay();
  // Handle Sunday (0) by treating it as last day of the week
  const daysFromMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + daysFromMonday);
  return monday.toISOString().split('T')[0];
};

/**
 * Get a formatted date range for a week
 * @param {string} weekStart - ISO date string (YYYY-MM-DD) for the start of the week
 * @returns {string} - Formatted date range (e.g., "Jan 15 - Jan 21, 2024")
 */
export const getWeekDateRange = (weekStart) => {
  if (!weekStart) return '';
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};
