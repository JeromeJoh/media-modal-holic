import { loadExternalResource } from '../utils/index.js';

class BaseComponent extends HTMLElement {
  static #STRUCTURE_HOOKS = ["_preRender", "_render", "_cacheElements"];
  static #BEHAVIOR_HOOKS = ["_bindEvents", "_afterInit"];

  #ready = null;
  #resolveReady = null;

  constructor() {
    super();
    this.#ready = new Promise(res => (this.#resolveReady = res));
  }

  connectedCallback() {
    this.#run();
  }

  disconnectedCallback() {
    this.runHooks(this, ['_cleanup']);
  }

  async #run() {
    await this.runHooks(this);
    this.#resolveReady();
  }

  static #getPrototypeChain(instance) {
    const chain = [];
    let proto = Object.getPrototypeOf(instance);

    while (proto && proto !== HTMLElement.prototype) {
      chain.push(proto);
      proto = Object.getPrototypeOf(proto);
    }

    return chain.reverse();
  }

  async runHooks(component, hookNames) {
    const hooksToRun = hookNames || [
      ...BaseComponent.#STRUCTURE_HOOKS,
      ...BaseComponent.#BEHAVIOR_HOOKS
    ];

    const protos = BaseComponent.#getPrototypeChain(component);

    for (const proto of protos) {
      for (const hook of hooksToRun) {
        const result = proto[hook]?.call(component);
        if (result instanceof Promise) {
          await result;
        }
      }
    }
  }

  ready() {
    return this.#ready;
  }
}


export default class MediaModal extends BaseComponent {
  static get observedAttributes() { return ['src']; }
  controller = new AbortController();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    super.connectedCallback?.();
  }

  disconnectedCallback() {
    super.disconnectedCallback?.();
  }

  attributeChangedCallback(_name, oldValue, newValue) {
    if (oldValue !== newValue) return;
  }

  async _preRender() {
    this.src = this.getAttribute('src');
    this.setAttribute('tabindex', '0');
  }

  async _render() {
    const [html, css] = await Promise.all([loadExternalResource('./template.html', import.meta.url), loadExternalResource('./style.css', import.meta.url)]);
    this.shadowRoot.innerHTML = html;
    const baseSheet = new CSSStyleSheet();
    baseSheet.replaceSync(css);
    this.shadowRoot.adoptedStyleSheets = [baseSheet];
  }

  _cacheElements() {
    this.$modal = this.shadowRoot.querySelector('.modal');
    this.$thumb = this.shadowRoot.querySelector('.thumb');
  }

  _bindEvents() {
    this.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        console.log('BASE MODAL open()', this, document.activeElement);
        e.preventDefault();
        if (this.$modal.classList.contains('active')) return;

        this.open();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    }, { signal: this.controller.signal });


    this.$thumb.addEventListener('click', this.open.bind(this), { signal: this.controller.signal });

    this.$modal.addEventListener('click', this.close.bind(this), { signal: this.controller.signal });
  }

  _afterInit() {
  }

  _cleanup() {
    this.controller.abort();
    console.log('BASE MODAL _cleanup');
  }

  open() {
    this.$modal.classList.add('active');
  }

  close() {
    this.$modal.classList.remove('active');
  }
}