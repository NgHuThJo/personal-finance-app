class Mutex {
  #isLocked = false;
  #workerQueue: ((value?: unknown) => void)[] = [];

  lock() {
    if (!this.#isLocked) {
      this.#isLocked = true;
      return Promise.resolve();
    }

    return new Promise((resolve) => this.#workerQueue.push(resolve));
  }

  unlock() {
    if (this.#workerQueue.length > 0) {
      const nextWorker = this.#workerQueue.shift();

      if (nextWorker) {
        nextWorker();
      }
    } else {
      this.#isLocked = false;
    }
  }
}

export const mutex = new Mutex();
