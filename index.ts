/**
 * @buildappolis/env-manager
 * Enterprise-grade environment variable management system
 * 
 * @copyright BuildAppolis (www.buildappolis.com)
 * @license See LICENSE file
 */

// Export all types
export * from './src/types'
export type * from './types'

// Export the main classes
export { EnvManager, envManager } from './src/lib/env-manager'
export { default as ProjectValidator } from './src/lib/project-validator'

// Re-export specific types for convenience
export type {
  EnvVariable,
  DatabaseVariable,
  ProjectVariableConfig,
  ProjectRequirementGroup,
  ProjectValidation,
  CustomValidation,
  DevServerConfig,
  ProjectConfig,
  ValidationResults,
  VariableResult,
  GroupResult,
  SetupInstruction,
  HistoryEntry,
  Snapshot
} from './src/types'

// Export the client for connecting to external env-manager
export interface EnvManagerClientConfig {
  url?: string
  apiKey?: string
  enabled?: boolean
  fallbackToLocal?: boolean
}