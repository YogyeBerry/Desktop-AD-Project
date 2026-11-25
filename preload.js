const { contextBridge, shell, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  openExternal: (url) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:'))) {
      shell.openExternal(url);
    }
  },
  enterFocusMode: (options = {}) => ipcRenderer.invoke('focus-mode:enter', options),
  exitFocusMode: () => ipcRenderer.invoke('focus-mode:exit'),
  onFocusModeStatusChanged: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('focus-mode:status-changed', handler);
    return () => ipcRenderer.removeListener('focus-mode:status-changed', handler);
  },
});
