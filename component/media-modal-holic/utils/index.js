export const loadExternalResource = async (path, baseUrl) => fetch(new URL(path, baseUrl)).then(r => r.text());

export function applyTemplate(html, vars) {
  return html.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
    if (!(key in vars)) {
      console.warn(`Missing template value: ${key}`);
      return _;
    }
    return String(vars[key]);
  });
}

export function svgToDataUrl(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}