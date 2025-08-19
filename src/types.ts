// Environment Variable Types
export interface EnvVariable {
  name: string
  value: string
  category?: string
  description?: string
  sensitive?: boolean
  required?: boolean
  validation?: RegExp
  minLength?: number
}

export interface DatabaseVariable extends EnvVariable {
  encrypted: boolean
  createdAt: string
  updatedAt: string
  branch?: string  // Branch-specific variable
  environment?: string  // Environment (dev, staging, prod)
}

// Hot Reload Configuration
export interface HotReloadSettings {
  enabled: boolean
  autoReload: boolean
  reloadDelay: number
  wsPort: number
  notifyOnly: boolean
}

// Project Configuration Types
export interface ProjectVariableConfig {
  name: string
  description?: string
  type?: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'json' | 'port' | 'path'
  required?: boolean
  sensitive?: boolean
  category?: string
  validation?: RegExp
  minLength?: number
  defaultValue?: string
  default?: string  // Alias for defaultValue
  example?: string  // Example value for documentation
  generateSecret?: boolean
  generate?: 'uuid' | 'crypto' | 'password'  // Generation strategy
}

export interface ProjectRequirementGroup {
  name: string
  description?: string
  required: boolean
  variables: ProjectVariableConfig[]
}

export interface CustomValidation {
  name: string
  description?: string
  async?: boolean
  validate?: (variables: Record<string, string>) => boolean | Promise<boolean>
}

export interface ProjectValidation {
  requiredGroups?: string[]
  allowExtraVariables?: boolean
  customValidation?: CustomValidation[]
}

export interface DevServerConfig {
  blockUntilReady?: boolean
  showProgress?: boolean
  autoGenerate?: boolean
  validateOnStart?: boolean
}

export interface ProjectConfig {
  projectName: string
  projectVersion?: string  // Version of the project using env-manager
  version?: string  // Alias for projectVersion
  envManagerVersion?: string  // Expected version of env-manager
  description?: string
  requirements: Record<string, ProjectRequirementGroup>
  validation?: ProjectValidation
  devServer?: DevServerConfig
}

// Validation Result Types
export interface VariableResult {
  name: string
  configured: boolean
  hasValue: boolean
  valid: boolean
  errors: string[]
  sensitive?: boolean
  type?: 'client' | 'server'
  description?: string
}

export interface GroupResult {
  name: string
  required: boolean
  configured: boolean
  variables: VariableResult[]
  missing: string[]
  invalid: string[]
}

export interface ValidationResults {
  projectName: string
  isValid: boolean
  groups: Record<string, GroupResult>
  missing: string[]
  invalid: string[]
  canStart: boolean
}

export interface SetupInstruction {
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  action?: string
}

// Database Types
export interface HistoryEntry {
  id: string
  action: 'create' | 'update' | 'delete' | 'restore'
  variableName: string
  oldValue?: string
  newValue?: string
  timestamp: string
}

export interface Snapshot {
  id: string
  name: string
  description: string
  variables: DatabaseVariable[]
  createdAt: string
}

// Draft/Publish System Types
export interface DraftVariable extends DatabaseVariable {
  isDraft: boolean
  originalValue?: string
  changeType: 'create' | 'update' | 'delete' | 'none'
}

export interface VersionEntry {
  id: string
  version: string
  description: string
  author?: string
  timestamp: string
  variableCount: number
  changes: VariableChange[]
  published: boolean
}

export interface VariableChange {
  name: string
  type: 'create' | 'update' | 'delete' | 'none'
  oldValue?: string
  newValue?: string
  sensitive: boolean
}

export interface DraftSession {
  id: string
  createdAt: string
  changes: Map<string, DraftVariable>
  description?: string
  author?: string
}
