import MediaModal from '../base-modal/index.js';
import { loadExternalResource } from '../utils/index.js';

export default class ImageModal extends MediaModal {
  constructor() {
    super()
  }

  async connectedCallback() {
    await super.connectedCallback();
  }

  open() {
    super.open?.();
    this.$modalImage.animate(
      [
        { opacity: 0, transform: "scale(0)" },
        { opacity: 1, transform: "scale(1)" }
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    );

    const modalAnim = this.$modal.animate(
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
    this.$modalImage.animate(
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

    modalAnim.onfinish = () => super.close?.();

  }

  disconnectedCallback() {
    this._cleanup();
  }

  _preRender() {
    this.autoplay = this.hasAttribute('autoplay');
    this.title = this.getAttribute('title') || 'image';
    this.width = this.getAttribute('width');
    this.aspectRatio = this.getAttribute('aspect-ratio');
    this.style.setProperty('--preview-width', this.width ?? '260px');

    const img = new Image();
    img.src = this.src;
    img.onload = () => this.style.setProperty('--preview-aspect-ratio', this.aspectRatio ?? img.width / img.height);
    ;
  }

  async _render() {
    const [html, css] = await Promise.all([loadExternalResource('./template.html', import.meta.url), loadExternalResource('./style.css', import.meta.url)]);

    this.$thumb.innerHTML = this.$modal.innerHTML = `<img src="${this.src}" ${this.autoplay ? 'autoplay' : ''} alt="${this.title}">`;

    const baseSheet = new CSSStyleSheet();
    baseSheet.replaceSync(css);

    this.shadowRoot.adoptedStyleSheets = [
      ...this.shadowRoot.adoptedStyleSheets,
      baseSheet
    ];
  }

  _cacheElements() {
    this.$thumbImage = this.$thumb.querySelector('img');
    this.$modalImage = this.$modal.querySelector('img');
  }


  _bindEvents() {

  }

  _afterInit() { }

  _cleanup() { }
}