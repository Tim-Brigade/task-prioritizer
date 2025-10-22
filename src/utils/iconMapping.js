// Auto-select icon based on task title
export const getAutoIcon = (title) => {
  const lowerTitle = title.toLowerCase();

  // Define keyword mappings to emojis
  const iconMap = [
    // Development & Tech
    { keywords: ['bug', 'fix', 'error', 'crash', 'issue', 'debug'], emoji: '🐛' },
    { keywords: ['code', 'develop', 'program', 'implement', 'build', 'refactor'], emoji: '💻' },
    { keywords: ['deploy', 'release', 'launch', 'ship', 'publish'], emoji: '🚀' },
    { keywords: ['test', 'qa', 'quality', 'testing'], emoji: '🧪' },
    { keywords: ['api', 'endpoint', 'integration', 'webhook'], emoji: '🔌' },
    { keywords: ['database', 'data', 'sql', 'query', 'schema'], emoji: '🗄️' },
    { keywords: ['server', 'backend', 'infrastructure'], emoji: '🖥️' },
    { keywords: ['frontend', 'ui', 'interface'], emoji: '🌐' },
    { keywords: ['mobile', 'app', 'ios', 'android'], emoji: '📱' },
    { keywords: ['performance', 'optimize', 'speed'], emoji: '⚡' },
    { keywords: ['security', 'password', 'auth', 'encryption'], emoji: '🔒' },
    { keywords: ['backup', 'save', 'archive', 'export'], emoji: '💾' },

    // Design & Creative
    { keywords: ['design', 'ui', 'ux', 'mockup', 'prototype'], emoji: '🎨' },
    { keywords: ['logo', 'brand', 'identity'], emoji: '🎭' },
    { keywords: ['photo', 'image', 'picture'], emoji: '📸' },
    { keywords: ['video', 'film', 'record'], emoji: '🎬' },
    { keywords: ['music', 'audio', 'sound'], emoji: '🎵' },

    // Communication
    { keywords: ['meeting', 'call', 'zoom', 'conference', 'standup'], emoji: '📞' },
    { keywords: ['email', 'message', 'reply', 'respond', 'inbox'], emoji: '📧' },
    { keywords: ['chat', 'slack', 'discord', 'teams'], emoji: '💬' },
    { keywords: ['present', 'demo', 'show', 'pitch'], emoji: '📊' },
    { keywords: ['interview', 'recruit', 'hire'], emoji: '🎤' },
    { keywords: ['feedback', 'survey', 'review'], emoji: '📝' },

    // Documentation & Content
    { keywords: ['document', 'report', 'write', 'draft', 'doc'], emoji: '📄' },
    { keywords: ['blog', 'article', 'content', 'post'], emoji: '✍️' },
    { keywords: ['note', 'memo', 'minutes'], emoji: '📋' },
    { keywords: ['contract', 'agreement', 'legal'], emoji: '📜' },

    // Planning & Management
    { keywords: ['plan', 'strategy', 'roadmap', 'planning'], emoji: '🗺️' },
    { keywords: ['goal', 'target', 'objective', 'okr'], emoji: '🎯' },
    { keywords: ['schedule', 'calendar', 'appointment'], emoji: '📅' },
    { keywords: ['deadline', 'due', 'time'], emoji: '⏰' },
    { keywords: ['todo', 'task', 'checklist'], emoji: '✅' },
    { keywords: ['prioritize', 'organize', 'sort'], emoji: '📌' },

    // Business & Finance
    { keywords: ['money', 'budget', 'finance', 'pay', 'payment', 'invoice'], emoji: '💰' },
    { keywords: ['sales', 'revenue', 'profit'], emoji: '💵' },
    { keywords: ['analytics', 'metrics', 'stats', 'kpi', 'dashboard'], emoji: '📈' },
    { keywords: ['client', 'customer', 'user', 'account'], emoji: '👤' },
    { keywords: ['tax', 'expense', 'receipt'], emoji: '🧾' },

    // Team & Collaboration
    { keywords: ['team', 'collaborate', 'group', 'together'], emoji: '👥' },
    { keywords: ['delegate', 'assign', 'handoff'], emoji: '🤝' },
    { keywords: ['onboard', 'train', 'mentor'], emoji: '🎓' },

    // Learning & Research
    { keywords: ['learn', 'study', 'research', 'read', 'course'], emoji: '📚' },
    { keywords: ['workshop', 'training', 'seminar'], emoji: '🎓' },
    { keywords: ['experiment', 'try', 'explore'], emoji: '🔬' },

    // Personal & Wellness
    { keywords: ['health', 'exercise', 'workout', 'gym', 'fitness'], emoji: '💪' },
    { keywords: ['doctor', 'medical', 'appointment', 'checkup'], emoji: '🏥' },
    { keywords: ['eat', 'lunch', 'dinner', 'meal', 'food', 'breakfast'], emoji: '🍽️' },
    { keywords: ['sleep', 'rest', 'relax'], emoji: '😴' },
    { keywords: ['meditate', 'mindful', 'zen'], emoji: '🧘' },
    { keywords: ['water', 'hydrate', 'drink'], emoji: '💧' },

    // Shopping & Errands
    { keywords: ['shop', 'buy', 'purchase', 'order', 'amazon'], emoji: '🛒' },
    { keywords: ['grocery', 'groceries', 'supermarket'], emoji: '🥕' },
    { keywords: ['gift', 'present', 'birthday'], emoji: '🎁' },
    { keywords: ['return', 'exchange', 'refund'], emoji: '↩️' },

    // Home & Lifestyle
    { keywords: ['clean', 'organize', 'tidy', 'declutter'], emoji: '🧹' },
    { keywords: ['laundry', 'wash', 'clothes'], emoji: '🧺' },
    { keywords: ['cook', 'recipe', 'kitchen'], emoji: '👨‍🍳' },
    { keywords: ['garden', 'plant', 'grow'], emoji: '🌱' },
    { keywords: ['pet', 'dog', 'cat', 'vet'], emoji: '🐾' },
    { keywords: ['car', 'vehicle', 'drive', 'maintenance'], emoji: '🚗' },

    // Travel & Events
    { keywords: ['travel', 'trip', 'vacation', 'holiday'], emoji: '✈️' },
    { keywords: ['flight', 'plane', 'airport'], emoji: '🛫' },
    { keywords: ['hotel', 'booking', 'reservation'], emoji: '🏨' },
    { keywords: ['event', 'conference', 'summit'], emoji: '🎪' },

    // Urgent & Important
    { keywords: ['urgent', 'critical', 'emergency', 'asap', 'important'], emoji: '🚨' },
    { keywords: ['fire', 'crisis', 'alert'], emoji: '🔥' },
    { keywords: ['warning', 'caution', 'attention'], emoji: '⚠️' },

    // Positive & Achievement
    { keywords: ['celebrate', 'party', 'success', 'win', 'achievement'], emoji: '🎉' },
    { keywords: ['complete', 'done', 'finish', 'accomplish'], emoji: '✨' },
    { keywords: ['launch', 'premiere', 'debut'], emoji: '🎊' },
    { keywords: ['milestone', 'achievement', 'badge'], emoji: '🏆' },

    // Miscellaneous
    { keywords: ['idea', 'brainstorm', 'creative', 'innovation'], emoji: '💡' },
    { keywords: ['question', 'help', 'support'], emoji: '❓' },
    { keywords: ['phone', 'mobile', 'call'], emoji: '☎️' },
    { keywords: ['print', 'printer', 'copy'], emoji: '🖨️' },
    { keywords: ['scan', 'scanner'], emoji: '📠' },
    { keywords: ['book', 'library', 'novel'], emoji: '📖' },
    { keywords: ['news', 'article', 'update'], emoji: '📰' },
    { keywords: ['weather', 'forecast', 'climate'], emoji: '🌤️' },
    { keywords: ['repair', 'maintenance', 'service'], emoji: '🔧' },
    { keywords: ['renew', 'renewal', 'subscription'], emoji: '🔄' },
  ];

  // Find first matching keyword
  for (const { keywords, emoji } of iconMap) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return emoji;
    }
  }

  // Default icon
  return '📝';
};
