export async function defineLazy(type, tagName) {
  const tag = tagName || `${type}-modal-holic`;
  if (customElements.get(tag)) return;
  const module = await import(`./${type}-modal/index.js`);
  customElements.define(tag, module.default);
}

export async function autoRegister(typeArray = ['image'], prefix = '') {
  await Promise.all(
    typeArray.map(type =>
      defineLazy(type, `${prefix}${type}-modal-holic`)
    )
  );
}

export function defineAll(prefix = '') {
  return autoRegister(['image', 'audio', 'video'], prefix);
}

// TODO: modal 展开时通过鼠标滚轮控制播放进度
// TODO: readme 文档补充说明