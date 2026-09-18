// ==================== CHAT CONSTANTS ====================

export const CHAT_COLORS = {
  primary: '#a855f7',
  primaryHover: '#9333ea',
  primaryGradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  onlineGreen: '#31a24c',
  projectGreen: '#10b981',
  groupAmber: '#f59e0b',
  taskEmerald: '#10b981',

  dark: {
    bg: '#18191a',
    surface: '#242526',
    hover: '#3a3b3c',
    divider: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#E4E6EB',
    textSecondary: '#B0B3B8',
    bubbleIncoming: '#303030',
  },
  light: {
    bg: '#FFFFFF',
    surface: '#f0f2f5',
    hover: '#e4e6eb',
    divider: 'rgba(0, 0, 0, 0.08)',
    textPrimary: '#050505',
    textSecondary: '#65676B',
    bubbleIncoming: '#E4E6EB',
  },
} as const;

export const CHAT_TIMERS = {
  TYPING_DEBOUNCE_MS: 2000,
  TYPING_TIMEOUT_MS: 3500,
  AUTO_SCROLL_DELAY_MS: 50,
  RECONNECT_INTERVALS: [0, 1000, 3000, 5000, 10000, 30000],
} as const;

export const CHAT_PAGINATION = {
  DEFAULT_PAGE_SIZE: 30,
  TOP_SCROLL_THRESHOLD: 40,
  BOTTOM_SCROLL_THRESHOLD: 140,
} as const;

export const CHAT_MENTION_TRIGGERS = {
  USER: '@',
  TASK: '#',
  PROJECT: '!',
} as const;

export const QUICK_EMOJIS = [
  '👍', '❤️', '😊', '😂', '🎉', '👏',
  '🔥', '💪', '🏗️', '📐', '✅', '⚠️',
  '⭐', '🤝', '⚡', '☕'
] as const;

export const BUBBLE_RADIUS = {
  SINGLE: '18px',
  OWN_FIRST: '18px 18px 4px 18px',
  OWN_MIDDLE: '18px 4px 4px 18px',
  OWN_LAST: '18px 4px 18px 18px',
  INCOMING_FIRST: '18px 18px 18px 4px',
  INCOMING_MIDDLE: '4px 18px 18px 4px',
  INCOMING_LAST: '4px 18px 18px 18px',
} as const;
