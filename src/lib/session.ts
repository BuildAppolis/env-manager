import EnvDatabase from './database.js';

// Store database instances per project path
const databaseInstances = new Map<string, EnvDatabase>();

export function getDatabase(projectPath?: string): EnvDatabase {
  const key = projectPath || 'default';
  
  if (!databaseInstances.has(key)) {
    // Create database with specific project path
    const dbPath = projectPath ? `${projectPath}/env-data.json` : undefined;
    const db = new EnvDatabase(dbPath);
    
    // Set PROJECT_ROOT for this database instance
    if (projectPath) {
      process.env.PROJECT_ROOT = projectPath;
    }
    
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
