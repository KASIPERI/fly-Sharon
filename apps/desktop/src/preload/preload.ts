/// <reference path="../types/electron-env.d.ts" />

/**
 * Secure Electron Preload Context Bridge
 * Exposes strictly typed system & SQLite APIs to the renderer without nodeIntegration
 */

import { contextBridge, ipcRenderer } from 'electron';

export interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion?: string;
  appVersion?: string;
  memoryUsageMb?: number;
}

export interface IElectronAPI {
  getSystemInfo: () => Promise<SystemInfo>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  sqliteQuery: <T = unknown>(sql: string, params?: unknown[]) => Promise<T[]>;
  sqliteRun: (sql: string, params?: unknown[]) => Promise<{ changes: number; lastInsertRowid: number }>;
  sqliteExec: (sql: string) => Promise<void>;
}

const electronAPI: IElectronAPI = {
  getSystemInfo: () => ipcRenderer.invoke('system:get-info'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  sqliteQuery: (sql: string, params: unknown[] = []) => ipcRenderer.invoke('sqlite:query', sql, params),
  sqliteRun: (sql: string, params: unknown[] = []) => ipcRenderer.invoke('sqlite:run', sql, params),
  sqliteExec: (sql: string) => ipcRenderer.invoke('sqlite:exec', sql),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
}
