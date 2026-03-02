export class Semaphore {
  #capacity: number;
  #available: number;
  #workerQueue: ((value?: unknown) => void)[] = [];

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new Error("Semaphore capacity must be greater then 0");
    }

    this.#capacity = capacity;
    this.#available = capacity;
  }

  acquire() {
    if (this.#available > 0) {
      this.#available--;
      return Promise.resolve();
    }

    return new Promise((resolve) => this.#workerQueue.push(resolve));
  }

  release() {
    if (this.#workerQueue.length > 0) {
      const nextWorker = this.#workerQueue.shift()!;
      nextWorker();
      return;
    }

    if (this.#available < this.#capacity) {
      this.#available++;
      return;
    }

    // Protect against misuse of release
    throw new Error("Semaphore over-release detected");
  }
}
