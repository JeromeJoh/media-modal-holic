import MediaModal from '../base-modal/index.js';
import { loadExternalResource, applyTemplate } from '../utils/index.js';

export default class AudioModal extends MediaModal {
  constructor() {
    super()
  }

  async connectedCallback() {
    await super.connectedCallback();
  }

  disconnectedCallback() {
    this._cleanup();
  }

  open() {
    super.open?.();
    const modalAnim = this.$modalAudio.animate(
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
      this.$modalAudio.currentTime = 0;
      this.$modalAudio.play();
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
    const audioAnim = this.$modalAudio.animate(
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

    audioAnim.onfinish = () => this.$modalAudio.pause();

    modalAnim.onfinish = () => super.close?.();
  }

  async _preRender() {
    this.cover = this.getAttribute('cover');
    this.size = this.getAttribute('size') || '200px';
    this.$thumb.style.setProperty('--cover-size', this.size);
  }

  async _render() {
    const [html, css] = await Promise.all([loadExternalResource('./template.html', import.meta.url), loadExternalResource('./style.css', import.meta.url)]);

    this.$thumb.innerHTML = `<img src="${this.cover}" alt="Audio cover"></img>`;
    this.$modal.innerHTML = applyTemplate(html, {
      src: this.src,
      cover: this.cover
    });

    const baseSheet = new CSSStyleSheet();
    baseSheet.replaceSync(css);

    this.shadowRoot.adoptedStyleSheets = [
      ...this.shadowRoot.adoptedStyleSheets,
      baseSheet
    ];
  }

  _cacheElements() {
    this.$thumbAudio = this.$thumb.querySelector('audio');
    this.$modalAudio = this.$modal.querySelector('audio');
  }

  _bindEvents() { }

  _afterInit() { }

  _cleanup() { }
}