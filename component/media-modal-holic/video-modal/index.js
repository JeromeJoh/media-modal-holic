import MediaModal from '../base-modal/index.js';
import { loadExternalResource } from '../utils/index.js';

export default class VideoModal extends MediaModal {
  constructor() {
    super();
    console.log('VIDEO MODAL constructor');
  }

  async connectedCallback() {
    await super.connectedCallback?.();
    console.log('VIDEO ====== modal', this.$modal);
  }

  close() {
    super.close?.();
    this.$modal.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 200, easing: "ease-in" }
    );

    const videoAnim = this.$modalVideo.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.85)" }
      ],
      { duration: 200, easing: "ease-in" }
    );

    videoAnim.onfinish = () => {
      this.$modalVideo.pause();
    };
  }

  open() {
    super.open?.();

    console.log('OPEN MODAL AT VIDEO OPEN');
    // video 弹出动画
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
      console.log(23345345, this.$modalVideo);
      this.$modalVideo.currentTime = 0;
      this.$modalVideo.play();
    }

    // 背景淡入
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

  async _render() {
    console.log('VIDEO MODAL _render', this.$modal, this.$thumb);
    const [html, css] = await Promise.all([loadExternalResource('./template.html', import.meta.url), loadExternalResource('./style.css', import.meta.url)]);

    this.$thumb.innerHTML = this.$modal.innerHTML = `<video src="${this.src}" ${this.showControls ? 'controls' : ''} muted></video>`;

    const baseSheet = new CSSStyleSheet();
    baseSheet.replaceSync(css);

    this.shadowRoot.adoptedStyleSheets = [
      ...this.shadowRoot.adoptedStyleSheets,
      baseSheet
    ];
  }

  _preRender() {
    console.log('VIDEO MODAL _preRender');
  }

  _bindEvents() {
    // hover preview (loop first 5 seconds)
    this.$thumbVideo.addEventListener("mouseenter", () => {
      this.$thumbVideo.currentTime = 0;
      this.$thumbVideo.play();
      this.previewTimer = setInterval(() => {
        if (this.$thumbVideo.currentTime >= 5) {
          this.$thumbVideo.currentTime = 0;
        }
      }, 200);
    });

    this.$thumbVideo.addEventListener("mouseleave", () => {
      clearInterval(this.previewTimer);
      this.$thumbVideo.pause();
      this.$thumbVideo.currentTime = 0;
    });
  }
  _cacheElements() {
    console.log('VIDEO MODAL _cacheElements', this.$modal, this.$thumb);
    this.$thumbVideo = this.$thumb.querySelector('video');
    this.$modalVideo = this.$modal.querySelector('video');
    console.log('VIDEO MODAL _cacheElements', this.$modalVideo, this.$thumbVideo);
  }
  _afterInit() {
  }
  _cleanup() {
  }
}