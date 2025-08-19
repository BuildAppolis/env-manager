import type { APIRoute } from 'astro';
import { getDatabase } from '../../../lib/session.js';
import ProjectValidator from '../../../lib/project-validator.js';
import { getGitUtils } from '../../../lib/git-utils.js';
import { getBranchAwareConfigLoader } from '../../../lib/config-migrator.js';
import path from 'path';

export const GET: APIRoute = async () => {
  try {
    const database = getDatabase();
    
    // Status endpoint is public for validation purposes
    // It doesn't expose sensitive variable values, only validation status

    // Load project config from root directory
    const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd(), '..');
    const configPath = path.join(projectRoot, 'env.config.ts');
    
    // Get git information
    const gitUtils = getGitUtils(projectRoot);
    const gitInfo = await gitUtils.getGitInfo();
    const branches = await gitUtils.getAllBranches();
    
    try {
      // Load config with branch awareness and migration
      const configLoader = getBranchAwareConfigLoader(projectRoot);
      const projectConfig = await configLoader.loadConfig(configPath);
      
      // Get branch-specific requirements
      const requirements = projectConfig.getBranchRequirements();
      const environment = projectConfig.getEnvironment();
      
      // Convert the config to match our validator format
      const validatorConfig: {
        projectName: string;
        version: string;
        requirements: Record<string, any>;
        validation: {
          requiredGroups: string[];
        };
      } = {
        projectName: projectConfig.projectName,
        version: projectConfig.projectVersion || '1.0.0',
        requirements: {},
        validation: {
          requiredGroups: projectConfig.validation?.requiredGroups || []
        }
      };

      // Convert requirements format - use branch-specific requirements
      for (const [groupName, group] of Object.entries(requirements)) {
        const groupData = group as any;
        validatorConfig.requirements[groupName] = {
          name: groupName.charAt(0).toUpperCase() + groupName.slice(1),
          required: groupData.required,
          variables: groupData.variables.map((variable: any) => ({
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
      const validationResults = await validator.validateProjectRequirements();
      
      // Combine validation results with git info
      const results = {
        ...validationResults,
        git: gitInfo,
        branches: branches,
        currentBranch: gitInfo.branch || 'main',
        environment: environment,
        projectInfo: {
          name: projectConfig.projectName,
          version: projectConfig.projectVersion || '1.0.0',
          configVersion: projectConfig.version || '1.0.0',
          branchStrategy: projectConfig.branches?.strategy || 'inherit'
        }
      };
      
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (configError) {
      console.error('Config loading error:', configError);
      return new Response(JSON.stringify({
        error: 'Failed to load project configuration',
        message: `Error loading env.config.ts: ${configError instanceof Error ? configError.message : String(configError)}`
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Get project status error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get project status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
