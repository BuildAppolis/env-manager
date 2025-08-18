import type { APIRoute } from 'astro';
import { getDatabase } from '../../../lib/session.js';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const database = getDatabase();
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { variableName } = await request.json();
    
    if (!variableName) {
      return new Response(JSON.stringify({ error: 'Variable name required' }), {
        status: 400,
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
      
      // Find the variable configuration
      let variableConfig: any = null;
      let groupName: string | null = null;
      
      for (const [groupKey, group] of Object.entries(projectConfig.requirements)) {
        const groupData = group as any;
        const variable = groupData.variables.find((v: any) => v.name === variableName);
        if (variable) {
          variableConfig = variable;
          groupName = groupKey;
          break;
        }
      }
      
      if (!variableConfig) {
        return new Response(JSON.stringify({ 
          error: 'Variable not found in project configuration' 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Return the variable configuration for the frontend
      const config = {
        name: variableConfig.name,
        description: variableConfig.description,
        category: groupName,
        sensitive: variableConfig.sensitive || false,
        minLength: variableConfig.minLength,
        defaultValue: variableConfig.default,
        generate: variableConfig.generate,
        validation: variableConfig.validation ? variableConfig.validation.source : null
      };
      
      return new Response(JSON.stringify(config), {
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
    console.error('Get variable config error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get variable configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
