export const loadExternalResource = async (path, baseUrl) => fetch(new URL(path, baseUrl)).then(r => r.text());

