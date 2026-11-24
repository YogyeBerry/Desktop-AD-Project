const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let serverInstance = null;

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
}

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
