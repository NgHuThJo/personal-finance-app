type Animation = {
  draw: (progress: number) => void;
  duration: number;
  timing: (timeFraction: number) => number;
};

export type AnimationReturnType = ReturnType<typeof animate>;

export function animate({ draw, duration, timing }: Animation) {
  let isAnimationDone = false;
  let start: number | null = null;
  let requestId: number;

  const animationStep = (time: number) => {
    if (start === null) {
      start = time;
    }

    let timeFraction = (time - start) / duration;
    timeFraction = Math.max(0, Math.min(1, timeFraction));

    const progress = timing(timeFraction);
    draw(progress);

    if (timeFraction < 1) {
      requestId = requestAnimationFrame(animationStep);
    } else {
      isAnimationDone = true;
    }
  };

  requestId = requestAnimationFrame(animationStep);

  return {
    cancel: () => cancelAnimationFrame(requestId),
    done: new Promise<void>((resolve) => {
      const checkCompletion = () => {
        if (isAnimationDone) {
          resolve();
        } else {
          requestAnimationFrame(checkCompletion);
        }
      };

      checkCompletion();
    }),
  };
}

// Timing functions
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
