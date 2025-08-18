import EnvDatabase from './database.js';

// Singleton database instance to share across API routes
let globalDb: EnvDatabase | null = null;

export function getDatabase(): EnvDatabase {
  if (!globalDb) {
    globalDb = new EnvDatabase();
  }
  return globalDb;
}

export function resetDatabase(): void {
  globalDb = null;
}
