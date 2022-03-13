import {encode as base62Encode} from "./base62";

export const cyrb53 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export const getRandomColor = (input: string) => {
  const h = cyrb53(input) % 360;
  return `hsl(${h}, 80%, 60%)`;
};

const encoder = new TextEncoder();
export const str2hex = (str: string) =>
  encoder
    .encode(str)
    .reduce<string[]>((p, c) => (p.push(c.toString(16).padStart(2, '0')), p), [])
    .join('');
export const base64ToBase62 = (str: string) => base62Encode(encoder.encode(atob(str)));

export class ResponseError extends Error {
  constructor(readonly response: Response) {
    super('status code: ' + response.status.toString().padStart(3, '0') + '\nresponse: ' + response.text());
  }
}
