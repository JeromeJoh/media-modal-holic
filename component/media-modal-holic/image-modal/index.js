import MediaModal from '../base-modal/index.js';
import { loadExternalResource, applyTemplate } from '../utils/index.js';

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
        { opacity: 0, transform: "scale(0) translateY(0px)", filter: "blur(20px)" },
        { opacity: 0, transform: "scale(0.35) translateY(-80px)" },
        { opacity: 0.7, transform: "scale(0.7) translateY(50px)" },
        { opacity: 1, transform: "scale(1) translateY(0px)", filter: "blur(0px)" }
      ],
      {
        duration: 700,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    );

    this.$container.classList.add('active');
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
    this.imageCaption = this.getAttribute('title') || 'image caption';
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

    this.$thumb.innerHTML = `
    <img src="${this.src}" alt="${this.imageCaption}" title="${this.imageCaption}"></img>
    `
    this.$modal.innerHTML = applyTemplate(html, {
      src: this.src,
      imageCaption: this.imageCaption
    });

    this._applyStyleSheet(css);
  }

  _cacheElements() {
    this.$thumbImage = this.$thumb.querySelector('img');
    this.$modalImage = this.$modal.querySelector('img');
    this.$container = this.$modal.querySelector('.container');
  }


  _bindEvents() {

  }

  _afterInit() { }

  _cleanup() { }
}