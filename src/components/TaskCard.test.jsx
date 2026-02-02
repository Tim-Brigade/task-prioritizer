import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from './TaskCard';

const defaultConfig = {
  title: 'Urgent & Important',
  subtitle: 'Do First',
  color: '#FFCCCC',
  darkColor: '#FF6B6B'
};

const createTask = (overrides = {}) => ({
  id: 1,
  title: 'Test Task',
  description: 'Test description',
  quadrant: 'q1',
  dueDate: '',
  completed: false,
  icon: '🐛',
  delegate: '',
  ...overrides
});

describe('TaskCard', () => {
  it('renders task title and description', () => {
    const task = createTask();
    render(<TaskCard task={task} config={defaultConfig} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders task icon', () => {
    const task = createTask({ icon: '🚀' });
    render(<TaskCard task={task} config={defaultConfig} />);

    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('shows completed state with strikethrough', () => {
    const task = createTask({ completed: true });
    render(<TaskCard task={task} config={defaultConfig} />);

    const titleElement = screen.getByText('Test Task');
    expect(titleElement).toHaveClass('line-through');
  });

  it('calls onToggleComplete when checkbox is clicked', () => {
    const onToggleComplete = vi.fn();
    const task = createTask();

    render(
      <TaskCard
        task={task}
        config={defaultConfig}
        onToggleComplete={onToggleComplete}
      />
    );

    // Find the checkbox button (first button in the card)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    expect(onToggleComplete).toHaveBeenCalledWith(1);
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    const task = createTask();

    render(
      <TaskCard
        task={task}
        config={defaultConfig}
        onEdit={onEdit}
      />
    );

    // Edit button has title "Edit"
    const editButton = screen.getByTitle('Edit');
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(task);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    const task = createTask();

    render(
      <TaskCard
        task={task}
        config={defaultConfig}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByTitle('Delete');
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('shows due date when provided', () => {
    const formatDueDate = vi.fn(() => 'Tomorrow');
    const task = createTask({ dueDate: '2026-01-22' });

    render(
      <TaskCard
        task={task}
        config={defaultConfig}
        formatDueDate={formatDueDate}
      />
    );

    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    expect(formatDueDate).toHaveBeenCalledWith('2026-01-22');
  });

  it('shows overdue styling when task is overdue', () => {
    const isOverdue = vi.fn(() => true);
    const formatDueDate = vi.fn(() => '2d overdue');
    const task = createTask({ dueDate: '2026-01-19' });

    render(
      <TaskCard
        task={task}
        config={defaultConfig}
        isOverdue={isOverdue}
        formatDueDate={formatDueDate}
      />
    );

    const dueDateElement = screen.getByText('2d overdue');
    expect(dueDateElement.parentElement).toHaveClass('text-red-700');
  });

  it('shows delegate info for Q3 tasks', () => {
    const task = createTask({
      quadrant: 'q3',
      delegate: 'John Doe'
    });

    render(<TaskCard task={task} config={defaultConfig} />);

    expect(screen.getByText('Delegated to: John Doe')).toBeInTheDocument();
  });

  it('does not show delegate info for non-Q3 tasks', () => {
    const task = createTask({
      quadrant: 'q1',
      delegate: 'John Doe'
    });

    render(<TaskCard task={task} config={defaultConfig} />);

    expect(screen.queryByText('Delegated to:')).not.toBeInTheDocument();
  });

  it('shows priority badge when isTopPriority is true', () => {
    const task = createTask();

    render(
      <TaskCard
        task={task}
        config={defaultConfig}
        isTopPriority={true}
        priorityIndex={0}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByTitle('Top priority #1')).toBeInTheDocument();
  });

  it('calls onEdit on double click (not on buttons)', () => {
    const onEdit = vi.fn();
    const task = createTask();

    const { container } = render(
      <TaskCard
        task={task}
        config={defaultConfig}
        onEdit={onEdit}
      />
    );

    // Double click on the card itself
    const card = container.firstChild;
    fireEvent.doubleClick(card);

    expect(onEdit).toHaveBeenCalledWith(task);
  });

  it('renders bullet points in description', () => {
    const task = createTask({
      description: '* Item 1\n* Item 2'
    });

    render(<TaskCard task={task} config={defaultConfig} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders numbered lists in description', () => {
    const task = createTask({
      description: '1. First\n2. Second'
    });

    render(<TaskCard task={task} config={defaultConfig} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
