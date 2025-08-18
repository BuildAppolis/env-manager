import type { APIRoute } from 'astro';
import { getDatabase } from '../../../lib/session.js';
import ProjectValidator from '../../../lib/project-validator.js';
import path from 'path';

export const GET: APIRoute = async () => {
  try {
    const database = getDatabase();
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load project config from root directory
    const projectRoot = path.resolve(process.cwd(), '..');
    const configPath = path.join(projectRoot, 'env.config.ts');
    
    try {
      // Import the actual config file
      const configModule = await import(/* @vite-ignore */ configPath);
      const projectConfig = configModule.default;
      
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

      // Convert requirements format
      for (const [groupName, group] of Object.entries(projectConfig.requirements)) {
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
      const results = await validator.validateProjectRequirements();
      
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
