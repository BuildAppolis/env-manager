import { g as getDatabase } from '../../../chunks/session_DKC9ty2U.mjs';
import crypto from 'crypto';
import { G as GitUtils, g as getGitUtils } from '../../../chunks/git-utils_B6WJYd3b.mjs';
import fs from 'fs';
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
  async validateProjectRequirements(branch) {
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
    const currentVariables = this.db.getAllVariables(branch);
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
          errors: [],
          sensitive: varConfig.sensitive,
          type: varConfig.name.startsWith("NEXT_PUBLIC_") ? "client" : "server",
          description: varConfig.description
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
          if (varConfig.validation && typeof varConfig.validation.test === "function" && !varConfig.validation.test(currentVar.value)) {
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

class ConfigMigrator {
  constructor() {
    this.migrations = [
      {
        version: "1.0.0",
        description: "Initial config structure",
        migrate: (config) => config
      },
      {
        version: "1.1.0",
        description: "Add branch-specific configuration",
        migrate: (config) => {
          if (!config.branches) {
            config.branches = {
              enabled: true,
              strategy: "inherit",
              // 'inherit' | 'isolate' | 'merge'
              main: "main",
              environments: {
                development: ["dev", "develop", "feature/*"],
                staging: ["staging", "release/*"],
                production: ["main", "master", "prod"]
              }
            };
          }
          if (!config.version) {
            config.version = "1.1.0";
          }
          return config;
        }
      },
      {
        version: "1.2.0",
        description: "Add deployment configuration",
        migrate: (config) => {
          if (!config.deployment) {
            config.deployment = {
              autoExport: false,
              exportOnCommit: false,
              branchSpecific: true,
              environments: {}
            };
          }
          return config;
        }
      }
    ];
  }
  async migrateConfig(configPath) {
    let config;
    try {
      if (configPath.endsWith(".ts")) {
        const { createJiti } = await import('jiti');
        const jiti = createJiti(import.meta.url, {
          interopDefault: true,
          cache: false,
          requireCache: false
        });
        const configModule = await jiti.import(configPath);
        config = configModule.default || configModule;
      } else {
        const cacheBuster = `?t=${Date.now()}`;
        const configModule = await import(
          /* @vite-ignore */
          configPath + cacheBuster
        );
        config = configModule.default || configModule;
      }
    } catch (error) {
      console.error("Failed to load config:", error);
      throw error;
    }
    const currentVersion = config.version || "1.0.0";
    const latestVersion = this.migrations[this.migrations.length - 1].version;
    if (this.compareVersions(currentVersion, latestVersion) >= 0) {
      return config;
    }
    let migratedConfig = { ...config };
    let applied = false;
    for (const migration of this.migrations) {
      if (this.compareVersions(currentVersion, migration.version) < 0) {
        console.log(`Applying migration: ${migration.description}`);
        migratedConfig = migration.migrate(migratedConfig);
        applied = true;
      }
    }
    if (applied) {
      migratedConfig.version = latestVersion;
      const projectDir = path.dirname(configPath);
      const backupDir = path.join(projectDir, ".env-manager", "backups");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(backupDir, `env.config.v${currentVersion}.${timestamp}.ts`);
      const originalContent = fs.readFileSync(configPath, "utf-8");
      fs.writeFileSync(backupPath, originalContent);
      this.saveConfig(configPath, migratedConfig);
      console.log(`Config migrated from v${currentVersion} to v${latestVersion}`);
      console.log(`Backup saved to: ${backupPath}`);
    }
    return migratedConfig;
  }
  compareVersions(v1, v2) {
    const parts1 = v1.split(".").map((n) => parseInt(n, 10));
    const parts2 = v2.split(".").map((n) => parseInt(n, 10));
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  }
  saveConfig(configPath, config) {
    const originalContent = fs.readFileSync(configPath, "utf-8");
    const versionRegex = /version:\s*['"]([^'"]+)['"]/;
    const updatedContent = originalContent.replace(versionRegex, `version: '${config.version}'`);
    const headerRegex = /\/\/ Auto-migrated env\.config\.ts - Version [^\n]*/;
    const finalContent = updatedContent.replace(headerRegex, `// Auto-migrated env.config.ts - Version ${config.version}`);
    fs.writeFileSync(configPath, finalContent);
  }
}
class BranchAwareConfigLoader {
  constructor(projectRoot) {
    this.gitUtils = new GitUtils(projectRoot);
    this.migrator = new ConfigMigrator();
  }
  async loadConfig(configPath) {
    const config = await this.migrator.migrateConfig(configPath);
    const gitInfo = await this.gitUtils.getGitInfo();
    const currentBranch = gitInfo.branch || "main";
    const enhancedConfig = {
      ...config,
      currentBranch,
      gitInfo,
      // Method to get branch-specific requirements
      getBranchRequirements: (branch) => {
        const targetBranch = branch || currentBranch;
        if (!config.branches?.enabled) {
          return config.requirements;
        }
        if (config.branchRequirements && config.branchRequirements[targetBranch]) {
          const strategy = config.branches.strategy || "inherit";
          switch (strategy) {
            case "isolate":
              return config.branchRequirements[targetBranch];
            case "merge":
              return this.mergeRequirements(
                config.requirements,
                config.branchRequirements[targetBranch]
              );
            case "inherit":
            default:
              return this.inheritRequirements(
                config.requirements,
                config.branchRequirements[targetBranch]
              );
          }
        }
        return config.requirements;
      },
      // Method to determine environment from branch
      getEnvironment: () => {
        if (!config.branches?.environments) {
          return "development";
        }
        for (const [env, patterns] of Object.entries(config.branches.environments)) {
          const branchPatterns = patterns;
          for (const pattern of branchPatterns) {
            if (this.matchBranchPattern(currentBranch, pattern)) {
              return env;
            }
          }
        }
        return "development";
      }
    };
    return enhancedConfig;
  }
  matchBranchPattern(branch, pattern) {
    const regex = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
    return new RegExp(`^${regex}$`).test(branch);
  }
  mergeRequirements(base, branch) {
    const merged = { ...base };
    for (const [key, value] of Object.entries(branch)) {
      if (merged[key] && typeof value === "object" && value !== null) {
        const typedValue = value;
        merged[key] = {
          ...merged[key],
          ...typedValue,
          variables: [
            ...merged[key].variables || [],
            ...typedValue.variables || []
          ]
        };
      } else {
        merged[key] = value;
      }
    }
    return merged;
  }
  inheritRequirements(base, branch) {
    const inherited = { ...base };
    for (const [key, value] of Object.entries(branch)) {
      if (inherited[key] && typeof value === "object" && value !== null) {
        const typedValue = value;
        const baseVars = inherited[key].variables || [];
        const branchVars = typedValue.variables || [];
        const varMap = /* @__PURE__ */ new Map();
        baseVars.forEach((v) => varMap.set(v.name, v));
        branchVars.forEach((v) => varMap.set(v.name, { ...varMap.get(v.name), ...v }));
        inherited[key] = {
          ...inherited[key],
          ...value,
          variables: Array.from(varMap.values())
        };
      } else {
        inherited[key] = value;
      }
    }
    return inherited;
  }
}
function getBranchAwareConfigLoader(projectRoot) {
  return new BranchAwareConfigLoader(projectRoot);
}

const GET = async ({ url }) => {
  try {
    const projectPath = url.searchParams.get("projectPath");
    const database = getDatabase(projectPath || void 0);
    const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), "..");
    const configPath = path.join(projectRoot, "env.config.ts");
    const gitUtils = getGitUtils(projectRoot);
    const gitInfo = await gitUtils.getGitInfo();
    const branches = await gitUtils.getAllBranches();
    try {
      const configLoader = getBranchAwareConfigLoader(projectRoot);
      const projectConfig = await configLoader.loadConfig(configPath);
      const requirements = projectConfig.getBranchRequirements();
      const environment = projectConfig.getEnvironment();
      const validatorConfig = {
        projectName: projectConfig.projectName,
        version: projectConfig.projectVersion || "1.0.0",
        requirements: {},
        validation: {
          requiredGroups: projectConfig.validation?.requiredGroups || []
        }
      };
      for (const [groupName, group] of Object.entries(requirements)) {
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
      let validationResults;
      try {
        const validator = new ProjectValidator(database);
        await validator.loadProjectConfig(validatorConfig);
        validationResults = await validator.validateProjectRequirements(gitInfo.branch);
      } catch (authError) {
        console.error("ProjectValidator error:", authError.message);
        validationResults = {
          projectName: validatorConfig.projectName,
          isValid: false,
          groups: {},
          missing: [],
          invalid: [],
          canStart: false
        };
        for (const [groupName, group] of Object.entries(validatorConfig.requirements)) {
          const groupData = group;
          validationResults.groups[groupName] = {
            name: groupData.name,
            required: groupData.required,
            configured: false,
            variables: groupData.variables.map((v) => ({
              name: v.name,
              configured: false,
              hasValue: false,
              valid: false,
              errors: [],
              sensitive: v.sensitive,
              type: v.name.startsWith("NEXT_PUBLIC_") ? "client" : "server",
              description: v.description
            })),
            missing: groupData.variables.map((v) => v.name),
            invalid: []
          };
          validationResults.missing.push(...groupData.variables.map((v) => v.name));
        }
      }
      const results = {
        ...validationResults,
        git: gitInfo,
        branches,
        currentBranch: gitInfo.branch || "main",
        environment,
        projectInfo: {
          name: projectConfig.projectName,
          version: projectConfig.projectVersion || "1.0.0",
          configVersion: projectConfig.version || "1.0.0",
          branchStrategy: projectConfig.branches?.strategy || "inherit"
        }
      };
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
