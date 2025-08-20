import EnvDatabase from './database.js';

// Store database instances per project path
const databaseInstances = new Map<string, EnvDatabase>();

export function getDatabase(projectPath?: string): EnvDatabase {
  const key = projectPath || 'default';
  
  if (!databaseInstances.has(key)) {
    // Set PROJECT_ROOT for this database instance
    if (projectPath) {
      process.env.PROJECT_ROOT = projectPath;
    }
    
    // Create database - it will automatically use secure home directory location
    // We don't pass a dbPath anymore - let the Database class handle secure storage
    const db = new EnvDatabase();
    
    databaseInstances.set(key, db);
  }
  
  return databaseInstances.get(key)!;
}

export function resetDatabase(projectPath?: string): void {
  if (projectPath) {
    databaseInstances.delete(projectPath);
  } else {
    databaseInstances.clear();
  }
}
