import React, { useState } from 'react';
import { X, Plus, Trash2, HelpCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { formatDateForInput, getTodayString } from '../utils/dateUtils';

const LIFE_AREAS = [
  { value: '', label: 'Select a life area...' },
  { value: 'career', label: 'Career' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'finance', label: 'Finance' },
  { value: 'personal-growth', label: 'Personal Growth' },
  { value: 'education', label: 'Education' },
  { value: 'hobbies', label: 'Hobbies & Recreation' },
  { value: 'other', label: 'Other' }
];

const FIELD_TIPS = {
  title: {
    explanation: "A clear, concise name for your goal that captures its essence.",
    tips: [
      "Use action verbs (Learn, Build, Complete, Achieve)",
      "Be specific, not vague (\"Run a 5K\" vs \"Get fit\")",
      "Keep it memorable and motivating"
    ],
    examples: "\"Complete AWS certification\", \"Read 24 books this year\""
  },
  outcome: {
    explanation: "A detailed description of what success looks like when you achieve this goal.",
    tips: [
      "Describe the end state, not the process",
      "Include concrete details you can verify",
      "Imagine explaining to someone how they'd know you succeeded"
    ],
    examples: "\"I have passed the AWS Solutions Architect exam and received my digital certificate.\""
  },
  subGoals: {
    explanation: "Smaller milestones that break your goal into trackable chunks.",
    tips: [
      "Each sub-goal should be completable independently",
      "Order them logically (sequential or by priority)",
      "Aim for 3-7 sub-goals for most major goals"
    ],
    examples: "For \"Launch a blog\": 1) Choose platform, 2) Design layout, 3) Write 5 posts, 4) Go live"
  },
  resources: {
    explanation: "What you need to have or acquire to achieve this goal.",
    tips: [
      "Consider: time, money, skills, tools, people",
      "Identify what you already have vs what you need",
      "Be honest about constraints"
    ],
    examples: "\"2 hours/week study time, $300 for exam fee, access to practice tests\""
  },
  obstacles: {
    explanation: "Potential challenges or blockers that might get in your way.",
    tips: [
      "Think about past failed attempts - what stopped you?",
      "Consider external factors (time, people, circumstances)",
      "Consider internal factors (motivation, habits, skills)"
    ],
    examples: "\"Tendency to procrastinate, busy season at work in Q4, limited evening availability\""
  },
  lifeArea: {
    explanation: "The area of your life this goal impacts most.",
    tips: [
      "Helps you balance goals across different life areas",
      "Useful for filtering and organizing your goals",
      "Choose the primary area even if it spans multiple"
    ],
    examples: "A goal to \"Get promoted\" would be Career; \"Run a marathon\" would be Health & Fitness"
  },
  why: {
    explanation: "Your personal motivation and the deeper reason this goal matters to you.",
    tips: [
      "Ask \"why\" 3-5 times to find the root motivation",
      "Connect to your values or long-term vision",
      "This helps sustain motivation when things get hard"
    ],
    examples: "\"I want to advance my career to provide better opportunities for my family and feel professionally fulfilled.\""
  },
  timeline: {
    explanation: "When you'll start working on this goal and your target completion date.",
    tips: [
      "Be realistic but ambitious",
      "Consider dependencies and busy periods",
      "Shorter timelines often increase focus"
    ],
    examples: "For learning a skill: 3-6 months. For a major life change: 6-12 months."
  }
};

/**
 * Tooltip component for field help
 */
const Tooltip = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-gray-400 hover:text-blue-500 focus:outline-none focus:text-blue-500 transition-colors"
        aria-label="Help"
      >
        <HelpCircle size={14} />
      </button>

      {isVisible && (
        <div className="absolute z-50 left-0 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
          <div className="mb-2">{content.explanation}</div>

          {content.tips && (
            <div className="mb-2">
              <div className="font-semibold text-blue-300 mb-1">Tips:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {content.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {content.examples && (
            <div>
              <div className="font-semibold text-green-300 mb-1">Example:</div>
              <div className="italic text-gray-300">{content.examples}</div>
            </div>
          )}

          {/* Arrow */}
          <div className="absolute left-3 bottom-0 transform translate-y-full">
            <div className="border-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Section header for S.M.A.R.T. categories
 */
const SectionHeader = ({ letter, title, subtitle }) => (
  <div className="flex items-baseline gap-2 mb-3 pt-2">
    <span className="text-lg font-bold text-blue-600">{letter}</span>
    <span className="text-sm font-semibold text-gray-700">{title}</span>
    {subtitle && <span className="text-xs text-gray-500">({subtitle})</span>}
  </div>
);

/**
 * Form component for creating and editing goals
 */
const GoalForm = ({ goal = null, onClose, onSubmit }) => {
  const isEditing = !!goal;

  const [type, setType] = useState(goal?.type || 'simple');
  const [title, setTitle] = useState(goal?.title || '');
  const [outcome, setOutcome] = useState(goal?.outcome || '');
  const [startDate, setStartDate] = useState(
    goal?.timeline?.start ? formatDateForInput(goal.timeline.start) : getTodayString()
  );
  const [endDate, setEndDate] = useState(
    goal?.timeline?.end ? formatDateForInput(goal.timeline.end) : ''
  );
  const [subGoals, setSubGoals] = useState(
    goal?.subGoals || []
  );

  // S.M.A.R.T. fields
  const [lifeArea, setLifeArea] = useState(goal?.lifeArea || '');
  const [why, setWhy] = useState(goal?.why || '');
  const [resources, setResources] = useState(goal?.resources || '');
  const [obstacles, setObstacles] = useState(goal?.obstacles || '');

  const handleAddSubGoal = () => {
    setSubGoals([
      ...subGoals,
      {
        id: uuidv4(),
        title: '',
        targetDate: '',
        status: 'pending'
      }
    ]);
  };

  const handleUpdateSubGoal = (index, field, value) => {
    const updated = [...subGoals];
    updated[index] = { ...updated[index], [field]: value };
    setSubGoals(updated);
  };

  const handleRemoveSubGoal = (index) => {
    setSubGoals(subGoals.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a goal title');
      return;
    }

    if (!outcome.trim()) {
      alert('Please describe the outcome');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please set start and end dates');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      alert('End date must be after start date');
      return;
    }

    if (type === 'major' && subGoals.length === 0) {
      alert('Major goals require at least one sub-goal');
      return;
    }

    // Validate sub-goals
    if (type === 'major') {
      const invalidSubGoals = subGoals.filter(sg => !sg.title.trim());
      if (invalidSubGoals.length > 0) {
        alert('All sub-goals must have a title');
        return;
      }
    }

    const goalData = {
      type,
      title: title.trim(),
      outcome: outcome.trim(),
      timeline: {
        start: startDate,
        end: endDate
      },
      // S.M.A.R.T. fields (only include if provided)
      ...(lifeArea && { lifeArea }),
      ...(why.trim() && { why: why.trim() }),
      ...(resources.trim() && { resources: resources.trim() }),
      ...(obstacles.trim() && { obstacles: obstacles.trim() })
    };

    if (type === 'major') {
      goalData.subGoals = subGoals.map(sg => ({
        ...sg,
        title: sg.title.trim()
      }));
    }

    // If editing, preserve existing data
    if (isEditing) {
      onSubmit({ ...goal, ...goalData });
    } else {
      onSubmit(goalData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit Goal' : 'Create S.M.A.R.T. Goal'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Goal Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">Goal Type</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="simple"
                  checked={type === 'simple'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                />
                <span>Simple Goal</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="major"
                  checked={type === 'major'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-2"
                />
                <span>Major Goal</span>
              </label>
            </div>
          </div>

          {/* S - Specific */}
          <div className="border-t border-gray-100">
            <SectionHeader letter="S" title="Specific" subtitle="What exactly do you want to accomplish?" />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Goal Title *
                  <Tooltip content={FIELD_TIPS.title} />
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a clear, specific goal title"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Outcome *
                  <Tooltip content={FIELD_TIPS.outcome} />
                  <span className="text-gray-400 font-normal ml-1">— What does "done" look like?</span>
                </label>
                <textarea
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="Describe what success looks like for this goal"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* M - Measurable */}
          <div className="border-t border-gray-100">
            <SectionHeader letter="M" title="Measurable" subtitle="How will you track progress?" />

            {type === 'major' ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-600">
                    Sub-goals *
                    <Tooltip content={FIELD_TIPS.subGoals} />
                    <span className="text-gray-400 font-normal ml-1">— Break it down into trackable milestones</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSubGoal}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    Add Sub-goal
                  </button>
                </div>

                <div className="space-y-2">
                  {subGoals.map((subGoal, index) => (
                    <div key={subGoal.id} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={subGoal.title}
                          onChange={(e) =>
                            handleUpdateSubGoal(index, 'title', e.target.value)
                          }
                          placeholder="Sub-goal title"
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="w-40">
                        <input
                          type="date"
                          value={subGoal.targetDate || ''}
                          onChange={(e) =>
                            handleUpdateSubGoal(index, 'targetDate', e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubGoal(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {subGoals.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No sub-goals yet. Click "Add Sub-goal" to create trackable milestones.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Simple goals are tracked as complete/incomplete. Switch to "Major Goal" to add sub-goals for detailed progress tracking.
              </p>
            )}
          </div>

          {/* A - Achievable */}
          <div className="border-t border-gray-100">
            <SectionHeader letter="A" title="Achievable" subtitle="Is this goal realistic?" />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Resources Needed
                  <Tooltip content={FIELD_TIPS.resources} />
                  <span className="text-gray-400 font-normal ml-1">— What do you need to succeed?</span>
                </label>
                <textarea
                  value={resources}
                  onChange={(e) => setResources(e.target.value)}
                  placeholder="Skills, time, money, support, tools, etc."
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Potential Obstacles
                  <Tooltip content={FIELD_TIPS.obstacles} />
                  <span className="text-gray-400 font-normal ml-1">— What might get in the way?</span>
                </label>
                <textarea
                  value={obstacles}
                  onChange={(e) => setObstacles(e.target.value)}
                  placeholder="Challenges or blockers to anticipate"
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* R - Relevant */}
          <div className="border-t border-gray-100">
            <SectionHeader letter="R" title="Relevant" subtitle="Why does this matter?" />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Life Area
                  <Tooltip content={FIELD_TIPS.lifeArea} />
                </label>
                <select
                  value={lifeArea}
                  onChange={(e) => setLifeArea(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LIFE_AREAS.map((area) => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Why is this goal important?
                  <Tooltip content={FIELD_TIPS.why} />
                  <span className="text-gray-400 font-normal ml-1">— Your motivation</span>
                </label>
                <textarea
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  placeholder="What motivates you to pursue this goal?"
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* T - Time-bound */}
          <div className="border-t border-gray-100">
            <SectionHeader letter="T" title="Time-bound" subtitle="When will you achieve this?" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Start Date *
                  <Tooltip content={FIELD_TIPS.timeline} />
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Target Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
            >
              {isEditing ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
