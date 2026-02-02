import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Quadrant, { quadrantConfig, Q1_OVERLOAD_THRESHOLD } from './Quadrant';

const createTask = (overrides = {}) => ({
  id: 1,
  title: 'Test Task',
  description: '',
  quadrant: 'q1',
  dueDate: '',
  completed: false,
  icon: '📝',
  delegate: '',
  ...overrides
});

describe('Quadrant', () => {
  it('renders quadrant title and subtitle', () => {
    render(<Quadrant quadrant="q1" tasks={[]} allTasks={[]} />);

    expect(screen.getByText('Urgent & Important')).toBeInTheDocument();
    expect(screen.getByText('Do First')).toBeInTheDocument();
  });

  it('renders all four quadrant configurations correctly', () => {
    const { rerender } = render(<Quadrant quadrant="q1" tasks={[]} allTasks={[]} />);
    expect(screen.getByText('Urgent & Important')).toBeInTheDocument();

    rerender(<Quadrant quadrant="q2" tasks={[]} allTasks={[]} />);
    expect(screen.getByText('Important, Not Urgent')).toBeInTheDocument();

    rerender(<Quadrant quadrant="q3" tasks={[]} allTasks={[]} />);
    expect(screen.getByText('Urgent, Not Important')).toBeInTheDocument();

    rerender(<Quadrant quadrant="q4" tasks={[]} allTasks={[]} />);
    expect(screen.getByText('Neither Urgent nor Important')).toBeInTheDocument();
  });

  it('renders tasks', () => {
    const tasks = [
      createTask({ id: 1, title: 'Task 1' }),
      createTask({ id: 2, title: 'Task 2' })
    ];

    render(<Quadrant quadrant="q1" tasks={tasks} allTasks={tasks} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('calls onAddTask when add button is clicked', () => {
    const onAddTask = vi.fn();

    render(
      <Quadrant
        quadrant="q2"
        tasks={[]}
        allTasks={[]}
        onAddTask={onAddTask}
      />
    );

    const addButton = screen.getByTitle('Add task');
    fireEvent.click(addButton);

    expect(onAddTask).toHaveBeenCalledWith('q2');
  });

  it('shows drop indicator when isDropTarget is true', () => {
    render(
      <Quadrant
        quadrant="q1"
        tasks={[]}
        allTasks={[]}
        isDropTarget={true}
      />
    );

    expect(screen.getByText('Drop here')).toBeInTheDocument();
  });

  it('does not show drop indicator when isDropTarget is false', () => {
    render(
      <Quadrant
        quadrant="q1"
        tasks={[]}
        allTasks={[]}
        isDropTarget={false}
      />
    );

    expect(screen.queryByText('Drop here')).not.toBeInTheDocument();
  });

  it('shows overload warning for Q1 when threshold is exceeded', () => {
    const tasks = Array.from({ length: Q1_OVERLOAD_THRESHOLD }, (_, i) =>
      createTask({ id: i + 1, title: `Task ${i + 1}`, completed: false })
    );

    render(
      <Quadrant
        quadrant="q1"
        tasks={tasks}
        allTasks={tasks}
      />
    );

    // The warning button should be present
    const warningButton = screen.getByTitle('Q1 overload warning - click for tips');
    expect(warningButton).toBeInTheDocument();
  });

  it('does not show overload warning when below threshold', () => {
    const tasks = [createTask({ id: 1, title: 'Task 1' })];

    render(
      <Quadrant
        quadrant="q1"
        tasks={tasks}
        allTasks={tasks}
      />
    );

    expect(screen.queryByTitle('Q1 overload warning - click for tips')).not.toBeInTheDocument();
  });

  it('calls onShowOverloadWarning when warning button is clicked', () => {
    const onShowOverloadWarning = vi.fn();
    const tasks = Array.from({ length: Q1_OVERLOAD_THRESHOLD }, (_, i) =>
      createTask({ id: i + 1, title: `Task ${i + 1}`, completed: false })
    );

    render(
      <Quadrant
        quadrant="q1"
        tasks={tasks}
        allTasks={tasks}
        onShowOverloadWarning={onShowOverloadWarning}
      />
    );

    const warningButton = screen.getByTitle('Q1 overload warning - click for tips');
    fireEvent.click(warningButton);

    expect(onShowOverloadWarning).toHaveBeenCalled();
  });

  it('marks first 3 incomplete Q1 tasks as top priority', () => {
    const tasks = Array.from({ length: 4 }, (_, i) =>
      createTask({ id: i + 1, title: `Task ${i + 1}`, completed: false })
    );

    render(
      <Quadrant
        quadrant="q1"
        tasks={tasks}
        allTasks={tasks}
      />
    );

    // Should see priority badges 1, 2, 3 but not 4
    expect(screen.getByTitle('Top priority #1')).toBeInTheDocument();
    expect(screen.getByTitle('Top priority #2')).toBeInTheDocument();
    expect(screen.getByTitle('Top priority #3')).toBeInTheDocument();
    expect(screen.queryByTitle('Top priority #4')).not.toBeInTheDocument();
  });

  it('excludes completed tasks from priority calculation', () => {
    const tasks = [
      createTask({ id: 1, title: 'Completed', completed: true }),
      createTask({ id: 2, title: 'Task 1', completed: false }),
      createTask({ id: 3, title: 'Task 2', completed: false })
    ];

    render(
      <Quadrant
        quadrant="q1"
        tasks={tasks}
        allTasks={tasks}
      />
    );

    // Completed task should not have priority badge
    expect(screen.queryByTitle('Top priority #1')).toBeInTheDocument();
    // The first incomplete task should be #1
    const priorityBadges = screen.getAllByTitle(/Top priority/);
    expect(priorityBadges).toHaveLength(2);
  });

  it('calls drag event handlers', () => {
    const onDragOver = vi.fn();
    const onDragLeave = vi.fn();
    const onDrop = vi.fn();

    const { container } = render(
      <Quadrant
        quadrant="q1"
        tasks={[]}
        allTasks={[]}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      />
    );

    const quadrantElement = container.firstChild;

    fireEvent.dragOver(quadrantElement);
    expect(onDragOver).toHaveBeenCalled();

    fireEvent.dragLeave(quadrantElement);
    expect(onDragLeave).toHaveBeenCalled();

    fireEvent.drop(quadrantElement);
    expect(onDrop).toHaveBeenCalled();
  });
});

describe('quadrantConfig', () => {
  it('exports correct configuration for all quadrants', () => {
    expect(quadrantConfig.q1.title).toBe('Urgent & Important');
    expect(quadrantConfig.q2.title).toBe('Important, Not Urgent');
    expect(quadrantConfig.q3.title).toBe('Urgent, Not Important');
    expect(quadrantConfig.q4.title).toBe('Neither Urgent nor Important');

    expect(quadrantConfig.q1.subtitle).toBe('Do First');
    expect(quadrantConfig.q2.subtitle).toBe('Schedule');
    expect(quadrantConfig.q3.subtitle).toBe('Delegate');
    expect(quadrantConfig.q4.subtitle).toBe('Eliminate/Communicate');
  });

  it('exports correct threshold constant', () => {
    expect(Q1_OVERLOAD_THRESHOLD).toBe(6);
  });
});
