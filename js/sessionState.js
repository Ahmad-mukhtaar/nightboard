import {
  DEFAULTS,
  PRESTART_SECONDS,
  MODE_SEQUENCE,
  PROGRESS_SEGMENTS
} from './sessionDefaults.js';

export {
  DEFAULTS,
  PRESTART_SECONDS,
  MODE_SEQUENCE,
  PROGRESS_SEGMENTS
};

export function getProgressSegments(totalSeconds, remainingSeconds, segmentCount = PROGRESS_SEGMENTS) {
  if (totalSeconds <= 0) {
    return 0;
  }

  const elapsed = Math.max(0, totalSeconds - remainingSeconds);
  return Math.min(segmentCount, Math.floor((elapsed / totalSeconds) * segmentCount));
}
