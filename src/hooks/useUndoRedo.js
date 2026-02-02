import { useState, useCallback } from 'react';

/**
 * Custom hook for managing undo/redo functionality
 * @param {number} maxHistory - maximum number of actions to remember (default 20)
 * @returns {object} - undo/redo state and functions
 */
export const useUndoRedo = (maxHistory = 20) => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  /**
   * Save an action to history
   * @param {string} action - action type (e.g., 'delete', 'complete', 'edit', 'move')
   * @param {object} data - data needed to undo the action
   */
  const saveToHistory = useCallback((action, data) => {
    setUndoStack(prev => [...prev, { action, data, timestamp: Date.now() }].slice(-maxHistory));
    setRedoStack([]); // Clear redo history when new action is performed
  }, [maxHistory]);

  /**
   * Undo the last action
   * @param {object} handlers - object with handler functions for each action type
   * @returns {object|null} - the action that was undone, or null if nothing to undo
   */
  const undo = useCallback((handlers) => {
    if (undoStack.length === 0) return null;

    const lastAction = undoStack[undoStack.length - 1];
    const handler = handlers[lastAction.action];

    if (handler) {
      handler(lastAction.data);
    }

    // Move action to redo stack
    setRedoStack(prev => [...prev, lastAction]);
    setUndoStack(prev => prev.slice(0, -1));

    return lastAction;
  }, [undoStack]);

  /**
   * Redo the last undone action
   * @param {object} handlers - object with handler functions for each action type
   * @returns {object|null} - the action that was redone, or null if nothing to redo
   */
  const redo = useCallback((handlers) => {
    if (redoStack.length === 0) return null;

    const lastRedoAction = redoStack[redoStack.length - 1];
    const handler = handlers[lastRedoAction.action];

    if (handler) {
      handler(lastRedoAction.data);
    }

    // Move action back to undo stack
    setUndoStack(prev => [...prev, lastRedoAction]);
    setRedoStack(prev => prev.slice(0, -1));

    return lastRedoAction;
  }, [redoStack]);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  return {
    undoStack,
    redoStack,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    saveToHistory,
    undo,
    redo,
    clearHistory
  };
};
