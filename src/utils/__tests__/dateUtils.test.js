import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isOverdue, formatDueDate, getWeekStart, getWeekDateRange } from '../dateUtils';

describe('dateUtils', () => {
  describe('isOverdue', () => {
    beforeEach(() => {
      // Mock current date to 2024-01-15
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    it('returns false for empty date', () => {
      expect(isOverdue('')).toBe(false);
      expect(isOverdue(null)).toBe(false);
      expect(isOverdue(undefined)).toBe(false);
    });

    it('returns true for dates before today', () => {
      expect(isOverdue('2024-01-14')).toBe(true);
      expect(isOverdue('2024-01-10')).toBe(true);
      expect(isOverdue('2023-12-31')).toBe(true);
    });

    it('returns false for today', () => {
      expect(isOverdue('2024-01-15')).toBe(false);
    });

    it('returns false for future dates', () => {
      expect(isOverdue('2024-01-16')).toBe(false);
      expect(isOverdue('2024-01-20')).toBe(false);
      expect(isOverdue('2024-02-01')).toBe(false);
    });
  });

  describe('formatDueDate', () => {
    beforeEach(() => {
      // Mock current date to 2024-01-15 (Monday)
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    it('returns empty string for empty date', () => {
      expect(formatDueDate('')).toBe('');
      expect(formatDueDate(null)).toBe('');
      expect(formatDueDate(undefined)).toBe('');
    });

    it('returns "Today" for current date', () => {
      expect(formatDueDate('2024-01-15')).toBe('Today');
    });

    it('returns "Tomorrow" for next day', () => {
      expect(formatDueDate('2024-01-16')).toBe('Tomorrow');
    });

    it('returns "Yesterday" for previous day', () => {
      expect(formatDueDate('2024-01-14')).toBe('Yesterday');
    });

    it('returns days count for dates within 7 days', () => {
      expect(formatDueDate('2024-01-17')).toBe('2d');
      expect(formatDueDate('2024-01-20')).toBe('5d');
      expect(formatDueDate('2024-01-22')).toBe('7d');
    });

    it('returns overdue format for past dates', () => {
      expect(formatDueDate('2024-01-13')).toBe('2d overdue');
      expect(formatDueDate('2024-01-10')).toBe('5d overdue');
      expect(formatDueDate('2024-01-01')).toBe('14d overdue');
    });

    it('returns formatted date for dates beyond 7 days', () => {
      expect(formatDueDate('2024-01-23')).toBe('Jan 23');
      expect(formatDueDate('2024-02-15')).toBe('Feb 15');
      expect(formatDueDate('2024-12-25')).toBe('Dec 25');
    });
  });

  describe('getWeekStart', () => {
    it('returns Monday for various days of the week', () => {
      // Monday
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
      expect(getWeekStart()).toBe('2024-01-15');

      // Tuesday
      vi.setSystemTime(new Date('2024-01-16T12:00:00Z'));
      expect(getWeekStart()).toBe('2024-01-15');

      // Wednesday
      vi.setSystemTime(new Date('2024-01-17T12:00:00Z'));
      expect(getWeekStart()).toBe('2024-01-15');

      // Sunday
      vi.setSystemTime(new Date('2024-01-21T12:00:00Z'));
      expect(getWeekStart()).toBe('2024-01-15');

      // Next Monday
      vi.setSystemTime(new Date('2024-01-22T12:00:00Z'));
      expect(getWeekStart()).toBe('2024-01-22');
    });
  });

  describe('getWeekDateRange', () => {
    it('returns empty string for empty weekStart', () => {
      expect(getWeekDateRange('')).toBe('');
      expect(getWeekDateRange(null)).toBe('');
      expect(getWeekDateRange(undefined)).toBe('');
    });

    it('returns formatted week range', () => {
      // Week of Jan 15-21, 2024
      expect(getWeekDateRange('2024-01-15')).toBe('Jan 15 - Jan 21, 2024');

      // Week crossing month boundary
      expect(getWeekDateRange('2024-01-29')).toBe('Jan 29 - Feb 4, 2024');

      // Week at year end
      expect(getWeekDateRange('2024-12-30')).toBe('Dec 30 - Jan 5, 2025');
    });
  });
});
