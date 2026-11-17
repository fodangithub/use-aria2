const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('launcher', {
  platform: process.platform,
  getBundledExe: () => ipcRenderer.invoke('get-bundled-exe'),
  selectExe: () => ipcRenderer.invoke('select-exe'),
  copyCommand: (text) => ipcRenderer.invoke('copy-command', text),
  runInTerminal: (command) => ipcRenderer.invoke('run-in-terminal', command),
});
