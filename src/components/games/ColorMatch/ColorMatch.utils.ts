const formatHSL = (h: number, s: number, l: number) =>
  `hsl(${h}, ${s}%, ${l}%)`;

function generateColorVariation(
  h: number,
  s: number,
  l: number,
  level: number
): string {
  const variationRange = Math.max(30 - level * 2, 5); // Decrease the range as the level increases, minimum range of 5
  const newH =
    h + Math.floor(Math.random() * variationRange) - variationRange / 2;
  const newS =
    s + Math.floor(Math.random() * variationRange) - variationRange / 2;
  const newL =
    l + Math.floor(Math.random() * variationRange) - variationRange / 2;

  // Ensure the lightness is within the acceptable range
  const minLightness = 10;
  const maxLightness = 90;
  const adjustedL = Math.max(minLightness, Math.min(newL, maxLightness));

  return formatHSL(newH, newS, adjustedL);
}

export function generateRandomColors(level: number) {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 100);

  // Ensure the lightness is not very light or extremely dark
  const minLightness = 20;
  const maxLightness = 80;
  const l =
    Math.floor(Math.random() * (maxLightness - minLightness + 1)) +
    minLightness;

  const colorToMatch = formatHSL(h, s, l);

  // Generate 4 colors that are similar to the first color
  const colors = [colorToMatch];
  while (colors.length < 4) {
    const newColor = generateColorVariation(h, s, l, level);
    if (newColor !== colorToMatch && newColor !== "hsl(0, 0%, 0%)") {
      colors.push(newColor);
    }
  }

  // Shuffle the colors
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colors[i], colors[j]] = [colors[j], colors[i]];
  }

  return { colorToMatch, colors };
}
