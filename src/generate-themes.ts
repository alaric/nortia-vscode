/**
 * Script to generate 24 theme JSON files (one for each hour)
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateThemeColors } from './theme';

function getThemeName(hour: number): string {
  const hourStr = hour.toString().padStart(2, '0');
  return `Nortia ${hourStr}:00`;
}

function getThemeFileName(hour: number): string {
  const hourStr = hour.toString().padStart(2, '0');
  return `nortia-${hourStr}.json`;
}

function generateTheme(hour: number) {
  const config = { hour };
  const themeData = generateThemeColors(config);

  return {
    name: getThemeName(hour),
    type: themeData.isDark ? 'dark' : 'light',
    colors: themeData.colors,
    tokenColors: themeData.tokenColors,
  };
}

function main() {
  const themesDir = path.join(__dirname, '..', 'themes');

  // Ensure themes directory exists
  if (!fs.existsSync(themesDir)) {
    fs.mkdirSync(themesDir, { recursive: true });
  }

  // Generate all 24 themes
  for (let hour = 0; hour < 24; hour++) {
    const theme = generateTheme(hour);
    const fileName = getThemeFileName(hour);
    const filePath = path.join(themesDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(theme, null, 2));
    console.log(`Generated: ${fileName} (${theme.type})`);
  }

  console.log('\nAll 24 themes generated successfully!');
}

main();
