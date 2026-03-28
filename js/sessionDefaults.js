export const DEFAULTS = {
  mode: 'pomodoro',
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  soundEnabled: true,
  goal: '',
  city: ''
};

export const PRESTART_SECONDS = 5;
export const PROGRESS_SEGMENTS = 20;
export const MODE_SEQUENCE = [
  'focus',
  'shortBreak',
  'focus',
  'shortBreak',
  'focus',
  'shortBreak',
  'focus',
  'longBreak'
];

export const STORAGE_KEYS = {
  settings: 'nightboard.settings',
  todayCount: 'nightboard.todayCount'
};
