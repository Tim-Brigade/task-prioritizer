import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskModal from './TaskModal';

describe('TaskModal', () => {
  it('does not render when isOpen is false', () => {
    render(<TaskModal isOpen={false} onSave={vi.fn()} onClose={vi.fn()} />);

    expect(screen.queryByText('Add Task')).not.toBeInTheDocument();
  });

  it('renders add mode correctly', () => {
    render(<TaskModal isOpen={true} mode="add" onSave={vi.fn()} onClose={vi.fn()} />);

    // Title appears as heading and button text
    expect(screen.getByRole('heading', { name: 'Add Task' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument();
  });

  it('renders edit mode correctly', () => {
    const task = {
      id: 1,
      title: 'Test Task',
      description: 'Description',
      quadrant: 'q1',
      dueDate: '2026-01-22',
      icon: '🐛',
      delegate: '',
      goalId: null
    };

    render(
      <TaskModal
        isOpen={true}
        mode="edit"
        task={task}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('populates form with task data in edit mode', () => {
    const task = {
      id: 1,
      title: 'Test Task',
      description: 'Test description',
      quadrant: 'q2',
      dueDate: '2026-01-22',
      icon: '🚀',
      delegate: '',
      goalId: null
    };

    render(
      <TaskModal
        isOpen={true}
        mode="edit"
        task={task}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-01-22')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('calls onSave with form data when submitted', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskModal
        isOpen={true}
        mode="add"
        onSave={onSave}
        onClose={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'New Task');
    await user.type(screen.getByPlaceholderText(/Add details/), 'Task details');

    fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New Task',
      description: 'Task details'
    }));
  });

  it('does not submit with empty title', async () => {
    const onSave = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        mode="add"
        onSave={onSave}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        mode="add"
        onSave={vi.fn()}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', () => {
    const onClose = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        mode="add"
        onSave={vi.fn()}
        onClose={onClose}
      />
    );

    // X button is the close button in the header
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(btn => btn.querySelector('svg'));
    fireEvent.click(xButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('pre-selects quadrant when selectedQuadrant is provided', () => {
    render(
      <TaskModal
        isOpen={true}
        mode="add"
        selectedQuadrant="q3"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const quadrantSelect = screen.getByRole('combobox');
    expect(quadrantSelect.value).toBe('q3');
    expect(quadrantSelect).toBeDisabled();
  });

  it('shows delegate field for Q3 quadrant', async () => {
    const user = userEvent.setup();

    render(
      <TaskModal
        isOpen={true}
        mode="add"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // Change to Q3
    const quadrantSelect = screen.getByRole('combobox');
    await user.selectOptions(quadrantSelect, 'q3');

    expect(screen.getByPlaceholderText('Name of person to delegate to')).toBeInTheDocument();
  });

  it('hides delegate field for non-Q3 quadrants', () => {
    render(
      <TaskModal
        isOpen={true}
        mode="add"
        selectedQuadrant="q1"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByPlaceholderText('Name of person to delegate to')).not.toBeInTheDocument();
  });

  it('shows goal dropdown when goals are provided', () => {
    const goals = [
      { id: 'goal-1', title: 'Goal 1', status: 'active' },
      { id: 'goal-2', title: 'Goal 2', status: 'active' }
    ];

    render(
      <TaskModal
        isOpen={true}
        mode="add"
        goals={goals}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('No goal')).toBeInTheDocument();
    expect(screen.getByText('Goal 1')).toBeInTheDocument();
    expect(screen.getByText('Goal 2')).toBeInTheDocument();
  });

  it('filters out non-active goals', () => {
    const goals = [
      { id: 'goal-1', title: 'Active Goal', status: 'active' },
      { id: 'goal-2', title: 'Paused Goal', status: 'paused' }
    ];

    render(
      <TaskModal
        isOpen={true}
        mode="add"
        goals={goals}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Active Goal')).toBeInTheDocument();
    expect(screen.queryByText('Paused Goal')).not.toBeInTheDocument();
  });

  it('auto-selects icon based on title', async () => {
    const user = userEvent.setup();

    render(
      <TaskModal
        isOpen={true}
        mode="add"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Fix the bug');

    // Bug emoji should appear
    expect(screen.getByText('🐛')).toBeInTheDocument();
  });

  it('submits on Ctrl+Enter', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskModal
        isOpen={true}
        mode="add"
        onSave={onSave}
        onClose={vi.fn()}
      />
    );

    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    await user.type(titleInput, 'New Task');

    // Trigger Ctrl+Enter
    fireEvent.keyDown(titleInput, { key: 'Enter', ctrlKey: true });

    expect(onSave).toHaveBeenCalled();
  });

  it('closes on Escape key', () => {
    const onClose = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        mode="add"
        onSave={vi.fn()}
        onClose={onClose}
      />
    );

    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    fireEvent.keyDown(titleInput, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });
});
