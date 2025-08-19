import fs from 'fs'
import path from 'path'
import { GitUtils } from './git-utils.js'

export interface ConfigMigration {
  version: string
  description: string
  migrate: (config: any) => any
}

export class ConfigMigrator {
  private migrations: ConfigMigration[] = [
    {
      version: '1.0.0',
      description: 'Initial config structure',
      migrate: (config) => config
    },
    {
      version: '1.1.0',
      description: 'Add branch-specific configuration',
      migrate: (config) => {
        // Add branch configuration if not present
        if (!config.branches) {
          config.branches = {
            enabled: true,
            strategy: 'inherit', // 'inherit' | 'isolate' | 'merge'
            main: 'main',
            environments: {
              development: ['dev', 'develop', 'feature/*'],
              staging: ['staging', 'release/*'],
              production: ['main', 'master', 'prod']
            }
          }
        }
        
        // Add version if not present
        if (!config.version) {
          config.version = '1.1.0'
        }
        
        return config
      }
    },
    {
      version: '1.2.0',
      description: 'Add deployment configuration',
      migrate: (config) => {
        if (!config.deployment) {
          config.deployment = {
            autoExport: false,
            exportOnCommit: false,
            branchSpecific: true,
            environments: {}
          }
        }
        return config
      }
    }
  ]

  async migrateConfig(configPath: string): Promise<any> {
    let config: any
    
    try {
      // Check if it's a TypeScript file
      if (configPath.endsWith('.ts')) {
        // Use jiti for TypeScript support with cache disabled
        const { createJiti } = await import('jiti')
        const jiti = createJiti(import.meta.url, { 
          interopDefault: true,
          cache: false,
          requireCache: false
        })
        const configModule = await jiti.import(configPath)
        config = (configModule as any).default || configModule
      } else {
        // Load JavaScript file directly with cache busting
        const cacheBuster = `?t=${Date.now()}`
        const configModule = await import(/* @vite-ignore */ configPath + cacheBuster)
        config = configModule.default || configModule
      }
    } catch (error) {
      console.error('Failed to load config:', error)
      throw error
    }

    // Get current version
    const currentVersion = config.version || '1.0.0'
    const latestVersion = this.migrations[this.migrations.length - 1].version

    // Check if migration is needed
    if (this.compareVersions(currentVersion, latestVersion) >= 0) {
      return config // No migration needed
    }

    // Apply migrations
    let migratedConfig = { ...config }
    let applied = false

    for (const migration of this.migrations) {
      if (this.compareVersions(currentVersion, migration.version) < 0) {
        console.log(`Applying migration: ${migration.description}`)
        migratedConfig = migration.migrate(migratedConfig)
        applied = true
      }
    }

    if (applied) {
      // Update the config version to the latest
      migratedConfig.version = latestVersion
      
      // Save backup of original config to .env-manager/backups directory
      const projectDir = path.dirname(configPath)
      const backupDir = path.join(projectDir, '.env-manager', 'backups')
      
      // Ensure backup directory exists
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true })
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = path.join(backupDir, `env.config.v${currentVersion}.${timestamp}.ts`)
      const originalContent = fs.readFileSync(configPath, 'utf-8')
      fs.writeFileSync(backupPath, originalContent)
      
      // Generate new config file
      this.saveConfig(configPath, migratedConfig)
      
      console.log(`Config migrated from v${currentVersion} to v${latestVersion}`)
      console.log(`Backup saved to: ${backupPath}`)
    }

    return migratedConfig
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(n => parseInt(n, 10))
    const parts2 = v2.split('.').map(n => parseInt(n, 10))
    
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1
      if (parts1[i] < parts2[i]) return -1
    }
    
    return 0
  }

  private saveConfig(configPath: string, config: any): void {
    // Read the original file to preserve formatting and comments
    const originalContent = fs.readFileSync(configPath, 'utf-8')
    
    // Update only the version line in the original content
    const versionRegex = /version:\s*['"]([^'"]+)['"]/
    const updatedContent = originalContent.replace(versionRegex, `version: '${config.version}'`)
    
    // Update the header comment if it exists
    const headerRegex = /\/\/ Auto-migrated env\.config\.ts - Version [^\n]*/
    const finalContent = updatedContent.replace(headerRegex, `// Auto-migrated env.config.ts - Version ${config.version}`)
    
    fs.writeFileSync(configPath, finalContent)
  }
}

// Branch-aware config loader
export class BranchAwareConfigLoader {
  private gitUtils: GitUtils
  private migrator: ConfigMigrator
  
  constructor(projectRoot?: string) {
    this.gitUtils = new GitUtils(projectRoot)
    this.migrator = new ConfigMigrator()
  }
  
  async loadConfig(configPath: string): Promise<any> {
    // First migrate if needed
    const config = await this.migrator.migrateConfig(configPath)
    
    // Get current git branch
    const gitInfo = await this.gitUtils.getGitInfo()
    const currentBranch = gitInfo.branch || 'main'
    
    // Enhance config with branch information
    const enhancedConfig = {
      ...config,
      currentBranch,
      gitInfo,
      
      // Method to get branch-specific requirements
      getBranchRequirements: (branch?: string) => {
        const targetBranch = branch || currentBranch
        
        if (!config.branches?.enabled) {
          return config.requirements
        }
        
        // Check if branch has specific requirements
        if (config.branchRequirements && config.branchRequirements[targetBranch]) {
          const strategy = config.branches.strategy || 'inherit'
          
          switch (strategy) {
            case 'isolate':
              // Use only branch-specific requirements
              return config.branchRequirements[targetBranch]
              
            case 'merge':
              // Merge branch requirements with base
              return this.mergeRequirements(
                config.requirements,
                config.branchRequirements[targetBranch]
              )
              
            case 'inherit':
            default:
              // Inherit from base and override
              return this.inheritRequirements(
                config.requirements,
                config.branchRequirements[targetBranch]
              )
          }
        }
        
        return config.requirements
      },
      
      // Method to determine environment from branch
      getEnvironment: () => {
        if (!config.branches?.environments) {
          return 'development'
        }
        
        for (const [env, patterns] of Object.entries(config.branches.environments)) {
          const branchPatterns = patterns as string[]
          for (const pattern of branchPatterns) {
            if (this.matchBranchPattern(currentBranch, pattern)) {
              return env
            }
          }
        }
        
        return 'development'
      }
    }
    
    return enhancedConfig
  }
  
  private matchBranchPattern(branch: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regex = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
    
    return new RegExp(`^${regex}$`).test(branch)
  }
  
  private mergeRequirements(base: any, branch: any): any {
    const merged = { ...base }
    
    for (const [key, value] of Object.entries(branch)) {
      if (merged[key] && typeof value === 'object' && value !== null) {
        // Merge group
        const typedValue = value as any
        merged[key] = {
          ...merged[key],
          ...typedValue,
          variables: [
            ...(merged[key].variables || []),
            ...(typedValue.variables || [])
          ]
        }
      } else {
        merged[key] = value
      }
    }
    
    return merged
  }
  
  private inheritRequirements(base: any, branch: any): any {
    const inherited = { ...base }
    
    for (const [key, value] of Object.entries(branch)) {
      if (inherited[key] && typeof value === 'object' && value !== null) {
        // Override specific variables
        const typedValue = value as any
        const baseVars = inherited[key].variables || []
        const branchVars = typedValue.variables || []
        
        const varMap = new Map()
        baseVars.forEach((v: any) => varMap.set(v.name, v))
        branchVars.forEach((v: any) => varMap.set(v.name, { ...varMap.get(v.name), ...v }))
        
        inherited[key] = {
          ...inherited[key],
          ...value,
          variables: Array.from(varMap.values())
        }
      } else {
        inherited[key] = value
      }
    }
    
    return inherited
  }
}

export function getBranchAwareConfigLoader(projectRoot?: string): BranchAwareConfigLoader {
  return new BranchAwareConfigLoader(projectRoot)
}