/**
 * Nortia VSCode Extension
 * Automatically switches theme based on time of day with manual override support
 */

import * as vscode from 'vscode';

let autoSwitchInterval: NodeJS.Timeout | undefined;
let statusBarItem: vscode.StatusBarItem;

function getThemeName(hour: number): string {
  const hourStr = hour.toString().padStart(2, '0');
  return `Nortia ${hourStr}:00`;
}

function getCurrentHour(): number {
  return new Date().getHours();
}

function getEffectiveHour(): number {
  const config = vscode.workspace.getConfiguration('nortia');
  const overrideHour = config.get<number>('overrideHour', -1);

  if (overrideHour >= 0 && overrideHour <= 23) {
    return overrideHour;
  }

  return getCurrentHour();
}

async function switchToTheme(hour: number) {
  const themeName = getThemeName(hour);
  const config = vscode.workspace.getConfiguration('workbench');
  const currentTheme = config.get<string>('colorTheme');

  if (currentTheme !== themeName) {
    await config.update('colorTheme', themeName, vscode.ConfigurationTarget.Global);
    console.log(`Nortia: Switched to ${themeName}`);
  }
}

function updateStatusBar() {
  const config = vscode.workspace.getConfiguration('nortia');
  const autoSwitch = config.get<boolean>('autoSwitch', true);
  const overrideHour = config.get<number>('overrideHour', -1);
  const effectiveHour = getEffectiveHour();

  if (overrideHour >= 0) {
    statusBarItem.text = `$(clock) Nortia: ${effectiveHour.toString().padStart(2, '0')}:00 (locked)`;
    statusBarItem.tooltip = 'Nortia theme locked to specific hour. Click to manage.';
  } else if (autoSwitch) {
    statusBarItem.text = `$(clock) Nortia: ${effectiveHour.toString().padStart(2, '0')}:00 (auto)`;
    statusBarItem.tooltip = 'Nortia theme auto-switching enabled. Click to manage.';
  } else {
    statusBarItem.text = `$(clock) Nortia: Manual`;
    statusBarItem.tooltip = 'Nortia theme auto-switching disabled. Click to manage.';
  }

  statusBarItem.show();
}

async function checkAndSwitch() {
  const config = vscode.workspace.getConfiguration('nortia');
  const autoSwitch = config.get<boolean>('autoSwitch', true);

  if (!autoSwitch) {
    return;
  }

  const hour = getEffectiveHour();
  await switchToTheme(hour);
  updateStatusBar();
}

function startAutoSwitch(context: vscode.ExtensionContext) {
  // Clear any existing interval
  if (autoSwitchInterval) {
    clearInterval(autoSwitchInterval);
  }

  // Initial switch
  checkAndSwitch();

  // Check every minute
  autoSwitchInterval = setInterval(() => {
    checkAndSwitch();
  }, 60 * 1000);

  context.subscriptions.push({
    dispose: () => {
      if (autoSwitchInterval) {
        clearInterval(autoSwitchInterval);
      }
    }
  });
}

async function setHourCommand() {
  const hourOptions: vscode.QuickPickItem[] = [];

  // Add "Auto (Current Time)" option
  hourOptions.push({
    label: '$(sync) Auto (Current Time)',
    description: `Currently ${getCurrentHour().toString().padStart(2, '0')}:00`,
    detail: 'Automatically switch theme based on system time'
  });

  // Add separator
  hourOptions.push({
    label: '',
    kind: vscode.QuickPickItemKind.Separator
  } as vscode.QuickPickItem);

  // Add all 24 hours
  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    const isDark = hour < 8 || hour >= 16;
    const icon = isDark ? '$(moon)' : '$(sun)';
    hourOptions.push({
      label: `${icon} ${hourStr}:00`,
      description: isDark ? 'Dark theme' : 'Light theme',
      detail: `Lock theme to ${hourStr}:00`
    });
  }

  const selected = await vscode.window.showQuickPick(hourOptions, {
    placeHolder: 'Select hour for Nortia theme',
    matchOnDescription: true,
    matchOnDetail: true
  });

  if (!selected) {
    return;
  }

  const config = vscode.workspace.getConfiguration('nortia');

  if (selected.label.includes('Auto')) {
    // Set to auto
    await config.update('overrideHour', -1, vscode.ConfigurationTarget.Global);
    await config.update('autoSwitch', true, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage('Nortia: Auto-switching enabled based on current time');
  } else {
    // Extract hour from label (format: "$(icon) HH:00")
    const hourMatch = selected.label.match(/(\d{2}):/);
    if (hourMatch) {
      const hour = parseInt(hourMatch[1], 10);
      await config.update('overrideHour', hour, vscode.ConfigurationTarget.Global);
      await config.update('autoSwitch', true, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`Nortia: Locked to ${hourMatch[1]}:00`);
    }
  }

  await checkAndSwitch();
}

async function resetHourCommand() {
  const config = vscode.workspace.getConfiguration('nortia');
  await config.update('overrideHour', -1, vscode.ConfigurationTarget.Global);
  await config.update('autoSwitch', true, vscode.ConfigurationTarget.Global);
  await checkAndSwitch();
  vscode.window.showInformationMessage('Nortia: Reset to automatic based on current time');
}

async function enableAutoSwitchCommand() {
  const config = vscode.workspace.getConfiguration('nortia');
  await config.update('autoSwitch', true, vscode.ConfigurationTarget.Global);
  await checkAndSwitch();
  vscode.window.showInformationMessage('Nortia: Automatic switching enabled');
}

async function disableAutoSwitchCommand() {
  const config = vscode.workspace.getConfiguration('nortia');
  await config.update('autoSwitch', false, vscode.ConfigurationTarget.Global);
  updateStatusBar();
  vscode.window.showInformationMessage('Nortia: Automatic switching disabled');
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Nortia theme extension is now active');

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'nortia.setHour';
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('nortia.setHour', setHourCommand)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('nortia.resetHour', resetHourCommand)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('nortia.enableAutoSwitch', enableAutoSwitchCommand)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('nortia.disableAutoSwitch', disableAutoSwitchCommand)
  );

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('nortia')) {
        checkAndSwitch();
      }
    })
  );

  // Start auto-switching
  startAutoSwitch(context);

  // Update status bar
  updateStatusBar();
}

export function deactivate() {
  if (autoSwitchInterval) {
    clearInterval(autoSwitchInterval);
  }
}
