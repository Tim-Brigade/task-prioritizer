import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * Help modal explaining the Eisenhower Matrix
 */
export const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">How to Use Task Prioritizer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Overview</h3>
            <p className="text-gray-700">
              Task Prioritizer uses the <strong>Eisenhower Matrix</strong> (also called the Urgent-Important Matrix) to help you organize tasks by urgency and importance.
              Named after President Dwight D. Eisenhower, this method helps you focus on what truly matters.
            </p>
          </section>

          <section className="bg-green-50 border border-green-200 rounded p-4">
            <h3 className="text-lg font-bold text-green-900 mb-2">Why Use the Eisenhower Matrix?</h3>
            <ul className="space-y-2 text-green-800 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span><strong>Reduce stress:</strong> Stop reacting to everything as urgent; prioritize what matters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span><strong>Increase productivity:</strong> Focus energy on high-impact tasks instead of busywork</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span><strong>Achieve goals:</strong> Spend more time on strategic work (Q2) that drives long-term success</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span><strong>Better work-life balance:</strong> Identify and eliminate time-wasters (Q4)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span>
                <span><strong>Make confident decisions:</strong> Clear framework for saying "no" to less important tasks</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">The Four Quadrants</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-red-400 pl-3">
                <h4 className="font-semibold text-gray-900">Q1: Urgent & Important (Do First)</h4>
                <p className="text-sm text-gray-600">Critical tasks requiring immediate attention. Crises, deadlines, emergencies.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-3">
                <h4 className="font-semibold text-gray-900">Q2: Important, Not Urgent (Schedule)</h4>
                <p className="text-sm text-gray-600">Strategic tasks for long-term success. Planning, development, relationship building.</p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-3">
                <h4 className="font-semibold text-gray-900">Q3: Urgent, Not Important (Delegate)</h4>
                <p className="text-sm text-gray-600">Tasks that demand attention but don't contribute to your goals. Interruptions, some emails.</p>
              </div>
              <div className="border-l-4 border-gray-400 pl-3">
                <h4 className="font-semibold text-gray-900">Q4: Neither Urgent nor Important (Eliminate/Communicate)</h4>
                <p className="text-sm text-gray-600">Time-wasters and distractions. Consider eliminating these tasks or communicating them appropriately.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Key Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Task Icons:</strong> Colorful icons are automatically assigned based on task titles. Click the icon to choose a different one.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Drag & Drop:</strong> Click and drag anywhere on a task to move it between quadrants.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Due Dates:</strong> Set optional due dates; overdue tasks are highlighted in red.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Auto-Promotion:</strong> Tasks automatically move to urgent quadrants when their due date is today or overdue.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Edit/Delete:</strong> Double-click a task to edit, or use the icons.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Undo/Redo:</strong> Use Ctrl+Z and Ctrl+Shift+Z (or the buttons) to undo/redo.</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="font-semibold text-gray-700">Undo</span>
                <code className="bg-white px-2 py-1 rounded border border-gray-300">Ctrl+Z</code>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="font-semibold text-gray-700">Redo</span>
                <code className="bg-white px-2 py-1 rounded border border-gray-300">Ctrl+Shift+Z</code> or <code className="bg-white px-2 py-1 rounded border border-gray-300">Ctrl+Y</code>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="font-semibold text-gray-700">Save (in modal)</span>
                <code className="bg-white px-2 py-1 rounded border border-gray-300">Ctrl+Enter</code>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="font-semibold text-gray-700">Close Modal</span>
                <code className="bg-white px-2 py-1 rounded border border-gray-300">Escape</code>
              </div>
            </div>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Pro Tip</h3>
            <p className="text-blue-800 text-sm">
              Focus most of your time on <strong>Quadrant 2</strong> (Important, Not Urgent).
              These strategic tasks prevent Q1 crises and lead to long-term success!
            </p>
          </section>
        </div>

        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Q1 Overload warning modal
 */
export const Q1OverloadModal = ({ isOpen, onClose, q1TaskCount = 0 }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={24} className="text-orange-600" />
            Q1 Overload Warning
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <p className="text-orange-900 font-semibold mb-2">
              You have {q1TaskCount} incomplete tasks in Q1 (Urgent & Important)
            </p>
            <p className="text-orange-800 text-sm">
              Having too many urgent and important tasks can lead to stress and burnout. Let's review your priorities.
            </p>
          </div>

          <section>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              Why Q1 Overload Happens
            </h3>
            <p className="text-gray-700 text-sm mb-2">
              Research shows that many Q1 crises originate from <strong>neglected Q2 tasks</strong> (Important but Not Urgent).
              When we don't invest in planning, prevention, and strategic work, those tasks eventually become urgent fires.
            </p>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              How to Reduce Q1 Overload
            </h3>
            <ul className="space-y-2 text-blue-900 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <span><strong>Review each Q1 task:</strong> Are they ALL truly urgent AND important? Some might actually belong in Q2 or Q3.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <span><strong>Focus on top 2-3 priorities:</strong> You can't do everything at once. What MUST be done today?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <span><strong>Break large tasks into smaller steps:</strong> Overwhelming tasks become manageable when divided into concrete actions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">4.</span>
                <span><strong>Schedule Q2 time:</strong> Invest in important-but-not-urgent tasks to prevent future crises.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">5.</span>
                <span><strong>Delegate or postpone:</strong> Can any Q1 tasks be delegated to someone else or scheduled for tomorrow?</span>
              </li>
            </ul>
          </section>

          <section className="bg-green-50 border border-green-200 rounded p-4">
            <h3 className="font-bold text-green-900 mb-2">
              Tip: Your Top 3 Priorities
            </h3>
            <p className="text-green-800 text-sm">
              The first 3 incomplete tasks in Q1 are highlighted with red badges showing their priority order (1, 2, 3).
              Focus on completing these before moving to other tasks.
            </p>
          </section>
        </div>

        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            I'll Review My Priorities
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
