import { g as getDatabase } from '../../../chunks/session_DAr66qTp.mjs';
import crypto from 'crypto';
import path from 'path';
export { renderers } from '../../../renderers.mjs';

class ProjectValidator {
  constructor(database) {
    this.projectConfig = null;
    this.db = database;
  }
  async loadProjectConfig(config) {
    this.projectConfig = config;
  }
  async validateProjectRequirements() {
    if (!this.projectConfig) {
      throw new Error("Project configuration not loaded");
    }
    const results = {
      projectName: this.projectConfig.projectName,
      isValid: true,
      groups: {},
      missing: [],
      invalid: [],
      canStart: false
    };
    const currentVariables = this.db.getAllVariables();
    const variableMap = new Map(currentVariables.map((v) => [v.name, v]));
    for (const [groupName, group] of Object.entries(this.projectConfig.requirements)) {
      const groupResult = {
        name: groupName,
        required: group.required,
        configured: true,
        variables: [],
        missing: [],
        invalid: []
      };
      for (const varConfig of group.variables) {
        const currentVar = variableMap.get(varConfig.name);
        const varResult = {
          name: varConfig.name,
          configured: !!currentVar,
          hasValue: !!(currentVar && currentVar.value),
          valid: true,
          errors: []
        };
        if (!currentVar) {
          varResult.configured = false;
          varResult.valid = false;
          varResult.errors.push("Variable not configured");
          groupResult.missing.push(varConfig.name);
          results.missing.push(varConfig.name);
        } else if (!currentVar.value) {
          varResult.hasValue = false;
          varResult.valid = false;
          varResult.errors.push("Variable has no value");
          groupResult.missing.push(varConfig.name);
          results.missing.push(varConfig.name);
        } else {
          if (varConfig.validation && !varConfig.validation.test(currentVar.value)) {
            varResult.valid = false;
            varResult.errors.push("Value format invalid");
            groupResult.invalid.push(varConfig.name);
            results.invalid.push(varConfig.name);
          }
          if (varConfig.minLength && currentVar.value.length < varConfig.minLength) {
            varResult.valid = false;
            varResult.errors.push(`Value too short (min: ${varConfig.minLength})`);
            groupResult.invalid.push(varConfig.name);
            results.invalid.push(varConfig.name);
          }
        }
        groupResult.variables.push(varResult);
      }
      groupResult.configured = groupResult.missing.length === 0 && groupResult.invalid.length === 0;
      if (group.required && !groupResult.configured) {
        results.isValid = false;
      }
      results.groups[groupName] = groupResult;
    }
    const requiredGroups = this.projectConfig.validation?.requiredGroups || [];
    const satisfiedRequiredGroups = requiredGroups.filter(
      (groupName) => results.groups[groupName]?.configured
    );
    results.canStart = results.isValid && satisfiedRequiredGroups.length === requiredGroups.length;
    return results;
  }
  async autoConfigureProject() {
    if (!this.projectConfig) {
      throw new Error("Project configuration not loaded");
    }
    const instructions = [];
    const validationResults = await this.validateProjectRequirements();
    for (const [groupName, group] of Object.entries(this.projectConfig.requirements)) {
      for (const varConfig of group.variables) {
        if (validationResults.missing.includes(varConfig.name)) {
          let value = varConfig.defaultValue || "";
          if (varConfig.generateSecret) {
            value = this.generateSecret();
            instructions.push({
              type: "success",
              message: `Generated secret for ${varConfig.name}`,
              action: "auto_generated"
            });
          }
          if (value) {
            this.db.setVariable(varConfig.name, value, {
              category: varConfig.category || "other",
              description: varConfig.description || "",
              sensitive: varConfig.sensitive || false
            });
            instructions.push({
              type: "success",
              message: `Configured ${varConfig.name}`,
              action: "auto_configured"
            });
          } else {
            instructions.push({
              type: "warning",
              message: `${varConfig.name} needs manual configuration`,
              action: "manual_required"
            });
          }
        }
      }
    }
    return instructions;
  }
  generateSecret(length = 32) {
    return crypto.randomBytes(length).toString("hex");
  }
  getSetupInstructions() {
    if (!this.projectConfig) {
      return [{
        type: "error",
        message: "No project configuration loaded",
        action: "load_config"
      }];
    }
    const instructions = [];
    instructions.push({
      type: "info",
      message: `Setting up ${this.projectConfig.projectName}`,
      action: "setup_start"
    });
    for (const [groupName, group] of Object.entries(this.projectConfig.requirements)) {
      instructions.push({
        type: "info",
        message: `Configure ${group.name} (${group.variables.length} variables)`,
        action: "configure_group"
      });
      for (const varConfig of group.variables) {
        const instruction = {
          type: varConfig.required ? "warning" : "info",
          message: `Set ${varConfig.name}: ${varConfig.description || "No description"}`,
          action: "set_variable"
        };
        if (varConfig.generateSecret) {
          instruction.message += " (will auto-generate secret)";
        }
        instructions.push(instruction);
      }
    }
    return instructions;
  }
}

const GET = async () => {
  try {
    const database = getDatabase();
    const projectRoot = path.resolve(process.cwd(), "..");
    const configPath = path.join(projectRoot, "env.config.ts");
    try {
      const configModule = await import(
        /* @vite-ignore */
        configPath
      );
      const projectConfig = configModule.default;
      const validatorConfig = {
        projectName: projectConfig.projectName,
        version: projectConfig.projectVersion || "1.0.0",
        requirements: {},
        validation: {
          requiredGroups: projectConfig.validation?.requiredGroups || []
        }
      };
      for (const [groupName, group] of Object.entries(projectConfig.requirements)) {
        const groupData = group;
        validatorConfig.requirements[groupName] = {
          name: groupName.charAt(0).toUpperCase() + groupName.slice(1),
          required: groupData.required,
          variables: groupData.variables.map((variable) => ({
            name: variable.name,
            description: variable.description,
            required: true,
            sensitive: variable.sensitive,
            category: groupName,
            validation: variable.validation,
            minLength: variable.minLength,
            defaultValue: variable.default
          }))
        };
      }
      const validator = new ProjectValidator(database);
      await validator.loadProjectConfig(validatorConfig);
      const results = await validator.validateProjectRequirements();
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (configError) {
      console.error("Config loading error:", configError);
      return new Response(JSON.stringify({
        error: "Failed to load project configuration",
        message: `Error loading env.config.ts: ${configError instanceof Error ? configError.message : String(configError)}`
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Get project status error:", error);
    return new Response(JSON.stringify({ error: "Failed to get project status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
