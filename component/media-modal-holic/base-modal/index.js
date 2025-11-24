export default class MediaModal extends HTMLElement {
  static get observedAttributes() { return ['type', 'src']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.showControls = this.hasAttribute('controls');
  }

  async connectedCallback() {
    await this._preRender();
    this._render();
    this._cacheElements();
    this._bindEvents();
    this._afterInit();
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
    const container = this.shadowRoot.querySelector('.modal');
    const thumb = this.shadowRoot.querySelector('.thumb');
    console.log("_update", type, src, container);
    if (!type || !src || !container) return;
    switch (type) {
      case 'video':
        thumb.innerHTML = container.innerHTML = `<video src="${src}" ${this.showControls ? 'controls' : ''} muted></video>`;
        break;
      case 'audio':
        thumb.innerHTML = container.innerHTML = `<audio src="${src}" ${this.showControls ? 'controls' : ''}></audio>`;
        break;
      case 'image':
        thumb.innerHTML = container.innerHTML = `<img src="${src}">`;
        break;
    }
  }

  disconnectedCallback() {
    this._cleanup();
  }

  async _preRender() {
    await this._loadTemplate();
  }

  _render() {
    this._updateContent();
  }
  _bindEvents() { }
  _cacheElements() { }
  _afterInit() { }
  _cleanup() { }
}