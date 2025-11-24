import MediaModal from '../base-modal/index.js';

export default class ImageModal extends MediaModal {
  constructor() {
    super()
    console.log('ImageModal constructor', this.shadowRoot.innerHTML);
  }

  async connectedCallback() {
    await super.connectedCallback();
    this.thumbVideo = this.shadowRoot.querySelector('.thumb');
    this.modal = this.shadowRoot.querySelector('.modal');
    console.log('modal', this.shadowRoot, this.modal, this.thumbVideo);
    this.modalVideo = this.modal.querySelector('.modal img');

    // hover preview (loop first 5 seconds)
    this.thumbVideo.addEventListener("mouseenter", () => {
    });

    this.thumbVideo.addEventListener("mouseleave", () => {
    });

    // click → open modal
    this.shadowRoot.querySelector('.thumb').addEventListener('click', () => {
      this.modal.classList.add('active');


      // video 弹出动画
      const modalAnim = this.modalVideo.animate(
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
        this.modalVideo.currentTime = 0;
      }

      // 背景淡入
      this.modal.animate(
        [
          { opacity: 0 },
          { opacity: 1 }
        ],
        {
          duration: 250,
          easing: "ease-out"
        }
      );
    });

    // click outside video → close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  close() {
    const bg = this.modal.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 200, easing: "ease-in" }
    );

    const videoAnim = this.modalVideo.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.85)" }
      ],
      { duration: 200, easing: "ease-in" }
    );

    videoAnim.onfinish = () => {
      this.modal.classList.remove('active');
    };
  }

  disconnectedCallback() {
    this._cleanup();
  }

  async _preRender() {
    await this._loadTemplate();
  }

  async _render() {
    await super._render();
    this._updateContent();
    const baseCSS = await fetch(new URL('./style.css', import.meta.url)).then(res => res.text());
    const baseSheet = new CSSStyleSheet();
    baseSheet.replaceSync(baseCSS);
    console.log('sdddcsdvc', this.shadowRoot.adoptedStyleSheets, baseSheet);

    // 合并父 + 子 stylesheet
    this.shadowRoot.adoptedStyleSheets = [
      ...this.shadowRoot.adoptedStyleSheets, // 父类已有的 sheet
      baseSheet                             // 子类 sheet
    ];

  }
  _bindEvents() { }
  _cacheElements() { }
  _afterInit() { }
  _cleanup() { }
}