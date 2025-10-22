import { describe, it, expect } from 'vitest';
import { getAutoIcon } from '../iconMapping';

describe('getAutoIcon', () => {
  describe('Development & Tech icons', () => {
    it('returns bug emoji for bug-related tasks', () => {
      expect(getAutoIcon('Fix bug in login')).toBe('🐛');
      expect(getAutoIcon('Debug the error')).toBe('🐛');
      expect(getAutoIcon('Issue with database')).toBe('🐛');
    });

    it('returns computer emoji for code-related tasks', () => {
      expect(getAutoIcon('Code the new feature')).toBe('💻');
      expect(getAutoIcon('Implement API')).toBe('💻');
      expect(getAutoIcon('Refactor the module')).toBe('💻');
    });

    it('returns rocket emoji for deployment tasks', () => {
      expect(getAutoIcon('Deploy to production')).toBe('🚀');
      expect(getAutoIcon('Release version 2.0')).toBe('🚀');
      expect(getAutoIcon('Ship the feature')).toBe('🚀');
    });

    it('returns test tube emoji for testing tasks', () => {
      expect(getAutoIcon('Test the new feature')).toBe('🧪');
      expect(getAutoIcon('QA review needed')).toBe('🧪');
    });

    it('returns lightning emoji for performance tasks', () => {
      expect(getAutoIcon('Optimize speed')).toBe('⚡');
      expect(getAutoIcon('Improve performance')).toBe('⚡');
    });

    it('returns lock emoji for security tasks', () => {
      expect(getAutoIcon('Update password policy')).toBe('🔒');
      expect(getAutoIcon('Security audit needed')).toBe('🔒');
    });
  });

  describe('Communication icons', () => {
    it('returns phone emoji for meeting tasks', () => {
      expect(getAutoIcon('Meeting with client')).toBe('📞');
      expect(getAutoIcon('Zoom call at 3pm')).toBe('📞');
      expect(getAutoIcon('Conference tomorrow')).toBe('📞');
    });

    it('returns email emoji for email tasks', () => {
      expect(getAutoIcon('Reply to emails')).toBe('📧');
      expect(getAutoIcon('Send message to team')).toBe('📧');
      expect(getAutoIcon('Check inbox')).toBe('📧');
    });

    it('returns chat emoji for messaging tasks', () => {
      expect(getAutoIcon('Send Slack update')).toBe('💬');
      expect(getAutoIcon('Chat with support')).toBe('💬');
    });
  });

  describe('Planning & Management icons', () => {
    it('returns map emoji for planning tasks', () => {
      expect(getAutoIcon('Plan next quarter')).toBe('🗺️');
      expect(getAutoIcon('Create roadmap')).toBe('🗺️');
      expect(getAutoIcon('Strategy session')).toBe('🗺️');
    });

    it('returns target emoji for goal-related tasks', () => {
      expect(getAutoIcon('Set quarterly goals')).toBe('🎯');
      expect(getAutoIcon('Define objectives')).toBe('🎯');
    });

    it('returns calendar emoji for scheduling tasks', () => {
      expect(getAutoIcon('Add to calendar')).toBe('📅');
      expect(getAutoIcon('Schedule the event')).toBe('📅');
    });
  });

  describe('Urgent & Important icons', () => {
    it('returns siren emoji for urgent tasks', () => {
      expect(getAutoIcon('URGENT: System down')).toBe('🚨');
      expect(getAutoIcon('Critical problem')).toBe('🚨');
      expect(getAutoIcon('Emergency now')).toBe('🚨');
    });

    it('returns fire emoji for crisis tasks', () => {
      expect(getAutoIcon('Fire drill today')).toBe('🔥');
      expect(getAutoIcon('Crisis management')).toBe('🔥');
    });

    it('returns warning emoji for caution tasks', () => {
      expect(getAutoIcon('Warning sign')).toBe('⚠️');
      expect(getAutoIcon('Attention please')).toBe('⚠️');
    });
  });

  describe('Personal & Wellness icons', () => {
    it('returns muscle emoji for fitness tasks', () => {
      expect(getAutoIcon('Go to gym')).toBe('💪');
      expect(getAutoIcon('Exercise routine')).toBe('💪');
      expect(getAutoIcon('Workout session')).toBe('💪');
    });

    it('returns hospital emoji for medical tasks', () => {
      expect(getAutoIcon('Medical exam')).toBe('🏥');
      expect(getAutoIcon('Annual checkup')).toBe('🏥');
    });

    it('returns meal emoji for food tasks', () => {
      expect(getAutoIcon('Grab lunch')).toBe('🍽️');
      expect(getAutoIcon('Eat dinner')).toBe('🍽️');
      expect(getAutoIcon('Have breakfast')).toBe('🍽️');
    });
  });

  describe('Business & Finance icons', () => {
    it('returns money emoji for finance tasks', () => {
      expect(getAutoIcon('Check budget')).toBe('💰');
      expect(getAutoIcon('Make payment')).toBe('💰');
      expect(getAutoIcon('Finance summary')).toBe('💰');
    });

    it('returns chart emoji for analytics tasks', () => {
      expect(getAutoIcon('View analytics')).toBe('📈');
      expect(getAutoIcon('Check metrics')).toBe('📈');
      expect(getAutoIcon('Dashboard KPIs')).toBe('📈');
    });
  });

  describe('Default behavior', () => {
    it('returns default note emoji for unmatched tasks', () => {
      expect(getAutoIcon('Random work')).toBe('📝');
      expect(getAutoIcon('Something else')).toBe('📝');
      expect(getAutoIcon('xyz123')).toBe('📝');
    });

    it('is case insensitive', () => {
      expect(getAutoIcon('BUG IN PRODUCTION')).toBe('🐛');
      expect(getAutoIcon('Fix Bug')).toBe('🐛');
      expect(getAutoIcon('bug')).toBe('🐛');
    });

    it('matches partial keywords', () => {
      expect(getAutoIcon('The buggy code needs fixing')).toBe('🐛');
      expect(getAutoIcon('deployment pipeline')).toBe('🚀');
    });
  });

  describe('Keyword priority', () => {
    it('returns first matching emoji when multiple keywords match', () => {
      // 'bug' appears before 'code' in iconMap
      expect(getAutoIcon('Fix bug in code')).toBe('🐛');

      // 'deploy' appears before 'test' in iconMap
      expect(getAutoIcon('Deploy and test')).toBe('🚀');
    });
  });
});
