import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from './useUndoRedo';

describe('useUndoRedo', () => {
  it('starts with empty stacks', () => {
    const { result } = renderHook(() => useUndoRedo());

    expect(result.current.undoStack).toEqual([]);
    expect(result.current.redoStack).toEqual([]);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('saves action to undo stack', () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      result.current.saveToHistory('delete', { id: 1, title: 'Test task' });
    });

    expect(result.current.undoStack).toHaveLength(1);
    expect(result.current.undoStack[0].action).toBe('delete');
    expect(result.current.undoStack[0].data).toEqual({ id: 1, title: 'Test task' });
    expect(result.current.canUndo).toBe(true);
  });

  it('clears redo stack when new action is saved', () => {
    const { result } = renderHook(() => useUndoRedo());

    // Save action, undo it, then save a new action
    act(() => {
      result.current.saveToHistory('delete', { id: 1 });
    });

    act(() => {
      result.current.undo({
        delete: vi.fn()
      });
    });

    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.saveToHistory('edit', { id: 2 });
    });

    expect(result.current.canRedo).toBe(false);
    expect(result.current.redoStack).toEqual([]);
  });

  it('limits history to maxHistory', () => {
    const { result } = renderHook(() => useUndoRedo(3));

    act(() => {
      result.current.saveToHistory('action1', { id: 1 });
      result.current.saveToHistory('action2', { id: 2 });
      result.current.saveToHistory('action3', { id: 3 });
      result.current.saveToHistory('action4', { id: 4 });
    });

    expect(result.current.undoStack).toHaveLength(3);
    expect(result.current.undoStack[0].action).toBe('action2');
    expect(result.current.undoStack[2].action).toBe('action4');
  });

  it('undo calls handler and moves action to redo stack', () => {
    const { result } = renderHook(() => useUndoRedo());
    const deleteHandler = vi.fn();

    act(() => {
      result.current.saveToHistory('delete', { id: 1, title: 'Task' });
    });

    act(() => {
      result.current.undo({ delete: deleteHandler });
    });

    expect(deleteHandler).toHaveBeenCalledWith({ id: 1, title: 'Task' });
    expect(result.current.undoStack).toHaveLength(0);
    expect(result.current.redoStack).toHaveLength(1);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('redo calls handler and moves action back to undo stack', () => {
    const { result } = renderHook(() => useUndoRedo());
    const deleteHandler = vi.fn();

    act(() => {
      result.current.saveToHistory('delete', { id: 1 });
    });

    act(() => {
      result.current.undo({ delete: deleteHandler });
    });

    act(() => {
      result.current.redo({ delete: deleteHandler });
    });

    expect(deleteHandler).toHaveBeenCalledTimes(2);
    expect(result.current.undoStack).toHaveLength(1);
    expect(result.current.redoStack).toHaveLength(0);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('undo returns null when stack is empty', () => {
    const { result } = renderHook(() => useUndoRedo());

    let undoResult;
    act(() => {
      undoResult = result.current.undo({});
    });

    expect(undoResult).toBeNull();
  });

  it('redo returns null when stack is empty', () => {
    const { result } = renderHook(() => useUndoRedo());

    let redoResult;
    act(() => {
      redoResult = result.current.redo({});
    });

    expect(redoResult).toBeNull();
  });

  it('clearHistory empties both stacks', () => {
    const { result } = renderHook(() => useUndoRedo());

    // Save action
    act(() => {
      result.current.saveToHistory('delete', { id: 1 });
    });

    // Undo it to move to redo stack
    act(() => {
      result.current.undo({ delete: vi.fn() });
    });

    expect(result.current.undoStack).toHaveLength(0);
    expect(result.current.redoStack).toHaveLength(1);

    // Clear history
    act(() => {
      result.current.clearHistory();
    });

    expect(result.current.undoStack).toHaveLength(0);
    expect(result.current.redoStack).toHaveLength(0);
  });
});
