import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import Store from 'electron-store';

let win: BrowserWindow;
const store = new Store<{ theme: 'dark'|'light'; locale: string; clickThrough: boolean }>();
if (!store.has('theme')) store.set('theme', 'dark');
if (!store.has('locale')) store.set('locale', 'pt-BR');
if (!store.has('clickThrough')) store.set('clickThrough', true);

function createWindow() {
  win = new BrowserWindow({
    width: 460,
    height: 260,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true);
  applyClickThrough(store.get('clickThrough'));

  if (process.env.VITE_DEV_SERVER_URL)
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  else
    win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function applyClickThrough(on: boolean) {
  win.setIgnoreMouseEvents(on, { forward: true });
}

app.whenReady().then(() => {
  createWindow();
  globalShortcut.register('Control+Alt+S', () => win.webContents.send('hotkey:start-stop'));
  globalShortcut.register('Control+Alt+R', () => win.webContents.send('hotkey:reset'));
  globalShortcut.register('Control+Alt+T', () => win.webContents.send('hotkey:toggle-clickthrough'));
  globalShortcut.register('Control+Alt+C', () => win.webContents.send('hotkey:compact-toggle'));
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('file:save', async (_e, { name, ext, data }) => {
  const p = await dialog.showSaveDialog({ defaultPath: name, filters: [{ name: ext.toUpperCase(), extensions: [ext] }] });
  if (!p.canceled && p.filePath) fs.writeFileSync(p.filePath, data);
  return p.filePath ?? null;
});

ipcMain.handle('file:autoLog', async (_e, { name, data }) => {
  const dir = path.join(app.getPath('userData'), 'logs');
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, name);
  fs.writeFileSync(f, data);
  return f;
});

ipcMain.handle('overlay:toggle-clickthrough', () => {
  const next = !store.get('clickThrough');
  store.set('clickThrough', next);
  applyClickThrough(next);
  return next;
});
