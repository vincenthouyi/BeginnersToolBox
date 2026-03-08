export function encodeBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

export function decodeBase64(encoded: string): string {
  return decodeURIComponent(escape(atob(encoded.trim())));
}
