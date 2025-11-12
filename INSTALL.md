# Installation Guide for Nortia VSCode Extension

## Quick Install (Local Development)

1. **Navigate to the extension directory:**
   ```bash
   cd nortia-vscode
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile the extension:**
   ```bash
   npm run compile
   ```

4. **Install in VSCode:**

   **Option A: Using VSCode's Extension Development Host (Recommended for testing)**
   - Open the `nortia-vscode` folder in VSCode
   - Press `F5` to launch a new VSCode window with the extension loaded
   - The extension will be active in this new window

   **Option B: Install in your main VSCode**
   - Copy the entire `nortia-vscode` folder to your VSCode extensions directory:
     - **macOS/Linux:** `~/.vscode/extensions/nortia-vscode`
     - **Windows:** `%USERPROFILE%\.vscode\extensions\nortia-vscode`
   - Restart VSCode
   - The extension should now be active

## Activating the Theme

1. Open Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type "Color Theme" and select "Preferences: Color Theme"
3. Choose any "Nortia" theme (e.g., "Nortia 12:00")
4. The extension will automatically switch themes based on the current hour

## Verifying Installation

After installation, you should see:
- A clock icon in the status bar (bottom right) showing the current Nortia hour
- The ability to click the status bar item to change hours
- Access to Nortia commands in the Command Palette

## Packaging for Distribution (Optional)

To create a `.vsix` file for sharing or publishing:

1. **Install vsce (VSCode Extension Manager):**
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Package the extension:**
   ```bash
   cd nortia-vscode
   vsce package
   ```

3. **Install the .vsix file:**
   - In VSCode, go to Extensions view (`Cmd+Shift+X` / `Ctrl+Shift+X`)
   - Click the "..." menu at the top
   - Select "Install from VSIX..."
   - Choose the generated `nortia-vscode-0.1.0.vsix` file

## Troubleshooting

### Extension not showing up
- Make sure you've restarted VSCode after copying to extensions folder
- Check VSCode's Output panel (View → Output) and select "Extension Host" to see any errors

### Themes not switching automatically
- Check that `nortia.autoSwitch` is enabled in settings
- Look for the Nortia status bar item to verify the extension is running
- Check the VSCode developer console (`Help → Toggle Developer Tools`)

### Colors look wrong
- Regenerate themes with: `npm run generate-themes`
- Recompile with: `npm run compile`
- Reload VSCode

## Configuration

Add these to your VSCode `settings.json`:

```json
{
  // Enable automatic theme switching (default: true)
  "nortia.autoSwitch": true,

  // Lock to specific hour, or -1 for auto (default: -1)
  "nortia.overrideHour": -1
}
```

## Using with Different Base Colors

To customize the base color (requires modifying source):

1. Edit `src/theme.ts`
2. Change the `defaultBase` value (RGB 0-255):
   ```typescript
   const defaultBase = { r: 255, g: 189, b: 60 }; // Original gold
   // Try: { r: 235, g: 84, b: 84 } for red base
   ```
3. Regenerate and recompile:
   ```bash
   npm run generate-themes
   npm run compile
   ```
4. Reload VSCode

## Next Steps

- Read the [README.md](README.md) for usage instructions
- Try different hours using the Command Palette
- Experiment with locking to specific times for different lighting conditions
