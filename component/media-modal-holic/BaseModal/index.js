export default class MediaModal extends HTMLElement {
  static get observedAttributes() { return ['type', 'src']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.showControls = this.hasAttribute('controls');
  }

  async connectedCallback() {
    console.log('Styles Loaded');

    await this._loadTemplate();
    this._updateContent();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this._updateContent();
  }

  async _loadTemplate() {
    if (!this.template) {
      const res = await fetch(new URL('./template.html', import.meta.url));
      this.template = await res.text();
      const styleRes = await fetch(new URL('./style.css', import.meta.url));
      const styles = await styleRes.text();
      this.shadowRoot.innerHTML = `<style>${styles}</style>` + this.template;
    }
  }

  _updateContent() {
    const type = this.getAttribute('type');
    const src = this.getAttribute('src');
    const container = this.shadowRoot.querySelector('.media-container');

    switch (type) {
      case 'video':
        container.innerHTML = `<video src="${src}" ${this.showControls ? 'controls' : ''}></video>`;
        break;
      case 'audio':
        container.innerHTML = `<audio src="${src}" ${this.showControls ? 'controls' : ''}></audio>`;
        break;
      case 'image':
        container.innerHTML = `<img src="${src}">`;
        break;
    }
  }
}