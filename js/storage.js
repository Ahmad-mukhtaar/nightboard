import { DEFAULTS, STORAGE_KEYS } from './sessionDefaults.js';

export function normalizeSettings(raw = {}) {
  const toPositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };
  const mode = raw.mode === 'clock' ? 'clock' : DEFAULTS.mode;

  return {
    mode,
    focusMinutes: toPositiveInt(raw.focusMinutes, DEFAULTS.focusMinutes),
    shortBreakMinutes: toPositiveInt(raw.shortBreakMinutes, DEFAULTS.shortBreakMinutes),
    longBreakMinutes: toPositiveInt(raw.longBreakMinutes, DEFAULTS.longBreakMinutes),
    soundEnabled: raw.soundEnabled ?? DEFAULTS.soundEnabled,
    goal: typeof raw.goal === 'string' ? raw.goal.trim() : DEFAULTS.goal,
    city: typeof raw.city === 'string' ? raw.city.trim() : DEFAULTS.city
  };
}

export function loadStoredSettings(storage = globalThis?.localStorage ?? null) {
  try {
    const raw = storage?.getItem(STORAGE_KEYS.settings);
    return normalizeSettings(raw ? JSON.parse(raw) : DEFAULTS);
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveStoredSettings(settings, storage = globalThis?.localStorage ?? null) {
  try {
    storage?.setItem(STORAGE_KEYS.settings, JSON.stringify(normalizeSettings(settings)));
  } catch {
    // Ignore storage failures and keep the session running in-memory.
  }
}
