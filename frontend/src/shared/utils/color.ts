import type { ThemeColor } from "#frontend/shared/client";
import { clamp } from "#frontend/shared/utils/number";

type HexColor = `#${string}`;

const colorHexMap: Record<ThemeColor, HexColor> = {
  Green: "#277C78",
  Yellow: "#F2CDAC",
  Cyan: "#82C9D7",
  Navy: "#626070",
  Red: "#C94736",
  Purple: "#826CB0",
  Turquoise: "#597C7C",
  Brown: "#93674F",
  Magenta: "#934F6F",
  Blue: "#3F82B2",
  Grey: "#696868",
  Army: "#7F9161",
  Pink: "#AF81BA",
  YellowGreen: "#CAB361",
  Orange: "#BE6C49",
};

type KeyValueObject<T> = {
  [K in keyof T]: {
    key: K;
    value: T[K];
  };
}[keyof T];

export const colorHexList = Object.entries(colorHexMap).map(([key, value]) => ({
  key,
  value,
})) as KeyValueObject<typeof colorHexMap>[];

export const getColorHexCode = (theme: ThemeColor): HexColor => {
  return colorHexMap[theme] ?? "#000000";
};

const blend = (input: number, percent: number) =>
  Math.round(input + (255 - input) * (percent / 100));
const colorBitMask = 0xff;

export const addShade = (
  hexColorString: ThemeColor,
  percent: number,
): HexColor => {
  // Convert hex color string to integer
  const hexColorNumber = parseInt(hexColorString.slice(1), 16);
  // Convert percent to integer between 0 and 255
  // Extract RGB channels from hex code and add shade to each part
  const red = blend(hexColorNumber >> 16, percent);
  const green = blend((hexColorNumber >> 8) & colorBitMask, percent);
  const blue = blend(hexColorNumber & colorBitMask, percent);
  // Clamp each RGB value between 0 and 255 and convert the hex code back to string
  // Add 0x1000000 to ensure hex string always has 6 digits, trim the leading "1" after string conversion, then join with hash symbol
  return ("#" +
    (
      0x1000000 +
      (clamp(red, 0, 255) << 16) +
      (clamp(green, 0, 255) << 8) +
      clamp(blue, 0, 255)
    )
      .toString(16)
      .slice(1)) as HexColor;
};
