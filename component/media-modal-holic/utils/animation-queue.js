export default class AnimationQueue {
  constructor({ autoPlay = false } = {}) {
    this.queue = [];
    this.running = false;
    this.autoPlay = autoPlay;
    this._abort = false;
  }

  /**
   * @param {() => Animation} createAnimation
   * @param {{
   *   onFinish?: (animation: Animation) => void,
   *   onCancel?: () => void,
   *   onError?: (err: any) => void
   * }} hooks
   */
  add(createAnimation, hooks = {}) {
    if (typeof createAnimation !== 'function') {
      throw new TypeError('AnimationQueue.add expects a function that returns Animation');
    }

    this.queue.push({ createAnimation, hooks });

    // if (this.autoPlay && !this.running) {
    //   this.play();
    // }
  }

  async play() {
    if (this.running) return;
    this.running = true;
    this._abort = false;

    while (this.queue.length && !this._abort) {
      const { createAnimation, hooks } = this.queue.shift();

      let animation;

      try {
        animation = createAnimation();

        if (!animation || typeof animation.finished?.then !== 'function') {
          throw new Error('Invalid Animation instance');
        }

        await animation.finished;
        hooks.onFinish?.(animation);

      } catch (err) {
        // cancel / abort / error 都会进入这里
        if (animation?.playState === 'idle') {
          hooks.onCancel?.();
        } else {
          hooks.onError?.(err);
        }
      }
    }

    this.running = false;
  }

  stop() {
    this._abort = true;
    this.queue.length = 0;
  }

  clear() {
    this.queue.length = 0;
  }
}