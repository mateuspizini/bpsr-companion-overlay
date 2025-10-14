import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  saveFile: (p: {name:string;ext:string;data:string}) => ipcRenderer.invoke('file:save', p),
  toggleClick: () => ipcRenderer.invoke('overlay:toggle-clickthrough'),
  autoLog: (p: {name:string; data:string}) => ipcRenderer.invoke('file:autoLog', p),
  onHotkey: (ch: (type: string)=>void) => {
    ipcRenderer.on('hotkey:start-stop', () => ch('start-stop'));
    ipcRenderer.on('hotkey:reset', () => ch('reset'));
    ipcRenderer.on('hotkey:toggle-clickthrough', () => ch('toggle-click'));
    ipcRenderer.on('hotkey:compact-toggle', () => ch('compact'));
  }
});
