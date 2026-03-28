import { Board } from './Board.js';
import { SoundEngine } from './SoundEngine.js';
import { KeyboardController } from './KeyboardController.js';
import { loadStoredSettings, normalizeSettings, saveStoredSettings } from './storage.js';
import { PomodoroController } from './PomodoroController.js';

document.addEventListener('DOMContentLoaded', () => {
  const boardContainer = document.getElementById('board-container');
  const form = document.getElementById('session-form');
  const focusMinutesInput = document.getElementById('focus-minutes');
  const shortBreakInput = document.getElementById('short-break-minutes');
  const longBreakInput = document.getElementById('long-break-minutes');
  const goalInput = document.getElementById('goal-input');
  const soundEnabledInput = document.getElementById('sound-enabled');
  const soundEngine = new SoundEngine();
  const board = new Board(boardContainer, soundEngine);
  const settings = loadStoredSettings();
  const controller = new PomodoroController({ board, soundEngine, settings });
  new KeyboardController(controller, soundEngine);
  soundEngine.setMuted(!settings.soundEnabled);

  focusMinutesInput.value = String(settings.focusMinutes);
  shortBreakInput.value = String(settings.shortBreakMinutes);
  longBreakInput.value = String(settings.longBreakMinutes);
  goalInput.value = settings.goal;
  soundEnabledInput.checked = settings.soundEnabled;

  let audioInitialized = false;
  const initAudio = async () => {
    if (audioInitialized) return;
    audioInitialized = true;
    await soundEngine.init();
    soundEngine.resume();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('keydown', initAudio);
  };
  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);

  controller.updateBoard();

  // Volume toggle button in header
  const volumeBtn = document.getElementById('volume-btn');
  if (volumeBtn) {
    volumeBtn.classList.toggle('muted', soundEngine.muted);
    volumeBtn.addEventListener('click', () => {
      initAudio();
      const muted = soundEngine.toggleMute();
      soundEnabledInput.checked = !muted;
      volumeBtn.classList.toggle('muted', muted);
      saveStoredSettings({
        ...collectSettings(),
        soundEnabled: !muted
      });
    });
  }

  const collectSettings = () => normalizeSettings({
    focusMinutes: focusMinutesInput.value,
    shortBreakMinutes: shortBreakInput.value,
    longBreakMinutes: longBreakInput.value,
    goal: goalInput.value,
    soundEnabled: soundEnabledInput.checked
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nextSettings = collectSettings();
    saveStoredSettings(nextSettings);
    controller.applySettings(nextSettings);
    soundEngine.setMuted(!nextSettings.soundEnabled);

    document.body.classList.add('board-active');
    controller.startPrelaunch();
    initAudio();

    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Ignore fullscreen failures and let the keyboard shortcut handle it.
    }
  });

  soundEnabledInput.addEventListener('change', () => {
    const nextSettings = collectSettings();
    soundEngine.setMuted(!nextSettings.soundEnabled);
    if (volumeBtn) {
      volumeBtn.classList.toggle('muted', !nextSettings.soundEnabled);
    }
    saveStoredSettings(nextSettings);
  });

  [focusMinutesInput, shortBreakInput, longBreakInput, goalInput].forEach((input) => {
    input.addEventListener('change', () => {
      saveStoredSettings(collectSettings());
    });
  });

  controller.updateBoard();
});
