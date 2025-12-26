import { applyKeyframeStyles } from './applyKeyframeStyles.js';

export class AnimationItem {
  constructor(options) {
    this.create = options.create;
    this.direction = options.direction || 'normal';
    this.hooks = options.hooks || {};
  }

  async run(signal) {
    let animation = null;

    try {
      const result = this.create(this.direction);
      const keyframes = result.keyframes;
      animation = result.animation;
      console.log('ANIMATION ITEM RUNNING', animation);


      const target = animation.effect.target;

      const frames =
        this.direction === 'reverse'
          ? [...keyframes].reverse()
          : keyframes;

      const startFrame = frames[0];
      const endFrame = frames[frames.length - 1];

      // === 始终态：起始 ===
      applyKeyframeStyles(target, startFrame);
      this.hooks.beforePlay?.(animation);

      if (signal?.aborted) {
        animation.cancel();
        throw new DOMException('Aborted', 'AbortError');
      }



      animation.play();
      await animation.finished;

      // === 始终态：结束 ===
      applyKeyframeStyles(target, endFrame);
      this.hooks.afterPlay?.(animation);
      this.hooks.onFinish?.(animation);

    } catch (err) {
      console.error('ANIMATION ITEM ERROR', err, animation);
      if (animation?.playState === 'idle') {
        this.hooks.onCancel?.(animation);
      } else {
        this.hooks.onError?.(err);
      }
    }
  }

  reverse() {
    this.direction =
      this.direction === 'normal' ? 'reverse' : 'normal';
  }
}
