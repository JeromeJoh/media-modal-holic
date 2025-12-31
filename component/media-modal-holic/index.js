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

// TODO: 优化 modal open 动画展示效果、资源的默认展示尺寸
// TODO: 统一 modal 关闭动画效果
// TODO: 整理 css 属性顺序与变量命名
// TODO: 简化内联 svg 代码
