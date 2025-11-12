/**
 * Oklab color space implementation for Nortia theme
 * Ported from lua/nortia/oklab.lua
 *
 * Copyright (C) 2020 Alaric Nightingale
 * Distributed under terms of the MIT license.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Oklab {
  L: number;
  a: number;
  b: number;
}

export interface OklabPolar {
  L: number;
  C: number;
  h: number;
}

function round(number: number): number {
  return Math.floor(number + 0.5);
}

export function roundClamped(number: number, minClamp: number, maxClamp: number): number {
  return Math.min(Math.max(round(number), minClamp), maxClamp);
}

function linearSrgbToOklab(c: RGB): Oklab {
  const l = 0.4121656120 * c.r + 0.5362752080 * c.g + 0.0514575653 * c.b;
  const m = 0.2118591070 * c.r + 0.6807189584 * c.g + 0.1074065790 * c.b;
  const s = 0.0883097947 * c.r + 0.2818474174 * c.g + 0.6302613616 * c.b;

  const l_ = Math.pow(l, 1.0 / 3.0);
  const m_ = Math.pow(m, 1.0 / 3.0);
  const s_ = Math.pow(s, 1.0 / 3.0);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

export function oklabToLinearSrgb(c: Oklab): RGB {
  const l_ = c.L + 0.3963377774 * c.a + 0.2158037573 * c.b;
  const m_ = c.L - 0.1055613458 * c.a - 0.0638541728 * c.b;
  const s_ = c.L - 0.0894841775 * c.a - 1.2914855480 * c.b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: roundClamped(4.0767245293 * l - 3.3072168827 * m + 0.2307590544 * s, 0, 255),
    g: roundClamped(-1.2681437731 * l + 2.6093323231 * m - 0.3411344290 * s, 0, 255),
    b: roundClamped(-0.0041119885 * l - 0.7034763098 * m + 1.7068625689 * s, 0, 255),
  };
}

function oklabToPolar(c: Oklab): OklabPolar {
  return {
    L: c.L,
    C: Math.sqrt(c.a * c.a + c.b * c.b),
    h: Math.atan2(c.b, c.a),
  };
}

export function polarToOklab(c: OklabPolar): Oklab {
  return {
    L: c.L,
    a: c.C * Math.cos(c.h),
    b: c.C * Math.sin(c.h),
  };
}

function srgbToHex(c: RGB): string {
  const rHex = c.r.toString(16).padStart(2, '0');
  const gHex = c.g.toString(16).padStart(2, '0');
  const bHex = c.b.toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`;
}

export function rgbToPolar(c: RGB): OklabPolar {
  return oklabToPolar(linearSrgbToOklab(c));
}

export function polarToHex(c: OklabPolar): string {
  return srgbToHex(oklabToLinearSrgb(polarToOklab(c)));
}

export function rotate(c: OklabPolar, amount: number): OklabPolar {
  return {
    L: c.L,
    C: c.C,
    h: c.h + ((amount / 360.0) * 2 * Math.PI),
  };
}
