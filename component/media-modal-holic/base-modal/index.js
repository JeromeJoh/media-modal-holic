import { loadExternalResource } from '../utils/index.js';

const STRUCTURE_HOOKS = ["_preRender", "_render", "_cacheElements"];
const BEHAVIOR_HOOKS = ["_bindEvents", "_afterInit"];

class BaseComponent extends HTMLElement {
  #ready = null;
  #resolveReady = null;

  constructor() {
    super();
    this.#ready = new Promise(res => (this.#resolveReady = res));
  }

  connectedCallback() {
    this.#run();
  }

  async #run() {
    // await this.#runHook("_preRender");
    // await this.#runHook("_render");
    // await this.#runHook("_cacheElements");
    // await this.#runHook("_bindEvents");
    // await this.#runHook("_afterInit");
    await this.runHooks(this);

    this.#resolveReady();
  }

  async #runHook(name) {
    const fns = this.#collectHookFns(name);
    console.log('BASE COMPONENT #runHook', name, fns);
    for (const fn of fns) {
      const ret = fn.call(this);
      console.log('BASE COMPONENT ret', ret);
      if (ret instanceof Promise) await ret;
    }
  }

  async runHooks(component) {
    function getPrototypeChain(instance) {
      const chain = [];
      let proto = Object.getPrototypeOf(instance);

      while (proto && proto !== HTMLElement.prototype) {
        chain.push(proto);
        proto = Object.getPrototypeOf(proto);
      }

      // 从最顶层 Base → 子类顺序
      return chain.reverse();
    }

    const protos = getPrototypeChain(component); // Base → Parent → Child

    // 结构阶段
    for (const proto of protos) {
      for (const hook of STRUCTURE_HOOKS) {
        const result = proto[hook]?.call(this);
        if (result instanceof Promise) {
          await result; // 等待 async hook 完成
        }
      }
    }

    // 行为阶段
    for (const proto of protos) {
      for (const hook of BEHAVIOR_HOOKS) {
        proto[hook]?.call(component);
      }
    }
  }

  // 按继承链顺序收集所有 hook（父→子）
  #collectHookFns(name) {
    const fns = [];
    let proto = Object.getPrototypeOf(this);

    while (proto && proto !== HTMLElement.prototype) {
      const fn = proto[name];
      if (typeof fn === "function") fns.unshift(fn);
      proto = Object.getPrototypeOf(proto);
    }
    return fns;
  }

  ready() {
    return this.#ready;
  }
}


export default class MediaModal extends BaseComponent {
  static get observedAttributes() { return ['src']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    console.log('BASE MODAL constructor');
  }

  async connectedCallback() {
    super.connectedCallback?.();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) return;
  }

  async _loadTemplate() {
    if (!this.template) {
      const res = await fetch(new URL('./template.html', import.meta.url));
      this.template = await res.text();
      const styleRes = await fetch(new URL('./style.css', import.meta.url));
      const styles = await styleRes.text();
      this.shadowRoot.innerHTML = this.template;
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
    console.log('BASE MODAL _preRender');
    this.src = this.getAttribute('src');
    this.showControls = this.hasAttribute('controls');
    this.setAttribute('tabindex', '0');
  }

  async _render() {
    console.log('BASE MODAL _render');
    const [html, css] = await Promise.all([loadExternalResource('./template.html', import.meta.url), loadExternalResource('./style.css', import.meta.url)]);

    this.shadowRoot.innerHTML = html;

    const baseSheet = new CSSStyleSheet();
    baseSheet.replaceSync(css);
    this.shadowRoot.adoptedStyleSheets = [baseSheet];

    console.log('BASE MODAL _render done', this.shadowRoot.querySelector('.modal'));
  }

  _bindEvents() {
    console.log('BASE MODAL _bindEvents');
    this.addEventListener('keydown', (e) => {
      console.log('BASE MODAL open()', this, document.activeElement);
      // 只在聚焦时响应
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.open();   // 自己的打开模态框方法
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();  // 自己的关闭模态框方法
      }
    });


    this.$thumb.addEventListener('click', this.open.bind(this));

    this.$modal.addEventListener('click', this.close.bind(this));
  }

  open() {
    this.$modal.classList.add('active');
    console.log('BASE MODAL open()');
  }
  close() {
    this.$modal.classList.remove('active');
    console.log('BASE MODAL close()');
  }
  _cacheElements() {
    this.$modal = this.shadowRoot.querySelector('.modal');
    this.$thumb = this.shadowRoot.querySelector('.thumb');
    console.log('BASE MODAL _cacheElements', this.shadowRoot, this.$modal, this.$thumb);
  }
  _afterInit() {
    console.log('BASE MODAL _afterInit', this.$modal, this.$thumb);
  }
  _cleanup() { }
}