import { FLAP_AUDIO_BASE64 } from './flapAudio.js';

export function buildFlapTimings(changeCount, staggerMs, maxClicks = 4) {
  const total = Math.max(0, Math.min(changeCount, maxClicks));
  return Array.from({ length: total }, (_, index) => index * staggerMs);
}

export function findAttackOffsetSeconds(channelData, sampleRate, threshold = 0.02) {
  if (!channelData?.length || !sampleRate) {
    return 0;
  }

  const step = Math.max(1, Math.floor(sampleRate / 1200));
  const backoffSamples = Math.floor(sampleRate * 0.012);

  for (let index = 0; index < channelData.length; index += step) {
    if (Math.abs(channelData[index]) >= threshold) {
      return Math.max(0, (index - backoffSamples) / sampleRate);
    }
  }

  return 0;
}

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this._initialized = false;
    this._audioBuffer = null;
    this._currentSource = null;
    this._attackOffset = 0;
    this._sliceDuration = 0.14;
  }

  async init() {
    if (this._initialized) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._initialized = true;

    // Decode the embedded audio clip
    try {
      const binaryStr = atob(FLAP_AUDIO_BASE64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      this._audioBuffer = await this.ctx.decodeAudioData(bytes.buffer);
      const firstChannel = this._audioBuffer.getChannelData(0);
      this._attackOffset = findAttackOffsetSeconds(firstChannel, this._audioBuffer.sampleRate);
      this._sliceDuration = Math.min(
        0.16,
        Math.max(0.1, this._audioBuffer.duration - this._attackOffset)
      );
    } catch (e) {
      console.warn('Failed to decode flap audio:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  setMuted(nextMuted) {
    this.muted = Boolean(nextMuted);
    return this.muted;
  }

  /**
   * Play the full transition sound once.
   * This is a single recorded clip of a split-flap board transition,
   * played once per message change (not per tile).
   */
  playTransition() {
    if (!this.ctx || !this._audioBuffer || this.muted) return;
    this.resume();

    // Stop any currently playing transition sound
    if (this._currentSource) {
      try {
        this._currentSource.stop();
      } catch (e) {
        // ignore if already stopped
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this._audioBuffer;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.16;

    source.connect(gain);
    gain.connect(this.ctx.destination);

    source.start(0);
    this._currentSource = source;

    source.onended = () => {
      if (this._currentSource === source) {
        this._currentSource = null;
      }
    };
  }

  playFlapSequence(changeCount, staggerMs) {
    if (!this.ctx || !this._audioBuffer || this.muted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const offsets = buildFlapTimings(changeCount, staggerMs);

    offsets.forEach((offsetMs) => {
      const source = this.ctx.createBufferSource();
      source.buffer = this._audioBuffer;

      const gain = this.ctx.createGain();
      const startAt = now + (offsetMs / 1000);

      source.connect(gain);
      gain.connect(this.ctx.destination);

      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.linearRampToValueAtTime(0.055, startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + this._sliceDuration);

      source.start(startAt, this._attackOffset, this._sliceDuration);
    });
  }

  /** Get the duration of the transition audio clip in ms */
  getTransitionDuration() {
    if (this._audioBuffer) {
      return this._audioBuffer.duration * 1000;
    }
    return 3800; // fallback
  }

  // Keep this for API compatibility but it now plays the full transition
  scheduleFlaps() {
    this.playTransition();
  }
}
