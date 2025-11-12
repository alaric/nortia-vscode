# Nortia Theme for VSCode

A temporal color scheme for VSCode that changes throughout the day, ported from [nortia.nvim](https://github.com/alaric/nortia.nvim).

## Features

- **24 Theme Variants**: One theme for each hour of the day (00:00 - 23:00)
- **Automatic Switching**: Automatically changes theme based on your system time
- **Manual Override**: Lock the theme to any specific hour for testing or preference
- **Oklab Color Space**: Uses perceptually uniform Oklab color space for consistent, pleasing colors
- **Light & Dark**: Automatically switches between light themes (8am-3pm) and dark themes (4pm-7am)

## Preview

The theme transitions smoothly from dark at night to light during the day:
- **Night (00:00-07:00)**: Dark theme with low contrast
- **Day (08:00-15:00)**: Light theme with adjustable contrast
- **Evening (16:00-23:00)**: Dark theme

Each hour has slightly different lightness values to create smooth transitions throughout the day.

## Installation

### From Source

1. Clone this repository or copy the `nortia-vscode` folder
2. Install dependencies:
   ```bash
   cd nortia-vscode
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

4. Install the extension in VSCode:
   - Press `F5` to open a new VSCode window with the extension loaded, or
   - Copy the entire folder to `~/.vscode/extensions/` (or `%USERPROFILE%\.vscode\extensions\` on Windows)
   - Reload VSCode

## Usage

### Automatic Mode (Default)

By default, Nortia automatically switches to the theme matching your current hour. The extension checks every minute and updates the theme if the hour has changed.

You'll see a status bar item showing the current hour: `$(clock) Nortia: 14:00 (auto)`

### Manual Hour Override

To lock the theme to a specific hour (useful for testing or if you prefer a certain time's appearance):

1. Click the Nortia status bar item, or
2. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run:
   - `Nortia: Set Hour Override`

Select any hour (00:00 - 23:00) to lock the theme, or choose "Auto (Current Time)" to return to automatic switching.

The status bar will show: `$(clock) Nortia: 14:00 (locked)` when an override is active.

### Commands

- **Nortia: Set Hour Override** - Choose a specific hour or return to auto mode
- **Nortia: Reset to Auto (Current Time)** - Reset to automatic time-based switching
- **Nortia: Enable Automatic Hour Switching** - Enable auto-switching
- **Nortia: Disable Automatic Hour Switching** - Disable auto-switching (keep current theme)

### Configuration

You can also configure Nortia through VSCode settings:

```json
{
  // Enable/disable automatic theme switching
  "nortia.autoSwitch": true,

  // Override hour (-1 for automatic, 0-23 for specific hour)
  "nortia.overrideHour": -1
}
```

## Examples

### Use daytime theme at night

If you're working late at night but prefer the light theme:

1. Click the Nortia status bar item
2. Select `$(sun) 12:00` (or any daytime hour 08:00-15:00)
3. The theme will stay locked to that hour until you reset it

### Testing themes

To preview what the theme looks like at different times:

1. Run `Nortia: Set Hour Override`
2. Select different hours to see how the theme changes
3. Select "Auto (Current Time)" when done

## Color Philosophy

Nortia uses the [Oklab color space](https://bottosson.github.io/posts/oklab/) to generate perceptually uniform colors. This means:

- Colors have equal perceived brightness across different hues
- Smooth transitions between light and dark modes
- Complementary colors that work well together
- Automatic contrast adjustment to ensure readability

The theme generates 6 primary palette colors by rotating through the hue spectrum, ensuring they complement each other while maintaining consistent luminance.

## Development

### Regenerating Themes

If you modify the color generation logic in `src/theme.ts` or `src/oklab.ts`:

```bash
npm run generate-themes
```

This will regenerate all 24 theme JSON files in the `themes/` directory.

### Building

```bash
npm run compile
```

### Project Structure

```
nortia-vscode/
├── src/
│   ├── extension.ts        # Main extension logic
│   ├── theme.ts            # Theme generation
│   ├── oklab.ts            # Oklab color space implementation
│   └── generate-themes.ts  # Script to generate theme files
├── themes/                 # Generated theme JSON files (24 files)
├── out/                    # Compiled JavaScript
├── package.json            # Extension manifest
└── tsconfig.json           # TypeScript configuration
```

## Credits

- Original Neovim theme: [nortia.nvim](https://github.com/alaric/nortia.nvim) by Alaric Nightingale
- Color space: [Oklab](https://bottosson.github.io/posts/oklab/) by Björn Ottosson
- VSCode port: Ported from the original Lua implementation

## License

MIT License - Same as the original nortia.nvim

Copyright (C) 2020 Alaric Nightingale
