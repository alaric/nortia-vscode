/**
 * Nortia theme generation logic
 * Ported from lua/nortia/theme.lua
 *
 * Copyright (C) 2020 Alaric Nightingale
 * Distributed under terms of the MIT license.
 */

import * as oklab from './oklab';

// Lightness values for each hour of the day (0-23)
const bgColours = [14, 14, 18, 18, 22, 22, 22, 22, 94, 96, 96, 98,
                   98, 96, 94, 94, 25, 22, 18, 18, 14, 14, 14, 14];
const fgColours = [84, 84, 88, 88, 84, 84, 84, 84, 35, 35, 35, 35,
                   35, 35, 35, 35, 84, 84, 84, 84, 84, 84, 80, 80];

const defaultBase = { r: 255, g: 189, b: 60 };
const defaultTintFg = { h: 0, C: 0 };
const defaultTintBg = { h: 0, C: 0 };
const defaultContrastThreshold = 2.5;

export interface ThemeConfig {
  hour: number;
  base?: { r: number; g: number; b: number };
  tintFg?: { h: number; C: number };
  tintBg?: { h: number; C: number };
  contrastThreshold?: number;
}

function isDark(hour: number): boolean {
  return bgColours[hour] <= 50;
}

function bgColour(hour: number): number {
  return bgColours[hour];
}

function fgColour(hour: number): number {
  return fgColours[hour];
}

function getBase(config: ThemeConfig): oklab.OklabPolar {
  const base = config.base || defaultBase;
  return oklab.rgbToPolar(base);
}

function getBgBase(config: ThemeConfig): oklab.OklabPolar {
  const grey = 256 * (bgColour(config.hour) / 100.0);
  const r = oklab.roundClamped(grey, 0, 255);
  const g = oklab.roundClamped(grey, 0, 255);
  const b = oklab.roundClamped(grey, 0, 255);

  const col = oklab.rgbToPolar({ r, g, b });
  const tintBg = config.tintBg || defaultTintBg;
  col.h = tintBg.h;
  col.C = tintBg.C;

  return col;
}

function getFgBase(config: ThemeConfig): oklab.OklabPolar {
  const grey = 256 * (fgColour(config.hour) / 100.0);
  const r = oklab.roundClamped(grey, 0, 255);
  const g = oklab.roundClamped(grey, 0, 255);
  const b = oklab.roundClamped(grey, 0, 255);

  const col = oklab.rgbToPolar({ r, g, b });
  const tintFg = config.tintFg || defaultTintFg;
  col.h = tintFg.h;
  col.C = tintFg.C;

  return col;
}

function w3cLuminenceInt(c: number): number {
  const col = c / 255.0;
  if (col <= 0.03928) {
    return col / 12.92;
  } else {
    return Math.pow((col + 0.055) / 1.055, 2.4);
  }
}

function w3cLuminence(c: oklab.RGB): number {
  const r = w3cLuminenceInt(c.r);
  const g = w3cLuminenceInt(c.g);
  const b = w3cLuminenceInt(c.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function w3cContrast(c1: oklab.OklabPolar, c2: oklab.OklabPolar): number {
  const rgb1 = oklab.oklabToLinearSrgb(oklab.polarToOklab(c1));
  const rgb2 = oklab.oklabToLinearSrgb(oklab.polarToOklab(c2));
  const lum1 = w3cLuminence(rgb1);
  const lum2 = w3cLuminence(rgb2);

  if (lum1 > lum2) {
    return (lum1 + 0.05) / (lum2 + 0.05);
  } else {
    return (lum2 + 0.05) / (lum1 + 0.05);
  }
}

function palette(
  config: ThemeConfig,
  transform?: (c: oklab.OklabPolar) => oklab.OklabPolar
): string {
  let c = getBase(config);

  if (transform) {
    c = transform(c);
  }

  const bgBase = getBgBase(config);
  const contrastThreshold = config.contrastThreshold || defaultContrastThreshold;

  let contrast = w3cContrast(c, bgBase);
  while (contrast < contrastThreshold) {
    if (isDark(config.hour)) {
      c.L = c.L * 1.10;
      c.C = c.C * 1.10;
    } else {
      c.L = c.L * 0.9;
      c.C = c.C * 1.20;
    }
    contrast = w3cContrast(c, bgBase);
  }

  return oklab.polarToHex(c);
}

export function fg(config: ThemeConfig): string {
  return oklab.polarToHex(getFgBase(config));
}

export function bg(config: ThemeConfig): string {
  return oklab.polarToHex(getBgBase(config));
}

// Helper function to adjust colors for foreground/background offsets
// Matches Neovim's fg_offset and bg_offset behavior
function adjustColor(hex: string, amount: number, isDark: boolean, isFgOffset: boolean): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const polar = oklab.rgbToPolar({ r, g, b });

  if (isFgOffset) {
    // fg_offset: makes foreground less prominent (moves toward background)
    // Dark theme: darken (reduce L) - light fg moves toward dark bg
    // Light theme: lighten (increase L) - dark fg moves toward light bg
    // Use additive adjustment to avoid compounding
    const adjust = amount / 400; // Additive amount in Oklab L space
    polar.L = isDark ? polar.L - adjust : polar.L + adjust;
  } else {
    // bg_offset: makes background more prominent (moves away from background)
    // Dark theme: lighten (increase L) - dark bg gets lighter
    // Light theme: darken (reduce L) - light bg gets darker
    const adjust = amount / 400;
    polar.L = isDark ? polar.L + adjust : polar.L - adjust;
  }

  return oklab.polarToHex(polar);
}

export function generateThemeColors(config: ThemeConfig) {
  const hour = config.hour;
  const dark = isDark(hour);

  // Base colors
  const foreground = fg(config);
  const background = bg(config);

  // Foreground variants (progressively lighter/darker)
  const fore2 = adjustColor(foreground, 10, dark, true);
  const fore3 = adjustColor(fore2, 10, dark, true);
  const fore4 = adjustColor(fore3, 10, dark, true);

  // Background variants - use larger increments for visibility
  const back2 = adjustColor(background, 20, dark, false);
  const back3 = adjustColor(back2, 20, dark, false);
  const back4 = adjustColor(back3, 20, dark, false);
  const back5 = adjustColor(back4, 20, dark, false);

  // Palette colors (spread across hues using Oklab)
  const palette1 = palette(config);
  const palette2 = palette(config, (x) => oklab.rotate(x, -45));
  const palette3 = palette(config, (x) => oklab.rotate(x, 30));
  const palette4 = palette(config, (x) => oklab.rotate(x, -75));
  const palette5 = palette(config, (x) => oklab.rotate(x, 150));
  const palette6 = palette(config, (x) => oklab.rotate(x, 190));

  // Semantic colors - use palette function to ensure proper contrast
  // good (green) - hue ~115 degrees
  const good = palette(config, (x) => {
    const base = getBase(config);
    return { ...x, h: (115 / 360.0) * 2 * Math.PI, C: base.C * 1.3 };
  });

  // bad (red) - hue ~0 degrees
  const bad = palette(config, (x) => {
    const base = getBase(config);
    return { ...x, h: (0 / 360.0) * 2 * Math.PI, C: base.C * 1.3 };
  });

  // warn (orange/yellow) - hue ~30 degrees
  const warn = palette(config, (x) => {
    const base = getBase(config);
    return { ...x, h: (30 / 360.0) * 2 * Math.PI, C: base.C * 1.3 };
  });

  // neutral (yellow) - hue ~59 degrees
  const neutral = palette(config, (x) => {
    const base = getBase(config);
    return { ...x, h: (59 / 360.0) * 2 * Math.PI, C: base.C * 1.3 };
  });

  // Background semantic colors - lighter/darker versions
  const goodBg = adjustColor(good, 60, dark, false);
  const badBg = adjustColor(bad, 60, dark, false);
  const warnBg = adjustColor(warn, 60, dark, false);
  const neutralBg = adjustColor(neutral, 60, dark, false);

  return {
    isDark: dark,
    colors: {
      // Editor colors
      'editor.background': background,
      'editor.foreground': foreground,
      'editorLineNumber.foreground': fore4,
      'editorLineNumber.activeForeground': palette1,
      'editorCursor.foreground': palette1,

      // Activity bar
      'activityBar.background': back2,
      'activityBar.foreground': foreground,
      'activityBar.inactiveForeground': fore4,

      // Sidebar
      'sideBar.background': back2,
      'sideBar.foreground': foreground,
      'sideBarTitle.foreground': foreground,

      // Status bar
      'statusBar.background': back3,
      'statusBar.foreground': foreground,
      'statusBar.noFolderBackground': back3,

      // Title bar
      'titleBar.activeBackground': back2,
      'titleBar.activeForeground': foreground,
      'titleBar.inactiveBackground': back2,
      'titleBar.inactiveForeground': fore4,

      // Tabs
      'tab.activeBackground': background,
      'tab.activeForeground': foreground,
      'tab.inactiveBackground': back3,
      'tab.inactiveForeground': fore4,
      'tab.border': back5,
      'editorGroupHeader.tabsBackground': back3,

      // Selection
      'editor.selectionBackground': back3,
      'editor.selectionHighlightBackground': back3,
      'editor.lineHighlightBackground': back2,

      // Search
      'editor.findMatchBackground': warnBg,
      'editor.findMatchHighlightBackground': neutralBg,
      'searchEditor.findMatchBackground': warnBg,

      // Diff colors
      'diffEditor.insertedTextBackground': goodBg + '40',
      'diffEditor.removedTextBackground': badBg + '40',

      // Git
      'gitDecoration.modifiedResourceForeground': neutral,
      'gitDecoration.deletedResourceForeground': bad,
      'gitDecoration.untrackedResourceForeground': good,
      'gitDecoration.ignoredResourceForeground': fore4,
      'gitDecoration.conflictingResourceForeground': warn,

      // Lists and trees
      'list.activeSelectionBackground': back4,
      'list.activeSelectionForeground': foreground,
      'list.inactiveSelectionBackground': back3,
      'list.hoverBackground': back3,
      'list.focusBackground': back3,

      // Inputs
      'input.background': back2,
      'input.foreground': foreground,
      'input.border': back5,
      'inputOption.activeBorder': palette1,

      // Dropdown
      'dropdown.background': back3,
      'dropdown.foreground': foreground,
      'dropdown.border': back5,

      // Buttons
      'button.background': palette1,
      'button.foreground': background,
      'button.hoverBackground': palette2,

      // Panels
      'panel.background': background,
      'panel.border': back5,
      'panelTitle.activeForeground': foreground,
      'panelTitle.inactiveForeground': fore4,

      // Terminal
      'terminal.background': background,
      'terminal.foreground': foreground,
      'terminal.ansiBlack': background,
      'terminal.ansiWhite': foreground,
      'terminal.ansiRed': bad,
      'terminal.ansiGreen': good,
      'terminal.ansiYellow': warn,
      'terminal.ansiBlue': palette5,
      'terminal.ansiMagenta': palette2,
      'terminal.ansiCyan': palette3,

      // Notifications
      'notificationCenter.border': back5,
      'notificationCenterHeader.background': back3,
      'notifications.background': back3,
      'notifications.foreground': foreground,
      'notifications.border': back5,

      // Borders
      'contrastBorder': back5,
      'focusBorder': palette1,

      // Scrollbar
      'scrollbarSlider.background': back4 + '80',
      'scrollbarSlider.hoverBackground': back5 + 'A0',
      'scrollbarSlider.activeBackground': back5 + 'C0',
    },
    tokenColors: [
      {
        scope: ['comment', 'punctuation.definition.comment'],
        settings: {
          foreground: fore4,
          fontStyle: 'italic',
        },
      },
      {
        scope: ['string', 'string.quoted'],
        settings: {
          foreground: palette3,
        },
      },
      {
        scope: ['constant.numeric', 'constant.language', 'constant.character'],
        settings: {
          foreground: palette5,
        },
      },
      {
        scope: ['keyword', 'storage.type', 'storage.modifier'],
        settings: {
          foreground: palette6,
        },
      },
      {
        scope: ['keyword.control', 'keyword.operator'],
        settings: {
          foreground: palette2,
        },
      },
      {
        scope: ['entity.name.function', 'support.function'],
        settings: {
          foreground: palette1,
        },
      },
      {
        scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class'],
        settings: {
          foreground: palette1,
        },
      },
      {
        scope: ['variable', 'variable.other', 'variable.parameter'],
        settings: {
          foreground: fore2,
        },
      },
      {
        scope: ['entity.other.attribute-name'],
        settings: {
          foreground: palette4,
        },
      },
      {
        scope: ['support.type.property-name'],
        settings: {
          foreground: fore2,
        },
      },
      {
        scope: ['punctuation.definition.tag', 'punctuation.separator'],
        settings: {
          foreground: fore2,
        },
      },
      {
        scope: ['entity.name.tag'],
        settings: {
          foreground: palette2,
        },
      },
      {
        scope: ['markup.heading'],
        settings: {
          foreground: palette1,
          fontStyle: 'bold',
        },
      },
      {
        scope: ['markup.italic'],
        settings: {
          fontStyle: 'italic',
        },
      },
      {
        scope: ['markup.bold'],
        settings: {
          fontStyle: 'bold',
        },
      },
      {
        scope: ['markup.underline'],
        settings: {
          fontStyle: 'underline',
        },
      },
      {
        scope: ['markup.inline.raw'],
        settings: {
          foreground: palette3,
        },
      },
      {
        scope: ['invalid', 'invalid.illegal'],
        settings: {
          foreground: bad,
        },
      },
    ],
  };
}
