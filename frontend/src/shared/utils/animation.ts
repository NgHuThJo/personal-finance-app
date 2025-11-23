import { Logger } from "#frontend/shared/app/logging";
import { clamp } from "#frontend/shared/utils/number";

type Animation = {
  draw: (progress: number) => void;
  timing: (timeFraction: number) => number;
  duration: number;
  delay?: number;
  isInfinite?: boolean;
};

export function animate({
  draw,
  timing,
  duration,
  delay = 0,
  isInfinite = false,
}: Animation) {
  let isPaused = false;
  let pauseTimeStamp: number | null;
  let isCancelled = false;
  let start: number | null = null;
  let RAF_id: number | null = null;

  const animationCallback = (timestamp: number) => {
    if (isCancelled) {
      return;
    }

    if (isPaused) {
      pauseTimeStamp = pauseTimeStamp ?? timestamp;
      return;
    }

    if (start === null) {
      start = timestamp + delay;
    } else if (pauseTimeStamp !== null) {
      // Calculate the point where the paused animation should resume
      start = timestamp - (pauseTimeStamp - start);
      pauseTimeStamp = null;
    }

    const timePassed = timestamp - start;
    // Normalize time fraction
    const timeFraction = clamp(timePassed / duration, 0, 1);

    try {
      // Prevent drawing while delay runs down, keep previous animation frame on screen
      if (!(timePassed < 0)) {
        const progress = timing(timeFraction);
        draw(progress);
      }
    } catch (error) {
      Logger.debug("Error in animation draw function", error);
      return;
    }

    if (timeFraction < 1) {
      RAF_id = requestAnimationFrame(animationCallback);
    } else if (isInfinite) {
      start = null;
      RAF_id = requestAnimationFrame(animationCallback);
    }
  };

  RAF_id = requestAnimationFrame(animationCallback);

  return {
    cancel: () => {
      isCancelled = true;
      if (RAF_id !== null) {
        cancelAnimationFrame(RAF_id);
      }
    },
    pause: () => {
      isPaused = true;
      if (RAF_id !== null) {
        cancelAnimationFrame(RAF_id);
      }
    },
    resume: () => {
      isPaused = false;
      RAF_id = requestAnimationFrame(animationCallback);
    },
  };
}

export const throttledDraw = (
  draw: (progress: number) => void,
  interval: number,
) => {
  let last = performance.now();

  return (progress: number) => {
    const now = performance.now();

    if (now - last < interval) {
      return;
    }

    last = now;

    draw(progress);
  };
};

export function linear(timeFraction: number) {
  return timeFraction;
}

export function nthPower(x: number, timeFraction: number) {
  return Math.pow(timeFraction, x);
}

export function bounce(timeFraction: number) {
  for (let a = 0, b = 1; ; a += b, b /= 2) {
    if (timeFraction >= (7 - 4 * a) / 11) {
      return (
        -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
      );
    }
  }
}

export function elastic(x: number, timeFraction: number) {
  return (
    Math.pow(2, 10 * (timeFraction - 1)) *
    Math.cos(((20 * Math.PI * x) / 3) * timeFraction)
  );
}

export function makeEaseOut(timing: (timeFraction: number) => number) {
  return (timeFraction: number) => 1 - timing(1 - timeFraction);
}

export function makeEaseInOut(timing: (timeFraction: number) => number) {
  return (timeFraction: number) => {
    if (timeFraction < 0.5) {
      return timing(2 * timeFraction) / 2;
    }

    return (2 - timing(2 * (1 - timeFraction))) / 2;
  };
}
