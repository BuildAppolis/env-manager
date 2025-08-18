// TypeScript types for the Environment Manager system

export interface EnvironmentVariable {
  name: string
  type: 'string' | 'url' | 'boolean' | 'number'
  sensitive: boolean
  description: string
  validation?: RegExp
  example?: string
  default?: string
  minLength?: number
  generate?: 'crypto' | 'uuid' | 'random'
}

export interface RequirementGroup {
  required: boolean
  variables: EnvironmentVariable[]
}

export interface ProjectValidation {
  requiredGroups: string[]
  customValidation?: ValidationRule[]
}

export interface ValidationRule {
  name: string
  description: string
  async: boolean
}

export interface DevServerConfig {
  blockUntilReady: boolean
  showProgress: boolean
  autoGenerate: boolean
  validateOnStart: boolean
}

export interface ProjectConfig {
  projectName: string
  projectVersion: string
  envManagerVersion: string
  requirements: Record<string, RequirementGroup>
  validation: ProjectValidation
  devServer: DevServerConfig
}

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

export interface SetupStep {
  type: 'success' | 'error' | 'warning' | 'info'
  group?: string
  title?: string
  message?: string
  required?: boolean
  variables?: {
    name: string
    description: string
    example?: string
    type: string
    sensitive: boolean
  }[]
}

export interface SetupInstructions {
  title: string
  canStart: boolean
  steps: SetupStep[]
}

export interface ConfiguredVariable {
  name: string
  group: string
  generated: boolean
  value: string
}

export interface DatabaseVariable {
  name: string
  value: string
  category: string
  description: string
  required: boolean
  clientSide: boolean
  type: string
  sensitive: boolean
  deprecated: boolean
  addedAt?: string
  updatedAt?: string
  showValue?: boolean
}
