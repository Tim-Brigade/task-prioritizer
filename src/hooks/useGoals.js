import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getStalenessThreshold, isGoalStale } from '../utils/goalUtils';
import { getTodayString } from '../utils/dateUtils';

/**
 * Custom hook for managing goals state and localStorage persistence
 */
export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('goals');
    if (stored) {
      try {
        setGoals(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse goals from localStorage:', error);
        setGoals([]);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  }, [goals, loading]);

  /**
   * Create a new goal
   */
  const createGoal = (goalData) => {
    const newGoal = {
      id: uuidv4(),
      ...goalData,
      status: 'active',
      lastActivity: null,
      createdAt: new Date().toISOString(),
      linkedTasks: [],
      // Ensure subGoals is empty array for simple goals
      subGoals: goalData.type === 'major' ? (goalData.subGoals || []) : undefined
    };
    setGoals([...goals, newGoal]);
    return newGoal;
  };

  /**
   * Update an existing goal
   */
  const updateGoal = (id, updates) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  /**
   * Delete a goal
   */
  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  /**
   * Archive a goal (move to archive storage)
   */
  const archiveGoal = (id) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      // Move to archive
      const archive = JSON.parse(localStorage.getItem('goalArchive') || '[]');
      archive.push({
        ...goal,
        archivedAt: new Date().toISOString()
      });
      localStorage.setItem('goalArchive', JSON.stringify(archive));
      deleteGoal(id);
    }
  };

  /**
   * Link a task to a goal
   */
  const linkTask = (goalId, taskId) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const linkedTasks = goal.linkedTasks || [];
      if (!linkedTasks.includes(taskId)) {
        updateGoal(goalId, {
          linkedTasks: [...linkedTasks, taskId],
          lastActivity: getTodayString()
        });
      }
    }
  };

  /**
   * Unlink a task from a goal
   */
  const unlinkTask = (goalId, taskId) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      updateGoal(goalId, {
        linkedTasks: (goal.linkedTasks || []).filter(id => id !== taskId)
      });
    }
  };

  /**
   * Toggle sub-goal completion status
   */
  const toggleSubGoalComplete = (goalId, subGoalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.type === 'major' && goal.subGoals) {
      const updatedSubGoals = goal.subGoals.map(sg =>
        sg.id === subGoalId
          ? { ...sg, status: sg.status === 'complete' ? 'pending' : 'complete' }
          : sg
      );
      updateGoal(goalId, {
        subGoals: updatedSubGoals,
        lastActivity: getTodayString()
      });
    }
  };

  /**
   * Add a new sub-goal to a major goal
   */
  const addSubGoal = (goalId, subGoalData) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.type === 'major') {
      const newSubGoal = {
        id: uuidv4(),
        ...subGoalData,
        status: 'pending'
      };
      const updatedSubGoals = [...(goal.subGoals || []), newSubGoal];
      updateGoal(goalId, {
        subGoals: updatedSubGoals,
        lastActivity: getTodayString()
      });
    }
  };

  /**
   * Update a sub-goal
   */
  const updateSubGoal = (goalId, subGoalId, updates) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.type === 'major' && goal.subGoals) {
      const updatedSubGoals = goal.subGoals.map(sg =>
        sg.id === subGoalId ? { ...sg, ...updates } : sg
      );
      updateGoal(goalId, {
        subGoals: updatedSubGoals,
        lastActivity: getTodayString()
      });
    }
  };

  /**
   * Delete a sub-goal
   */
  const deleteSubGoal = (goalId, subGoalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.type === 'major' && goal.subGoals) {
      updateGoal(goalId, {
        subGoals: goal.subGoals.filter(sg => sg.id !== subGoalId),
        lastActivity: getTodayString()
      });
    }
  };

  /**
   * Get active goals
   */
  const getActiveGoals = () => goals.filter(g => g.status === 'active');

  /**
   * Get paused goals
   */
  const getPausedGoals = () => goals.filter(g => g.status === 'paused');

  /**
   * Get stale goals
   */
  const getStaleGoals = () => goals.filter(g => isGoalStale(g));

  /**
   * Get archived goals
   */
  const getArchivedGoals = () => {
    const archive = localStorage.getItem('goalArchive');
    return archive ? JSON.parse(archive) : [];
  };

  /**
   * Delete an archived goal permanently
   */
  const deleteArchivedGoal = (id) => {
    const archive = getArchivedGoals();
    const filtered = archive.filter(g => g.id !== id);
    localStorage.setItem('goalArchive', JSON.stringify(filtered));
  };

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    linkTask,
    unlinkTask,
    toggleSubGoalComplete,
    addSubGoal,
    updateSubGoal,
    deleteSubGoal,
    getActiveGoals,
    getPausedGoals,
    getStaleGoals,
    getArchivedGoals,
    deleteArchivedGoal
  };
};
