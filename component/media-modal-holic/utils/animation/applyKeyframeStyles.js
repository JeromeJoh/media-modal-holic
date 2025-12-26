export function applyKeyframeStyles(
  el,
  keyframe
) {
  for (const prop in keyframe) {
    if (
      prop === 'offset' ||
      prop === 'easing' ||
      prop === 'composite'
    ) {
      continue;
    }

    el.style[prop] = keyframe[prop];
  }
}