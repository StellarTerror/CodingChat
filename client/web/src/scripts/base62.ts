const RADIX = 62;

export const encode = (data: Uint8Array): string => {
  const n = Math.ceil(data.length * 1.3435902316563355); // 1.3435902316633555 = log 256 / log 62
  const res: string[] = [];

  for (let i = 0; i < n; ++i) {
    const sur = data.reduce((p, c) => ((p << 8) + c) % RADIX, 0);
    res.push('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[sur]!);
    minus(data, sur);
    div(data, RADIX);
  }

  return res.reverse().join('');
};

const minus = (arr: Uint8Array, b: number) => {
  for (let i = arr.length - 1; b > 0 && i >= 0; --i) {
    const n = arr[i]! - b;
    if (n < 0) {
      const a = (n % 256) + 256;
      arr[i] = a;
      b = (a - n) / 256;
    } else {
      arr[i] = n % 256;
      b = 0;
    }
  }
};

const div = (arr: Uint8Array, b: number) => {
  let sur = 0;
  arr.forEach((v, i) => {
    sur = (sur << 8) + v;
    arr[i] = (sur / b) | 0;
    sur %= b;
  });
};
