export const DEFAULTS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  soundEnabled: true,
  goal: ''
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
  settings: 'flipoff.settings',
  todayCount: 'flipoff.todayCount'
};
