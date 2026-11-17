const { app, BrowserWindow, ipcMain, dialog, clipboard, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 760,
    minWidth: 720,
    minHeight: 600,
    title: 'aria2 启动器',
    autoHideMenuBar: true,
    backgroundColor: '#f4f5f8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-bundled-exe', () => {
  const name = process.platform === 'win32' ? 'aria2c.exe' : 'aria2c';
  const candidates = [
    path.join(process.resourcesPath || '', 'app.asar.unpacked', 'bin', name),
    path.join(__dirname, 'bin', name),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return '';
});

ipcMain.handle('select-exe', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择 aria2 可执行文件',
    properties: ['openFile'],
    filters: [
      { name: 'aria2 可执行文件', extensions: ['exe'] },
      { name: '所有文件', extensions: ['*'] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('copy-command', async (_event, text) => {
  clipboard.writeText(String(text));
  return true;
});

ipcMain.handle('run-in-terminal', async (_event, command) => {
  return launchInTerminal(String(command));
});

function launchInTerminal(command) {
  const platform = process.platform;
  try {
    if (platform === 'win32') {
      const encoded = Buffer.from(command, 'utf16le').toString('base64');
      const child = spawn(
        'powershell.exe',
        ['-NoExit', '-EncodedCommand', encoded],
        { detached: true, shell: false, windowsHide: false, stdio: 'ignore' }
      );
      child.on('error', () => {});
      child.unref();
      return { ok: true };
    }

    if (platform === 'darwin') {
      const script = command.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const child = spawn('osascript', ['-e', `tell application "Terminal" to do script "${script}"`], {
        detached: true,
        shell: false,
        stdio: 'ignore',
      });
      child.on('error', () => {});
      child.unref();
      return { ok: true };
    }

    const candidates = [
      ['gnome-terminal', ['--', 'bash', '-lc', `${command}; exec bash`]],
      ['konsole', ['-e', 'bash', '-lc', `${command}; exec bash`]],
      ['xfce4-terminal', ['-e', `bash -lc '${command.replace(/'/g, "'\\''")}; exec bash'`]],
      ['xterm', ['-e', 'bash', '-lc', `${command}; exec bash`]],
    ];
    for (const [bin, args] of candidates) {
      let started = false;
      const child = spawn(bin, args, { detached: true, shell: false, stdio: 'ignore' });
      child.on('spawn', () => { started = true; });
      child.on('error', () => {});
      child.unref();
      if (started) return { ok: true };
    }
    return { ok: false, error: '未找到可用的终端模拟器' };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}
