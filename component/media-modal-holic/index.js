export async function defineLazy(type, tagName) {
  const tag = tagName || `${type}-modal-holic`;
  if (customElements.get(tag)) return;
  const module = await import(`./${type}-modal/index.js`);
  customElements.define(tag, module.default);
}

export async function defineAll(prefix = '') {
  await Promise.all([
    defineLazy('audio', `${prefix}audio-modal-holic`),
    defineLazy('image', `${prefix}image-modal-holic`),
    defineLazy('video', `${prefix}video-modal-holic`)
  ]);
}

export function autoRegister(prefix = '') {
  return defineAll(prefix);
}