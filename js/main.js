import { Board } from './Board.js';
import { SoundEngine } from './SoundEngine.js';
import { KeyboardController } from './KeyboardController.js';
import { loadStoredSettings, saveStoredSettings } from './storage.js';
import { PomodoroController } from './PomodoroController.js';

document.addEventListener('DOMContentLoaded', () => {
  const boardContainer = document.getElementById('board-container');
  const soundEngine = new SoundEngine();
  const board = new Board(boardContainer, soundEngine);
  const settings = loadStoredSettings();
  const controller = new PomodoroController({ board, soundEngine, settings });
  const keyboard = new KeyboardController(controller, soundEngine);

  // Initialize audio on first user interaction (browser autoplay policy)
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
    volumeBtn.classList.toggle('muted', !settings.soundEnabled);
    volumeBtn.addEventListener('click', () => {
      initAudio();
      const muted = soundEngine.toggleMute();
      volumeBtn.classList.toggle('muted', muted);
      saveStoredSettings({
        ...settings,
        soundEnabled: !muted
      });
    });
  }
});
