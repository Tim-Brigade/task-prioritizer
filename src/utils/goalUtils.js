import { daysBetween, daysSince } from './dateUtils';

/**
 * Goal utility functions for calculating progress, staleness, and other goal-related metrics
 */

/**
 * Calculate staleness threshold based on goal timeline
 * Returns number of days before a goal is considered stale
 */
export const getStalenessThreshold = (startDate, endDate) => {
  const durationDays = daysBetween(startDate, endDate);

  if (durationDays < 30) return 7;      // < 1 month: 7 days
  if (durationDays < 90) return 14;     // 1-3 months: 14 days
  if (durationDays < 180) return 21;    // 3-6 months: 21 days
  return 30;                             // 6+ months: 30 days
};

/**
 * Check if a goal is stale (beyond threshold)
 */
export const isGoalStale = (goal) => {
  if (!goal.lastActivity) return false; // Never started isn't "stale"

  const threshold = getStalenessThreshold(goal.timeline.start, goal.timeline.end);
  const daysSinceActivity = daysSince(goal.lastActivity);

  return daysSinceActivity >= threshold;
};

/**
 * Get staleness level: 'never', 'fresh', 'warning', or 'stale'
 */
export const getStalenessLevel = (goal) => {
  if (!goal.lastActivity) return 'never';

  const threshold = getStalenessThreshold(goal.timeline.start, goal.timeline.end);
  const daysSinceActivity = daysSince(goal.lastActivity);

  if (daysSinceActivity >= threshold) return 'stale';
  if (daysSinceActivity >= threshold * 0.75) return 'warning';
  return 'fresh';
};

/**
 * Calculate progress percentage for a goal
 */
export const calculateProgress = (goal) => {
  if (goal.type === 'simple') {
    return goal.status === 'completed' ? 100 : 0;
  }

  if (goal.type === 'major' && goal.subGoals && goal.subGoals.length > 0) {
    const completed = goal.subGoals.filter(sg => sg.status === 'complete').length;
    const total = goal.subGoals.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  return 0;
};

/**
 * Get the next action for a goal based on linked tasks
 */
export const getNextAction = (goal, tasks) => {
  if (!goal.linkedTasks || goal.linkedTasks.length === 0) {
    return 'No tasks linked to this goal';
  }

  // Find incomplete tasks linked to this goal
  const linkedTasks = tasks.filter(t =>
    goal.linkedTasks.includes(t.id) && !t.completed
  );

  if (linkedTasks.length === 0) {
    return 'All linked tasks completed';
  }

  // Return the first incomplete task (in the spec, priority could be considered here)
  return linkedTasks[0].title || linkedTasks[0].text || 'View linked tasks';
};

/**
 * Get staleness indicator text
 */
export const getStalenessText = (goal) => {
  if (!goal.lastActivity) return 'Never started';

  const days = daysSince(goal.lastActivity);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};
