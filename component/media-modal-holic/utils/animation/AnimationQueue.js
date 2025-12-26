export class AnimationQueue {
  constructor(options = {}) {
    this.queue = [];
    this.running = false;
    this.controller = null;
    this.autoPlay = options.autoPlay || false;
  }

  add(item) {
    this.queue.push(item);

    if (this.autoPlay && !this.running) {
      this.play();
    }
  }

  async play() {
    if (this.running) return;

    this.running = true;
    this.controller = new AbortController();

    while (
      this.queue.length &&
      !this.controller.signal.aborted
    ) {
      const item = this.queue.shift();
      await item.run(this.controller.signal);
    }

    this.running = false;
  }

  stop() {
    this.controller?.abort();
    this.queue.length = 0;
    this.running = false;
  }

  clear() {
    this.queue.length = 0;
  }

  reverse() {
    this.queue.reverse();
    this.queue.forEach(item => item.reverse());
  }
}
