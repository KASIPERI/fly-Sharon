/**
 * Ambient type definitions for Node.js & Electron runtime environment
 */

// Node.js Globals
declare const __dirname: string;
declare const __filename: string;
declare const require: {
  (id: string): any;
  resolve(id: string): string;
};

declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
};

declare const process: {
  platform: 'darwin' | 'win32' | 'linux' | 'freebsd' | 'openbsd' | 'sunos' | 'aix';
  arch: string;
  versions: {
    node: string;
    chrome?: string;
    electron?: string;
    [key: string]: string | undefined;
  };
  env: Record<string, string | undefined>;
  memoryUsage(): {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
    arrayBuffers: number;
  };
};

// Node Core Module: 'path' & 'node:path'
declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(p: string): string;
  export function basename(p: string, ext?: string): string;
  export function extname(p: string): string;
  const path: {
    join(...paths: string[]): string;
    resolve(...paths: string[]): string;
    dirname(p: string): string;
    basename(p: string, ext?: string): string;
    extname(p: string): string;
  };
  export default path;
}

declare module 'node:path' {
  export * from 'path';
  import path from 'path';
  export default path;
}

// Node Core Module: 'fs' & 'node:fs'
declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): string | undefined;
  export function readFileSync(path: string, options?: { encoding?: string; flag?: string } | string): any;
  export function writeFileSync(path: string, data: string | Uint8Array, options?: { encoding?: string; flag?: string } | string): void;
  const fs: {
    existsSync(path: string): boolean;
    mkdirSync(path: string, options?: { recursive?: boolean }): string | undefined;
    readFileSync(path: string, options?: { encoding?: string; flag?: string } | string): any;
    writeFileSync(path: string, data: string | Uint8Array, options?: { encoding?: string; flag?: string } | string): void;
  };
  export default fs;
}

declare module 'node:fs' {
  export * from 'fs';
  import fs from 'fs';
  export default fs;
}

// Node Core Module: 'node:sqlite'
declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean });
    exec(sql: string): void;
    prepare(sql: string): {
      all(...params: any[]): any[];
      get(...params: any[]): any;
      run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
    };
    close(): void;
  }
}

// Electron Module
declare module 'electron' {
  export const app: {
    getPath(name: string): string;
    getVersion(): string;
    isPackaged: boolean;
    quit(): void;
    requestSingleInstanceLock(): boolean;
    whenReady(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): void;
  };

  export class BrowserWindow {
    constructor(options: {
      width?: number;
      height?: number;
      minWidth?: number;
      minHeight?: number;
      title?: string;
      backgroundColor?: string;
      titleBarStyle?: 'default' | 'hidden' | 'hiddenInset' | 'customButtonsOnHover';
      webPreferences?: {
        preload?: string;
        nodeIntegration?: boolean;
        contextIsolation?: boolean;
        sandbox?: boolean;
        webSecurity?: boolean;
      };
    });

    loadURL(url: string): Promise<void>;
    loadFile(filePath: string): Promise<void>;
    minimize(): void;
    isMinimized(): boolean;
    restore(): void;
    maximize(): void;
    unmaximize(): void;
    isMaximized(): boolean;
    focus(): void;
    close(): void;
    on(event: string, listener: (...args: any[]) => void): void;
    static getAllWindows(): BrowserWindow[];
  }

  export const ipcMain: {
    handle(channel: string, listener: (event: any, ...args: any[]) => Promise<any> | any): void;
    on(channel: string, listener: (event: any, ...args: any[]) => void): void;
  };

  export const contextBridge: {
    exposeInMainWorld(apiKey: string, api: any): void;
  };

  export const ipcRenderer: {
    invoke(channel: string, ...args: any[]): Promise<any>;
    on(channel: string, listener: (event: any, ...args: any[]) => void): void;
    send(channel: string, ...args: any[]): void;
  };
}
