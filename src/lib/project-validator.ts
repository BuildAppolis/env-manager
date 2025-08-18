import type { 
  ProjectConfig, 
  ValidationResults, 
  GroupResult, 
  VariableResult,
  SetupInstruction 
} from '../types.js'
import type EnvDatabase from './database.js'
import crypto from 'crypto'

export default class ProjectValidator {
  private db: EnvDatabase
  private projectConfig: ProjectConfig | null = null

  constructor(database: EnvDatabase) {
    this.db = database
  }

  async loadProjectConfig(config: ProjectConfig): Promise<void> {
    this.projectConfig = config
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

  async autoConfigureProject(): Promise<SetupInstruction[]> {
    if (!this.projectConfig) {
      throw new Error('Project configuration not loaded')
    }

    const instructions: SetupInstruction[] = []
    const validationResults = await this.validateProjectRequirements()

    // Auto-generate missing variables
    for (const [groupName, group] of Object.entries(this.projectConfig.requirements)) {
      for (const varConfig of group.variables) {
        if (validationResults.missing.includes(varConfig.name)) {
          let value = varConfig.defaultValue || ''

          // Generate secret if needed
          if (varConfig.generateSecret) {
            value = this.generateSecret()
            instructions.push({
              type: 'success',
              message: `Generated secret for ${varConfig.name}`,
              action: 'auto_generated'
            })
          }

          // Set the variable
          if (value) {
            this.db.setVariable(varConfig.name, value, {
              category: varConfig.category || 'other',
              description: varConfig.description || '',
              sensitive: varConfig.sensitive || false
            })

            instructions.push({
              type: 'success',
              message: `Configured ${varConfig.name}`,
              action: 'auto_configured'
            })
          } else {
            instructions.push({
              type: 'warning',
              message: `${varConfig.name} needs manual configuration`,
              action: 'manual_required'
            })
          }
        }
      }
    }

    return instructions
  }

  private generateSecret(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  getSetupInstructions(): SetupInstruction[] {
    if (!this.projectConfig) {
      return [{
        type: 'error',
        message: 'No project configuration loaded',
        action: 'load_config'
      }]
    }

    const instructions: SetupInstruction[] = []

    instructions.push({
      type: 'info',
      message: `Setting up ${this.projectConfig.projectName}`,
      action: 'setup_start'
    })

    // Add instructions for each requirement group
    for (const [groupName, group] of Object.entries(this.projectConfig.requirements)) {
      instructions.push({
        type: 'info',
        message: `Configure ${group.name} (${group.variables.length} variables)`,
        action: 'configure_group'
      })

      for (const varConfig of group.variables) {
        const instruction: SetupInstruction = {
          type: varConfig.required ? 'warning' : 'info',
          message: `Set ${varConfig.name}: ${varConfig.description || 'No description'}`,
          action: 'set_variable'
        }

        if (varConfig.generateSecret) {
          instruction.message += ' (will auto-generate secret)'
        }

        instructions.push(instruction)
      }
    }

    return instructions
  }
}
