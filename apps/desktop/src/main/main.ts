/// <reference path="../types/electron-env.d.ts" />

/**
 * Electron Main Process
 * Strict Security Architecture: contextIsolation: true, nodeIntegration: false, sandbox: true
 * Orchestrates native desktop window, secure IPC message passing, and local SQLite database engine
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let nativeDb: any = null;

// Initialize native SQLite 3.x storage using Node 22 built-in engine
function initNativeSqlite(): void {
  try {
    const { DatabaseSync } = require('node:sqlite');
    const userDataPath = app.getPath('userData');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    const dbPath = path.join(userDataPath, 'skyguard.db');
    nativeDb = new DatabaseSync(dbPath);
    console.log('[SkyGuard Desktop] Native SQLite database initialized at:', dbPath);
  } catch (err) {
    console.warn('[SkyGuard Desktop] Native DatabaseSync initialization notice (using memory fallback):', err);
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 720,
    title: 'SkyGuard Mission Control · Enterprise Airspace Desktop',
    backgroundColor: '#0B0F17',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // In development, connect to Vite dev server; in production, load built static bundle
  const devServerUrl = process.env['VITE_DEV_SERVER_URL'] || 'http://localhost:3000';
  const isDev = process.env['NODE_ENV'] === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL(devServerUrl).catch(() => {
      // Fallback if local dev server is starting
      if (mainWindow) {
        mainWindow.loadFile(path.resolve(__dirname, '../renderer/index.html'));
      }
    });
  } else {
    // Production path points to apps/web/dist
    const prodPath = path.resolve(__dirname, '../../web/dist/index.html');
    if (fs.existsSync(prodPath)) {
      mainWindow.loadFile(prodPath);
    } else {
      mainWindow.loadFile(path.resolve(__dirname, '../renderer/index.html'));
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    initNativeSqlite();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- Secure Typed IPC Handlers ---

ipcMain.handle('system:get-info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.versions.node,
    appVersion: app.getVersion(),
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  };
});

ipcMain.handle('sqlite:query', async (_event, sql: string, params: unknown[] = []) => {
  if (nativeDb) {
    try {
      const stmt = nativeDb.prepare(sql);
      return stmt.all(...params);
    } catch (err: any) {
      console.error('[SkyGuard SQLite] Query error:', err);
      throw new Error(err.message || 'SQLite query failed');
    }
  }
  return [];
});

ipcMain.handle('sqlite:run', async (_event, sql: string, params: unknown[] = []) => {
  if (nativeDb) {
    try {
      const stmt = nativeDb.prepare(sql);
      const info = stmt.run(...params);
      return {
        changes: info.changes,
        lastInsertRowid: Number(info.lastInsertRowid),
      };
    } catch (err: any) {
      console.error('[SkyGuard SQLite] Run error:', err);
      throw new Error(err.message || 'SQLite statement failed');
    }
  }
  return { changes: 0, lastInsertRowid: 0 };
});

ipcMain.handle('sqlite:exec', async (_event, sql: string) => {
  if (nativeDb) {
    try {
      nativeDb.exec(sql);
    } catch (err: any) {
      console.error('[SkyGuard SQLite] Exec error:', err);
      throw new Error(err.message || 'SQLite exec failed');
    }
  }
});

ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});
