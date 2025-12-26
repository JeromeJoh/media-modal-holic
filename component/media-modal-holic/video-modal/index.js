import MediaModal from '../base-modal/index.js';
import { loadExternalResource, applyTemplate } from '../utils/index.js';

export default class VideoModal extends MediaModal {
  constructor() {
    super();
  }

  async connectedCallback() {
    await super.connectedCallback?.();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
  }

  async open(e) {
    super.open?.();
    console.log('OPEN MODAL AT VIDEO OPEN', e.target.tagName);
    const modalAnim = this.$modalVideo.animate(
      [
        { opacity: 0, transform: "scale(0)" },
        { opacity: 1, transform: "scale(1)" }
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    );

    modalAnim.onfinish = () => {
      this.$modalVideo.currentTime = 0;
      // this.$modalVideo.play();
      const v = this.$modal.querySelector('.overlay');
      v && v.classList.add('active');

      v.addEventListener('animationend', () => {
        // v.animate([
        //   {
        //     opacity: 1,9
        //   },
        //   {
        //     opacity: 0,
        //   }
        // ],
        //   {
        //     duration: 300,
        //     easing: "cubic-bezier(0.22, 1, 0.36, 1)"
        //   })
        // setTimeout(() => v.classList.remove('active'), 400);
      })
    }

    this.$modal.animate(
      [
        { opacity: 0 },
        { opacity: 1 }
      ],
      {
        duration: 250,
        easing: "ease-out"
      }
    );

    const first = this.$container.animate(
      [
        { clipPath: 'inset(0% 100% 95% 0%)' },
        { clipPath: 'inset(0% 0% 95% 0%)' }
      ],
      {
        duration: 300,
        easing: "ease-in-out"
      }
    );

    await first.finished;
    this.$container.animate(
      [
        { clipPath: 'inset(0% 0% 95% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)' }
      ],
      {
        duration: 600,
        easing: "ease-out"
      }
    );
  }

  close(e) {
    console.log('CLOSE MODAL AT VIDEO CLOSE', e.target);
    if (e.target.tagName === 'VIDEO') return;
    const videoAnim = this.$modalVideo.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.85)" }
      ],
      { duration: 200, easing: "ease-in" }
    );

    const modalAnim = this.$modal.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 200, easing: "ease-in" }
    );

    videoAnim.onfinish = () => this.$modalVideo.pause();

    modalAnim.onfinish = () => super.close?.();
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

    this.$thumb.innerHTML = `<video src="${this.src}" muted ${this.poster ? `poster="${this.poster}"` : ''}></video>`;

    this.$modal.innerHTML = applyTemplate(html, {
      src: this.src,
      poster: this.poster,
      controls: this.showControls
    })

    const baseSheet = new CSSStyleSheet();
    baseSheet.replaceSync(css);

    this.shadowRoot.adoptedStyleSheets = [
      ...this.shadowRoot.adoptedStyleSheets,
      baseSheet
    ];
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

    document.addEventListener("visibilitychange", () => {
      console.log('VISIBILITY CHANGE EVENT', document.visibilityState);
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