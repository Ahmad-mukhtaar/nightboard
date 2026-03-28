import { Board } from './Board.js';
import { SoundEngine } from './SoundEngine.js';
import { KeyboardController } from './KeyboardController.js';
import { loadStoredSettings, normalizeSettings, saveStoredSettings } from './storage.js';
import { PomodoroController } from './PomodoroController.js';
import { ClockBoardController } from './ClockBoardController.js';
import { WeatherService } from './weatherService.js';

document.addEventListener('DOMContentLoaded', () => {
  const boardContainer = document.getElementById('board-container');
  const hudTimeLabel = document.getElementById('hud-time-label');
  const hudTime = document.getElementById('hud-time');
  const hudGoalLabel = document.getElementById('hud-goal-label');
  const hudGoal = document.getElementById('hud-goal');
  const hudModeLabel = document.getElementById('hud-mode-label');
  const hudMode = document.getElementById('hud-mode');
  const hudTodayLabel = document.getElementById('hud-today-label');
  const hudToday = document.getElementById('hud-today');
  const form = document.getElementById('session-form');
  const modeInput = document.getElementById('board-mode');
  const focusMinutesInput = document.getElementById('focus-minutes');
  const focusMinutesCustomInput = document.getElementById('focus-minutes-custom');
  const shortBreakInput = document.getElementById('short-break-minutes');
  const shortBreakCustomInput = document.getElementById('short-break-minutes-custom');
  const longBreakInput = document.getElementById('long-break-minutes');
  const longBreakCustomInput = document.getElementById('long-break-minutes-custom');
  const goalInput = document.getElementById('goal-input');
  const cityInput = document.getElementById('city-input');
  const soundEnabledInput = document.getElementById('sound-enabled');
  const pomodoroFields = Array.from(document.querySelectorAll('.pomodoro-field'));
  const clockFields = Array.from(document.querySelectorAll('.clock-field'));
  const soundEngine = new SoundEngine();
  const board = new Board(boardContainer, soundEngine);
  const weatherService = new WeatherService();
  const settings = loadStoredSettings();
  let activeController = null;
  const keyboardController = new KeyboardController(null, soundEngine);
  const hud = {
    time: hudTime,
    goal: hudGoal,
    mode: hudMode,
    today: hudToday,
    labels: {
      time: hudTimeLabel,
      goal: hudGoalLabel,
      mode: hudModeLabel,
      today: hudTodayLabel
    }
  };
  soundEngine.setMuted(!settings.soundEnabled);

  const timerControls = [
    {
      select: focusMinutesInput,
      customInput: focusMinutesCustomInput,
      presets: [25, 30, 45, 60]
    },
    {
      select: shortBreakInput,
      customInput: shortBreakCustomInput,
      presets: [5, 10, 15]
    },
    {
      select: longBreakInput,
      customInput: longBreakCustomInput,
      presets: [15, 20, 30]
    }
  ];

  const createController = (nextSettings) => (
    nextSettings.mode === 'clock'
      ? new ClockBoardController({ board, settings: nextSettings, weatherService })
      : new PomodoroController({
        board,
        soundEngine,
        settings: nextSettings,
        onCycleComplete: () => {
          returnToSetup();
        }
      })
  );

  const activateController = (nextSettings) => {
    activeController?.stop?.();
    activeController = createController(nextSettings);
    keyboardController.setController(activeController);
    activeController.attachHud(hud);
    activeController.updateBoard();
  };

  const returnToSetup = async () => {
    activeController?.stop?.();
    document.body.classList.remove('board-active');
    updateModeForm();

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore exit failures.
      }
    }
  };

  keyboardController.setCallbacks({
    onBack: () => {
      returnToSetup();
    }
  });

  const syncTimerControl = ({ select, customInput, presets }, value) => {
    const numericValue = Number(value);
    const usesPreset = presets.includes(numericValue);

    if (usesPreset) {
      select.value = String(numericValue);
      customInput.value = '';
      customInput.hidden = true;
      customInput.disabled = true;
      customInput.required = false;
      return;
    }

    select.value = 'custom';
    customInput.hidden = false;
    customInput.disabled = false;
    customInput.required = true;
    customInput.value = Number.isFinite(numericValue) && numericValue > 0
      ? String(numericValue)
      : '';
  };

  const readTimerValue = ({ select, customInput }) => (
    select.value === 'custom' ? customInput.value : select.value
  );

  const updateModeForm = () => {
    const mode = modeInput.value;
    document.body.classList.toggle('clock-mode', mode === 'clock');

    pomodoroFields.forEach((field) => {
      field.hidden = mode !== 'pomodoro';
      field.querySelectorAll('input, select').forEach((control) => {
        control.disabled = mode !== 'pomodoro';
      });
    });

    clockFields.forEach((field) => {
      field.hidden = mode !== 'clock';
      field.querySelectorAll('input, select').forEach((control) => {
        control.disabled = mode !== 'clock';
      });
    });

    cityInput.required = mode === 'clock';

    if (mode === 'pomodoro') {
      timerControls.forEach((control) => {
        const value = readTimerValue(control);
        syncTimerControl(control, value);
      });
    }
  };

  timerControls.forEach((control) => {
    control.select.addEventListener('change', () => {
      syncTimerControl(control, readTimerValue(control));
      saveStoredSettings(collectSettings());
    });

    control.customInput.addEventListener('input', () => {
      saveStoredSettings(collectSettings());
    });

    control.customInput.addEventListener('change', () => {
      saveStoredSettings(collectSettings());
    });
  });

  modeInput.value = settings.mode;
  syncTimerControl(timerControls[0], settings.focusMinutes);
  syncTimerControl(timerControls[1], settings.shortBreakMinutes);
  syncTimerControl(timerControls[2], settings.longBreakMinutes);
  goalInput.value = settings.goal;
  cityInput.value = settings.city;
  soundEnabledInput.checked = settings.soundEnabled;
  updateModeForm();

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

  activateController(settings);

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
    mode: modeInput.value,
    focusMinutes: readTimerValue(timerControls[0]),
    shortBreakMinutes: readTimerValue(timerControls[1]),
    longBreakMinutes: readTimerValue(timerControls[2]),
    goal: goalInput.value,
    city: cityInput.value,
    soundEnabled: soundEnabledInput.checked
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nextSettings = collectSettings();
    saveStoredSettings(nextSettings);
    activateController(nextSettings);
    activeController.applySettings(nextSettings);
    soundEngine.setMuted(!nextSettings.soundEnabled);

    document.body.classList.add('board-active');
    if (nextSettings.mode === 'clock') {
      activeController.start();
    } else {
      activeController.startPrelaunch();
    }
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

  modeInput.addEventListener('change', () => {
    updateModeForm();
    saveStoredSettings(collectSettings());
  });

  [goalInput, cityInput].forEach((input) => {
    input.addEventListener('change', () => {
      saveStoredSettings(collectSettings());
    });
  });

  activeController.updateBoard();
});
