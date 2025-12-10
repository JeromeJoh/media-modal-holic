import MediaModal from '../base-modal/index.js';
import { loadExternalResource } from '../utils/index.js';

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

  open() {
    super.open?.();
    console.log('OPEN MODAL AT VIDEO OPEN');
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
      this.$modalVideo.play();
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
  }

  close() {
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
  }

  async _render() {
    const [html, css] = await Promise.all([loadExternalResource('./template.html', import.meta.url), loadExternalResource('./style.css', import.meta.url)]);

    this.$thumb.innerHTML = this.$modal.innerHTML = `<video src="${this.src}" ${this.showControls ? 'controls' : ''} muted poster="${this.poster}"></video>`;

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
      clearInterval(this.previewTimer);
      this.$thumbVideo.pause();
      this.$thumbVideo.currentTime = 0;
      this.poster && this.$thumbVideo.load();
    }, { signal: this.controller.signal });

    document.addEventListener("visibilitychange", () => {
      console.log('VISIBILITY CHANGE EVENT', document.visibilityState);
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