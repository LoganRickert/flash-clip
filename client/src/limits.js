export const MAX_PASTE_BYTES = 2 * 1024 * 1024;

const encoder = new TextEncoder();

export function getTextByteSize(text) {
  return encoder.encode(text).byteLength;
}

export function isPasteTooLarge(text) {
  return getTextByteSize(text) > MAX_PASTE_BYTES;
}

export const PASTE_TOO_LARGE_ERROR = 'text exceeds 2 MB limit';
