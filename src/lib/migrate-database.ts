import fs from 'fs'
import path from 'path'
import os from 'os'

/**
 * Migrate existing env-data.json files from project directories to secure home directory
 */
export function migrateDatabase(projectPath: string): boolean {
  const oldDbPath = path.join(projectPath, 'env-data.json')
  
  // Check if old database exists
  if (!fs.existsSync(oldDbPath)) {
    return false // No migration needed
  }
  
  // Get new secure location
  const projectName = path.basename(projectPath)
  const dataDir = path.join(os.homedir(), '.env-manager-data')
  const newDbPath = path.join(dataDir, `${projectName}.db`)
  
  // Ensure secure directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 })
  }
  
  // Check if new database already exists
  if (fs.existsSync(newDbPath)) {
    console.warn(`⚠️  Database already exists at ${newDbPath}`)
    console.warn(`   Old database at ${oldDbPath} will be backed up`)
    
    // Create backup of old database
    const backupPath = `${oldDbPath}.backup-${Date.now()}`
    fs.renameSync(oldDbPath, backupPath)
    console.log(`✅ Old database backed up to ${backupPath}`)
    console.log(`   You can manually delete it after verifying your data is intact`)
    
    return true
  }
  
  try {
    // Read old database
    const oldData = fs.readFileSync(oldDbPath, 'utf-8')
    
    // Write to new secure location
    fs.writeFileSync(newDbPath, oldData, { mode: 0o600 }) // Secure file permissions
    
    // Rename old file to backup
    const backupPath = `${oldDbPath}.migrated-${Date.now()}`
    fs.renameSync(oldDbPath, backupPath)
    
    console.log('✅ Database migrated successfully!')
    console.log(`   From: ${oldDbPath}`)
    console.log(`   To: ${newDbPath}`)
    console.log(`   Backup: ${backupPath}`)
    console.log('   You can delete the backup file after verifying everything works')
    
    return true
  } catch (error) {
    console.error('❌ Failed to migrate database:', error)
    return false
  }
}

/**
 * Clean up old env-data.json files from project directories
 */
export function cleanupOldDatabases(projectPath: string): void {
  const patterns = [
    'env-data.json',
    'env-data.json.backup-*',
    'env-data.json.migrated-*'
  ]
  
  for (const pattern of patterns) {
    const files = fs.readdirSync(projectPath).filter(f => 
      f === pattern || f.startsWith(pattern.replace('*', ''))
    )
    
    for (const file of files) {
      const filePath = path.join(projectPath, file)
      console.log(`🗑️  Found old database file: ${file}`)
      
      // Don't auto-delete, let user decide
      console.log(`   Run 'rm ${filePath}' to delete it`)
    }
  }
}

/**
 * Check if project needs migration
 */
export function needsMigration(projectPath: string): boolean {
  const oldDbPath = path.join(projectPath, 'env-data.json')
  return fs.existsSync(oldDbPath)
}