const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let serverInstance = null;
let savedWindowState = null;

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

// Ensure writable database path for production vs dev
function setupDatabasePath() {
  if (!isDev) {
    try {
      const userDataDir = app.getPath('userData');
      const dbDir = path.join(userDataDir, 'database');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const targetDbPath = path.join(dbDir, 'skillpath.db');
      if (!fs.existsSync(targetDbPath)) {
        const seedPath1 = path.join(__dirname, 'backend', 'prisma', 'dev.db');
        const seedPath2 = path.join(__dirname, 'backend', 'dev.db');
        const sourceSeedDb = fs.existsSync(seedPath1) ? seedPath1 : seedPath2;
        if (fs.existsSync(sourceSeedDb)) {
          fs.copyFileSync(sourceSeedDb, targetDbPath);
          console.log(`[Electron] Initialized database from seed at: ${targetDbPath}`);
        }
      }

      process.env.DATABASE_URL = `file:${targetDbPath}`;
      console.log(`[Electron] Using production database at: ${targetDbPath}`);
    } catch (err) {
      console.error('[Electron] Error initializing writable database path:', err);
    }
  }
}

// Start backend Express server managed by Electron lifecycle
function startBackendServer() {
  return new Promise((resolve, reject) => {
    try {
      setupDatabasePath();
      const expressApp = require('./backend/server');
      const PORT = process.env.PORT || 5001;

      serverInstance = expressApp.listen(PORT, '127.0.0.1', () => {
        console.log(`[Electron] Express backend listening on http://127.0.0.1:${PORT}`);
        resolve(PORT);
      });

      serverInstance.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[Electron] Port ${PORT} in use, backend may already be running.`);
          resolve(PORT);
        } else {
          console.error('[Electron] Backend startup error:', err);
          reject(err);
        }
      });
    } catch (err) {
      console.error('[Electron] Failed to start backend server:', err);
      reject(err);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: 'SkillPath — Personal Learning Path & Analytics Dashboard',
    backgroundColor: '#0b1120',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  const devServerUrl = 'http://localhost:5173';
  const prodFilePath = path.join(__dirname, 'frontend', 'dist', 'index.html');

  if (isDev) {
    // In development: try Vite dev server first, fall back to dist/index.html
    mainWindow.loadURL(devServerUrl).catch(() => {
      console.log('[Electron] Vite dev server not detected, loading production build...');
      if (fs.existsSync(prodFilePath)) {
        mainWindow.loadFile(prodFilePath);
      } else {
        console.error('[Electron] Production build not found at:', prodFilePath);
      }
    });
  } else {
    mainWindow.loadFile(prodFilePath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle user exiting fullscreen natively (e.g. macOS green button or Escape)
  mainWindow.on('leave-full-screen', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('focus-mode:status-changed', { isFocusMode: false });
    }
  });
}

// IPC Handlers for Fullscreen / Focus Mode
ipcMain.handle('focus-mode:enter', async (_event, options = {}) => {
  if (!mainWindow || mainWindow.isDestroyed()) return { success: false, error: 'No active window' };

  try {
    // Preserve window state before entering focus/kiosk
    savedWindowState = {
      isFullScreen: mainWindow.isFullScreen(),
      isKiosk: mainWindow.isKiosk(),
      bounds: mainWindow.getBounds(),
    };

    // If requested, set kiosk mode (especially on Windows/Linux; on macOS fullscreen is standard)
    if (options.useKiosk) {
      mainWindow.setKiosk(true);
    } else {
      mainWindow.setFullScreen(true);
    }

    return { success: true, isFullScreen: true, isKiosk: mainWindow.isKiosk() };
  } catch (err) {
    console.error('[Electron] Error entering focus mode:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('focus-mode:exit', async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return { success: false, error: 'No active window' };

  try {
    // Disable kiosk mode first if enabled
    if (mainWindow.isKiosk()) {
      mainWindow.setKiosk(false);
    }

    // Exit fullscreen if active
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }

    // Restore previous bounds if saved and not maximized
    if (savedWindowState && savedWindowState.bounds) {
      mainWindow.setBounds(savedWindowState.bounds);
    }
    savedWindowState = null;

    // Notify renderer that focus mode exited
    mainWindow.webContents.send('focus-mode:status-changed', { isFocusMode: false });

    return { success: true };
  } catch (err) {
    console.error('[Electron] Error exiting focus mode:', err);
    return { success: false, error: err.message };
  }
});

app.whenReady().then(async () => {
  try {
    await startBackendServer();
  } catch (e) {
    console.error('[Electron] Proceeding despite backend error:', e);
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  if (serverInstance) {
    console.log('[Electron] Stopping backend Express server...');
    serverInstance.close();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
