function hslToRgb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(rgb1: number[], rgb2: number[]) {
  const l1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const colorCache = new Map<string, string>();

export const stringToColor = (str: string): string => {
  if (colorCache.has(str)) return colorCache.get(str)!;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;
  let saturation = 70;
  let lightness = 50; // start mid

  // Ensure readability against white and dark purple
  const white = [255, 255, 255];
  const darkBg = hslToRgb(248, 100, 8); // dark purple background

  let rgb = hslToRgb(hue, saturation, lightness);
  let tries = 0;

  // Adjust lightness until contrast is acceptable (≥ 4.5:1 is good)
  while (
    (contrast(rgb, white) < 4.5 || contrast(rgb, darkBg) < 4.5) &&
    tries < 20
  ) {
    // If too light (bad on white), darken
    if (contrast(rgb, white) < 4.5) lightness -= 5;
    // If too dark (bad on dark bg), lighten
    if (contrast(rgb, darkBg) < 4.5) lightness += 5;

    rgb = hslToRgb(hue, saturation, lightness);
    tries++;
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
