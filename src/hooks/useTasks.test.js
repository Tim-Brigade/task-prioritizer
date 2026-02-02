import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks, getAutoIcon } from './useTasks';

describe('getAutoIcon', () => {
  it('returns bug emoji for bug-related titles', () => {
    expect(getAutoIcon('Fix the bug')).toBe('🐛');
    expect(getAutoIcon('Debug the issue')).toBe('🐛');
    expect(getAutoIcon('Error in production')).toBe('🐛');
  });

  it('returns rocket emoji for deployment titles', () => {
    expect(getAutoIcon('Deploy to production')).toBe('🚀');
    expect(getAutoIcon('Release new version')).toBe('🚀');
    expect(getAutoIcon('Launch the app')).toBe('🚀');
  });

  it('returns email emoji for email-related titles', () => {
    expect(getAutoIcon('Reply to email')).toBe('📧');
    expect(getAutoIcon('Check inbox')).toBe('📧');
  });

  it('returns meeting emoji for meeting-related titles', () => {
    expect(getAutoIcon('Team meeting')).toBe('📞');
    expect(getAutoIcon('Zoom call')).toBe('📞');
    expect(getAutoIcon('Standup')).toBe('📞');
  });

  it('returns default emoji for unknown titles', () => {
    expect(getAutoIcon('xyz unknown xyz')).toBe('📝');
    expect(getAutoIcon('')).toBe('📝');
  });

  it('is case insensitive', () => {
    expect(getAutoIcon('FIX THE BUG')).toBe('🐛');
    expect(getAutoIcon('Deploy to PRODUCTION')).toBe('🚀');
  });
});

describe('useTasks', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
  });

  it('initializes with example tasks for first-time users', () => {
    const { result } = renderHook(() => useTasks());

    expect(result.current.tasks.length).toBeGreaterThan(0);
    expect(result.current.tasks.some(t => t.title.includes('bug'))).toBe(true);
  });

  it('loads tasks from localStorage', () => {
    const savedTasks = [
      { id: 1, title: 'Saved task', quadrant: 'q1', completed: false }
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(savedTasks));

    const { result } = renderHook(() => useTasks());

    expect(result.current.tasks).toEqual(savedTasks);
  });

  it('adds a new task with generated properties', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([]));
    const { result } = renderHook(() => useTasks());

    let newTask;
    act(() => {
      newTask = result.current.addTask({
        title: 'New bug fix',
        quadrant: 'q1'
      });
    });

    expect(newTask).toBeDefined();
    expect(newTask.title).toBe('New bug fix');
    expect(newTask.quadrant).toBe('q1');
    expect(newTask.icon).toBe('🐛');
    expect(newTask.completed).toBe(false);
    expect(newTask.id).toBeDefined();
    expect(newTask.createdAt).toBeDefined();
    expect(result.current.tasks).toContainEqual(expect.objectContaining({ title: 'New bug fix' }));
  });

  it('deletes a task', () => {
    const initialTasks = [
      { id: 1, title: 'Task 1', quadrant: 'q1', completed: false },
      { id: 2, title: 'Task 2', quadrant: 'q2', completed: false }
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialTasks));

    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.deleteTask(1);
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe(2);
  });

  it('toggles task completion', () => {
    const initialTasks = [
      { id: 1, title: 'Task 1', quadrant: 'q1', completed: false }
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialTasks));

    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.toggleComplete(1);
    });

    expect(result.current.tasks[0].completed).toBe(true);

    act(() => {
      result.current.toggleComplete(1);
    });

    expect(result.current.tasks[0].completed).toBe(false);
  });

  it('moves task to different quadrant', () => {
    const initialTasks = [
      { id: 1, title: 'Task 1', quadrant: 'q2', completed: false }
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialTasks));

    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.moveTask(1, 'q1');
    });

    expect(result.current.tasks[0].quadrant).toBe('q1');
  });

  it('does not move task if already in target quadrant', () => {
    const onHistorySave = vi.fn();
    const initialTasks = [
      { id: 1, title: 'Task 1', quadrant: 'q1', completed: false }
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialTasks));

    const { result } = renderHook(() => useTasks({ onHistorySave }));

    act(() => {
      result.current.moveTask(1, 'q1');
    });

    expect(onHistorySave).not.toHaveBeenCalled();
  });

  it('gets quadrant tasks sorted correctly', () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const initialTasks = [
      { id: 1, title: 'No date completed', quadrant: 'q1', completed: true, dueDate: '' },
      { id: 2, title: 'Tomorrow', quadrant: 'q1', completed: false, dueDate: tomorrow },
      { id: 3, title: 'Today', quadrant: 'q1', completed: false, dueDate: today },
      { id: 4, title: 'No date', quadrant: 'q1', completed: false, dueDate: '' },
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialTasks));

    const { result } = renderHook(() => useTasks());
    const q1Tasks = result.current.getQuadrantTasks('q1');

    // Should be: Today (earliest date), Tomorrow, No date, then completed
    expect(q1Tasks[0].title).toBe('Today');
    expect(q1Tasks[1].title).toBe('Tomorrow');
    expect(q1Tasks[2].title).toBe('No date');
    expect(q1Tasks[3].title).toBe('No date completed');
  });

  it('filters completed tasks when hideCompleted is true', () => {
    const initialTasks = [
      { id: 1, title: 'Incomplete', quadrant: 'q1', completed: false },
      { id: 2, title: 'Complete', quadrant: 'q1', completed: true }
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialTasks));

    const { result } = renderHook(() => useTasks());

    const withCompleted = result.current.getQuadrantTasks('q1', false);
    expect(withCompleted).toHaveLength(2);

    const withoutCompleted = result.current.getQuadrantTasks('q1', true);
    expect(withoutCompleted).toHaveLength(1);
    expect(withoutCompleted[0].title).toBe('Incomplete');
  });

  it('isOverdue returns true for past dates', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([]));
    const { result } = renderHook(() => useTasks());

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    expect(result.current.isOverdue(yesterday)).toBe(true);

    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    expect(result.current.isOverdue(tomorrow)).toBe(false);

    expect(result.current.isOverdue('')).toBe(false);
    expect(result.current.isOverdue(null)).toBe(false);
  });

  it('formatDueDate returns human-readable strings', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([]));
    const { result } = renderHook(() => useTasks());

    const today = new Date().toISOString().split('T')[0];
    expect(result.current.formatDueDate(today)).toBe('Today');

    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    expect(result.current.formatDueDate(tomorrow)).toBe('Tomorrow');

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    expect(result.current.formatDueDate(yesterday)).toBe('Yesterday');

    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
    expect(result.current.formatDueDate(twoDaysAgo)).toBe('2d overdue');

    expect(result.current.formatDueDate('')).toBe('');
  });

  it('calls onHistorySave when deleting tasks', () => {
    const onHistorySave = vi.fn();
    const initialTasks = [{ id: 1, title: 'Task', quadrant: 'q1', completed: false }];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialTasks));

    const { result } = renderHook(() => useTasks({ onHistorySave }));

    act(() => {
      result.current.deleteTask(1);
    });

    expect(onHistorySave).toHaveBeenCalledWith('delete', expect.objectContaining({ id: 1 }));
  });

  it('getCompletedTasks returns only completed tasks', () => {
    const initialTasks = [
      { id: 1, title: 'Incomplete', quadrant: 'q1', completed: false },
      { id: 2, title: 'Complete 1', quadrant: 'q1', completed: true },
      { id: 3, title: 'Complete 2', quadrant: 'q2', completed: true }
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialTasks));

    const { result } = renderHook(() => useTasks());
    const completed = result.current.getCompletedTasks();

    expect(completed).toHaveLength(2);
    expect(completed.every(t => t.completed)).toBe(true);
  });

  it('clearCompletedTasks removes all completed tasks', () => {
    const initialTasks = [
      { id: 1, title: 'Incomplete', quadrant: 'q1', completed: false },
      { id: 2, title: 'Complete', quadrant: 'q1', completed: true }
    ];
    localStorage.getItem.mockReturnValue(JSON.stringify(initialTasks));

    const { result } = renderHook(() => useTasks());

    act(() => {
      result.current.clearCompletedTasks();
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].completed).toBe(false);
  });
});
