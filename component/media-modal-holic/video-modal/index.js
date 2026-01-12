import MediaModal from '../base-modal/index.js';
import { loadExternalResource, applyTemplate } from '../utils/index.js';

export default class VideoModal extends MediaModal {
  constructor() {
    super();
    this.rafId = null;
  }

  async connectedCallback() {
    await super.connectedCallback?.();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
  }

  async open() {
    super.open?.();

    const first = this.$container.animate(
      [
        { clipPath: 'inset(0% 0% calc(100% - 4px) 100%)' },
        { clipPath: 'inset(0% 0% calc(100% - 4px) 0%)' }
      ],
      {
        duration: 300,
        easing: "ease-in-out"
      }
    );

    await first.finished;

    this.$modalVideo.currentTime = 0;
    this.$modalVideo.play();
    this.$container.style.setProperty('--progress', '0%')

    this.$container.animate(
      [
        { clipPath: 'inset(0% 0% calc(100% - 4px) 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)' }
      ],
      {
        duration: 600,
        easing: "ease-out"
      }
    );
  }

  close() {
    const videoAnim = this.$modalVideo.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.85)" }
      ],
      { duration: 200, easing: "ease-in" }
    );

    videoAnim.onfinish = () => this.$modalVideo.pause();

    const modalAnim = this.$modal.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 200, easing: "ease-in" }
    );

    modalAnim.onfinish = () => {
      this.rafId && cancelAnimationFrame(this.rafId);
      this.$container.style.setProperty('--progress', '100%');
      super.close?.();
    };
  }

  _preRender() {
    this.showControls = this.hasAttribute('controls');
    this.poster = this.getAttribute('poster');
    this.width = this.getAttribute('width');
    this.aspectRatio = this.getAttribute('aspect-ratio');
    this.style.setProperty('--preview-width', this.width ?? '200px');

    const vid = document.createElement('video');
    vid.src = this.src;
    vid.preload = 'metadata';

    vid.addEventListener('loadedmetadata', () => {
      const ratio = vid.videoWidth / vid.videoHeight;
      this.style.setProperty(
        '--preview-aspect-ratio',
        this.aspectRatio ?? ratio
      );
    });
  }

  async _render() {
    const [html, css] = await Promise.all([loadExternalResource('./template.html', import.meta.url), loadExternalResource('./style.css', import.meta.url)]);

    this.$thumb.innerHTML = /*html*/ `
    <video src="${this.src}" muted ${this.poster ? `poster="${this.poster}"` : ''}></video>
    `;

    this.$modal.innerHTML = applyTemplate(html, {
      src: this.src,
      poster: this.poster,
      controls: this.showControls
    })

    this._applyStyleSheet(css);
  }

  _cacheElements() {
    this.$thumbVideo = this.$thumb.querySelector('video');
    this.$modalVideo = this.$modal.querySelector('video');
    this.$container = this.$modal.querySelector('.container');
  }

  _bindEvents() {
    this.$thumbVideo.addEventListener("mouseenter", () => {
      this.$thumbVideo.currentTime = 0;
      this.$thumbVideo.play();
      this.previewTimer = setInterval(() => {
        if (this.$thumbVideo.currentTime >= 5) {
          this.$thumbVideo.currentTime = 0;
        }
      }, 200);
    }, { signal: this.controller.signal });

    this.$thumbVideo.addEventListener("mouseleave", () => {
      if (!this.previewTimer) return;
      clearInterval(this.previewTimer);
      this.$thumbVideo.pause();
      this.$thumbVideo.currentTime = 0;
      this.poster && this.$thumbVideo.load();
    }, { signal: this.controller.signal });

    function tick() {
      const p = this.$modalVideo.currentTime / this.$modalVideo.duration
      this.$container.style.setProperty('--progress', `${p}`)
      this.rafId = requestAnimationFrame(tick.bind(this))
    }

    this.$modalVideo.addEventListener('play', () => {
      this.rafId = requestAnimationFrame(tick.bind(this))
    })

    this.$modalVideo.addEventListener('pause', () => {
      cancelAnimationFrame(this.rafId)
    })

    this.$modalVideo.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.$modalVideo.paused) {
        this.$modalVideo.play();
      } else {
        this.$modalVideo.pause();
      }
    })

    document.addEventListener("visibilitychange", () => {
      if (!this.$modal.classList.contains('active')) return;
      if (document.visibilityState === "visible") {
        this.$modalVideo.play().catch(() => { });
      } else {
        this.$modalVideo.pause();
      }
    }, { signal: this.controller.signal });
  }

  _afterInit() {
  }

  _cleanup() {
  }
}