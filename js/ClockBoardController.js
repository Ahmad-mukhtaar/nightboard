export class ClockBoardController {
  constructor({ board, settings, weatherService, now = () => new Date() }) {
    this.board = board;
    this.settings = settings;
    this.weatherService = weatherService;
    this.now = now;
    this.hud = null;
    this._tickInterval = null;
    this._weatherInterval = null;
    this._weather = null;
    this._weatherError = '';
    this._loadingWeather = false;
  }

  attachHud(hud) {
    this.hud = hud;
    this.board.configureGrid(30, 9, 4);
    this._setHudLabels();
    this.updateBoard();
  }

  applySettings(settings) {
    this.settings = settings;
    this.board.configureGrid(30, 9, 4);
    this._weather = null;
    this._weatherError = '';
    this._loadingWeather = false;
    this._setHudLabels();
    this.updateBoard();
  }

  start() {
    this.stop();
    this.updateBoard();
    this.refreshWeather(true);
    this._tickInterval = window.setInterval(() => {
      this.updateBoard();
    }, 1000);
    this._weatherInterval = window.setInterval(() => {
      this.refreshWeather(false);
    }, 15 * 60 * 1000);
  }

  startPrelaunch() {
    this.start();
  }

  stop() {
    if (this._tickInterval) {
      clearInterval(this._tickInterval);
      this._tickInterval = null;
    }

    if (this._weatherInterval) {
      clearInterval(this._weatherInterval);
      this._weatherInterval = null;
    }
  }

  pauseToggle() {}

  reset() {
    this.refreshWeather(true);
    this.updateBoard();
  }

  async refreshWeather(force) {
    const city = this.settings.city?.trim();
    if (!city || (this._loadingWeather && !force)) {
      return;
    }

    this._loadingWeather = true;
    if (!this._weather) {
      this.updateBoard();
    }

    try {
      this._weather = await this.weatherService.fetchCityWeather(city);
      this._weatherError = '';
    } catch (error) {
      this._weatherError = error?.message === 'City not found'
        ? 'CITY NOT FOUND'
        : 'WEATHER UNAVAILABLE';
    } finally {
      this._loadingWeather = false;
      this.updateBoard();
    }
  }

  updateBoard() {
    const timezone = this._weather?.timezone;
    const timeLabel = this._formatTime(this.now(), timezone);

    if (this.hud) {
      this._setHudLabels();
      this.hud.time.textContent = this._formatCity();
      this.hud.goal.textContent = this._formatWeather();
      this.hud.mode.textContent = 'CLOCK';
      this.hud.today.textContent = this._formatDate(this.now(), timezone);
    }

    this.board.displayRows([
      '',
      '',
      this._formatCity(),
      '',
      timeLabel,
      '',
      this._formatWeather(),
      '',
      ''
    ], 'ready', { playSound: true });
  }

  _setHudLabels() {
    if (!this.hud?.labels) {
      return;
    }

    this.hud.labels.time.textContent = 'City';
    this.hud.labels.goal.textContent = 'Weather';
    this.hud.labels.mode.textContent = 'Mode';
    this.hud.labels.today.textContent = 'Date';
  }

  _formatTime(now, timeZone) {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone
    }).format(now);
  }

  _formatDate(now, timeZone) {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone
    }).format(now).toUpperCase();
  }

  _formatCity() {
    if (this._weather?.city) {
      return this._weather.city.toUpperCase();
    }

    return (this.settings.city?.trim() || 'CITY').toUpperCase();
  }

  _formatWeather() {
    if (this._weatherError) {
      return this._weatherError;
    }

    if (this._loadingWeather && !this._weather) {
      return 'LOADING WEATHER';
    }

    if (!this._weather) {
      return 'WEATHER PENDING';
    }

    return `${this._weather.temperature} ${this._weather.condition}`;
  }
}
