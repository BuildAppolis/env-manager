import crypto from 'crypto'
import path from 'path'
import type { 
  ProjectConfig, 
  ValidationResults, 
  SetupInstructions, 
  ConfiguredVariable,
  DatabaseVariable,
  GroupResult,
  VariableResult,
  SetupStep
} from './types'

interface EnvDatabase {
  getAllVariables(): DatabaseVariable[]
  saveVariable(variable: Partial<DatabaseVariable>): Promise<void>
}

class ProjectValidator {
  private db: EnvDatabase
  private projectConfig: ProjectConfig | null = null

  constructor(envDatabase: EnvDatabase) {
    this.db = envDatabase
  }

  async loadProjectConfig(projectRoot: string): Promise<ProjectConfig> {
    try {
      const configPath = path.join(projectRoot, 'env.config.ts')
      delete require.cache[require.resolve(configPath)]
      const configModule = require(configPath)
      this.projectConfig = configModule.default || configModule
      return this.projectConfig!
    } catch (error) {
      throw new Error(`Failed to load project configuration: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async validateProjectRequirements(): Promise<ValidationResults> {
    if (!this.projectConfig) {
      throw new Error('Project configuration not loaded')
    }

    const results: ValidationResults = {
      projectName: this.projectConfig.projectName,
      isValid: true,
      groups: {},
      missing: [],
      invalid: [],
      canStart: false
    }

    // Get current variables from database
    const currentVariables = this.db.getAllVariables()
    const variableMap = new Map(currentVariables.map(v => [v.name, v]))

    // Validate each requirement group
    for (const [groupName, group] of Object.entries(this.projectConfig.requirements)) {
      const groupResult: GroupResult = {
        name: groupName,
        required: group.required,
        configured: true,
        variables: [],
        missing: [],
        invalid: []
      }

      // Check each variable in the group
      for (const varConfig of group.variables) {
        const currentVar = variableMap.get(varConfig.name)
        const varResult: VariableResult = {
          name: varConfig.name,
          configured: !!currentVar,
          hasValue: !!(currentVar && currentVar.value),
          valid: true,
          errors: []
        }

        // Check if variable exists and has value
        if (!currentVar) {
          varResult.configured = false
          varResult.valid = false
          varResult.errors.push('Variable not configured')
          groupResult.missing.push(varConfig.name)
          results.missing.push(varConfig.name)
        } else if (!currentVar.value) {
          varResult.hasValue = false
          varResult.valid = false
          varResult.errors.push('Variable has no value')
          groupResult.missing.push(varConfig.name)
          results.missing.push(varConfig.name)
        } else {
          // Validate value format if validation rules exist
          if (varConfig.validation && !varConfig.validation.test(currentVar.value)) {
            varResult.valid = false
            varResult.errors.push('Value format invalid')
            groupResult.invalid.push(varConfig.name)
            results.invalid.push(varConfig.name)
          }

          // Check minimum length
          if (varConfig.minLength && currentVar.value.length < varConfig.minLength) {
            varResult.valid = false
            varResult.errors.push(`Value too short (min: ${varConfig.minLength})`)
            groupResult.invalid.push(varConfig.name)
            results.invalid.push(varConfig.name)
          }
        }

        groupResult.variables.push(varResult)
      }

      // Group is configured if all variables are valid
      groupResult.configured = groupResult.missing.length === 0 && groupResult.invalid.length === 0

      // If group is required and not configured, project is invalid
      if (group.required && !groupResult.configured) {
        results.isValid = false
      }

      results.groups[groupName] = groupResult
    }

    // Check if required groups are satisfied
    const requiredGroups = this.projectConfig.validation?.requiredGroups || []
    const satisfiedRequiredGroups = requiredGroups.filter(groupName => 
      results.groups[groupName]?.configured
    )

    results.canStart = results.isValid && satisfiedRequiredGroups.length === requiredGroups.length

    return results
  }

  async autoConfigureMissingVariables(): Promise<ConfiguredVariable[]> {
    if (!this.projectConfig) {
      throw new Error('Project configuration not loaded')
    }

    const configured: ConfiguredVariable[] = []

    for (const [groupName, group] of Object.entries(this.projectConfig.requirements)) {
      for (const varConfig of group.variables) {
        const currentVar = this.db.getAllVariables().find(v => v.name === varConfig.name)
        
        if (!currentVar) {
          // Generate default value
          let defaultValue = varConfig.default || ''
          
          if (varConfig.generate === 'crypto' && varConfig.minLength) {
            defaultValue = crypto.randomBytes(Math.ceil(varConfig.minLength / 2)).toString('hex').slice(0, varConfig.minLength)
          }

          // Create the variable
          await this.db.saveVariable({
            name: varConfig.name,
            value: defaultValue,
            category: this.capitalizeFirst(groupName),
            description: varConfig.description,
            required: group.required,
            clientSide: varConfig.name.startsWith('NEXT_PUBLIC_'),
            type: varConfig.type,
            sensitive: varConfig.sensitive,
            deprecated: false
          })

          configured.push({
            name: varConfig.name,
            group: groupName,
            generated: varConfig.generate === 'crypto',
            value: varConfig.sensitive ? '***' : defaultValue
          })
        }
      }
    }

    return configured
  }

  generateSetupInstructions(validationResults: ValidationResults): SetupInstructions {
    const instructions: SetupInstructions = {
      title: `Setup Required for ${validationResults.projectName}`,
      canStart: validationResults.canStart,
      steps: []
    }

    if (validationResults.canStart) {
      instructions.steps.push({
        type: 'success',
        message: '✅ All requirements satisfied! Project ready to start.'
      })
      return instructions
    }

    // Group missing/invalid variables by category
    const issuesByGroup: Record<string, { required: boolean; missing: string[]; invalid: string[] }> = {}
    
    for (const [groupName, group] of Object.entries(validationResults.groups)) {
      if (!group.configured && group.required) {
        issuesByGroup[groupName] = {
          required: group.required,
          missing: group.missing,
          invalid: group.invalid
        }
      }
    }

    // Generate setup steps
    for (const [groupName, issues] of Object.entries(issuesByGroup)) {
      const groupConfig = this.projectConfig!.requirements[groupName]
      
      instructions.steps.push({
        type: 'error',
        group: groupName,
        title: `Configure ${this.capitalizeFirst(groupName)}`,
        required: issues.required,
        variables: issues.missing.concat(issues.invalid).map(varName => {
          const varConfig = groupConfig.variables.find(v => v.name === varName)
          if (!varConfig) throw new Error(`Variable config not found: ${varName}`)
          return {
            name: varName,
            description: varConfig.description,
            example: varConfig.example,
            type: varConfig.type,
            sensitive: varConfig.sensitive
          }
        })
      })
    }

    return instructions
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

export default ProjectValidator
