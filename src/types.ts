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
}

// Project Configuration Types
export interface ProjectVariableConfig {
  name: string
  description?: string
  required?: boolean
  sensitive?: boolean
  category?: string
  validation?: RegExp
  minLength?: number
  defaultValue?: string
  generateSecret?: boolean
}

export interface ProjectRequirementGroup {
  name: string
  description?: string
  required: boolean
  variables: ProjectVariableConfig[]
}

export interface ProjectValidation {
  requiredGroups?: string[]
  allowExtraVariables?: boolean
}

export interface ProjectConfig {
  projectName: string
  version: string
  description?: string
  requirements: Record<string, ProjectRequirementGroup>
  validation?: ProjectValidation
}

// Validation Result Types
export interface VariableResult {
  name: string
  configured: boolean
  hasValue: boolean
  valid: boolean
  errors: string[]
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
