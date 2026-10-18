import { SkyguardRepository } from './repository';
import { BrowserSqliteDriver } from './sqlite-browser';
import { IDatabaseDriver } from '../types';

export * from './schema';
export * from './repository';
export * from './sqlite-browser';

let defaultRepo: SkyguardRepository | null = null;

export function getSkyguardDb(customDriver?: IDatabaseDriver): SkyguardRepository {
  if (customDriver) {
    return new SkyguardRepository(customDriver);
  }
  if (!defaultRepo) {
    defaultRepo = new SkyguardRepository(new BrowserSqliteDriver());
  }
  return defaultRepo;
}
