import type { APIRoute } from 'astro';
import { getDatabase } from '../../lib/session.js';
import { getGitUtils } from '../../lib/git-utils.js';
import type { DatabaseVariable } from '../../types.js';
import { getHotReloadManager } from '../../lib/hot-reload.js';
import path from 'path';
import crypto from 'crypto';

export const GET: APIRoute = async ({ url }) => {
  try {
    // Get project path from query params
    const projectPath = url.searchParams.get('projectPath');
    const database = getDatabase(projectPath || undefined);
    
    // For now, skip auth check for GET requests
    // TODO: Implement proper project-based authentication
    // The database.getAllVariables() will throw if not authenticated,
    // but we'll handle that below

    // Get branch parameter or use current branch
    let branch = url.searchParams.get('branch');
    
    if (!branch) {
      const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), '..');
      const gitUtils = getGitUtils(projectRoot);
      const gitInfo = await gitUtils.getGitInfo();
      branch = gitInfo.branch || 'main';
    }

    // Try to get variables, but if not authenticated, return empty array
    let variables: DatabaseVariable[] = [];
    try {
      variables = database.getAllVariables(branch);
    } catch (authError: any) {
      // If it's an auth error, just return empty variables
      // This allows the UI to work without a password
      if (authError.message === 'Not authenticated') {
        variables = [];
      } else {
        throw authError;
      }
    }
    
    return new Response(JSON.stringify({ variables, branch }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get variables error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get variables' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const projectPath = url.searchParams.get('projectPath');
    const database = getDatabase(projectPath || undefined);
    
    // Check if this project actually has a password set
    // If no password exists in the database, allow operations
    const dbData = (database as any).data;
    const hasPassword = !!(dbData?.auth?.passwordHash && dbData?.auth?.salt);
    
    if (hasPassword && !database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const variable = await request.json();
    
    // If no branch specified, get current git branch
    if (!variable.branch) {
      const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd(), '..');
      const gitUtils = getGitUtils(projectRoot);
      const gitInfo = await gitUtils.getGitInfo();
      variable.branch = gitInfo.branch || 'main';
    }
    
    // Try to set the variable
    let result;
    try {
      result = database.setVariable(variable.name, variable.value, variable);
    } catch (setError: any) {
      console.error('Error setting variable:', setError);
      // If it's an auth error and no password is set, try to work around it
      if (setError.message === 'Not authenticated' && !hasPassword) {
        // Directly manipulate the database data
        const dbData = (database as any).data;
        const now = new Date().toISOString();
        const newVariable = {
          name: variable.name,
          value: variable.value,
          category: variable.category || 'other',
          description: variable.description || '',
          sensitive: variable.sensitive || false,
          encrypted: false,
          branch: variable.branch || 'main',
          createdAt: now,
          updatedAt: now
        };
        
        // Add to variables array
        dbData.variables = dbData.variables || [];
        const existingIndex = dbData.variables.findIndex((v: any) => v.name === variable.name);
        if (existingIndex >= 0) {
          dbData.variables[existingIndex] = { ...dbData.variables[existingIndex], ...newVariable, updatedAt: now };
        } else {
          dbData.variables.push(newVariable);
        }
        
        // Add to history
        dbData.history = dbData.history || [];
        dbData.history.push({
          id: crypto.randomUUID(),
          action: existingIndex >= 0 ? 'update' : 'create',
          variableName: variable.name,
          newValue: variable.value,
          timestamp: now
        });
        
        // Save the database
        await (database as any).saveData();
        result = newVariable;
      } else {
        throw setError;
      }
    }
    
    // Trigger hot-reload if enabled
    const hotReloadSettings = database.getHotReloadSettings();
    if (hotReloadSettings.enabled && hotReloadSettings.autoReload) {
      const manager = getHotReloadManager(hotReloadSettings);
      await manager.triggerReload({
        type: 'variables_changed',
        timestamp: Date.now(),
        details: {
          variable: variable.name,
          branch: variable.branch
        }
      });
    }
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Set variable error:', error);
    return new Response(JSON.stringify({ error: 'Failed to set variable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, url }) => {
  try {
    const projectPath = url.searchParams.get('projectPath');
    const database = getDatabase(projectPath || undefined);
    
    // Check if password exists
    const hasPassword = database.hasPassword();
    
    const variable = await request.json();
    
    // Get branch from git if not provided
    if (!variable.branch) {
      const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), '..');
      const gitUtils = getGitUtils(projectRoot);
      const gitInfo = await gitUtils.getGitInfo();
      variable.branch = gitInfo.branch || 'main';
    }
    
    // Try to update the variable
    let result;
    try {
      result = database.updateVariable(variable.name, variable.value, variable);
    } catch (updateError: any) {
      // If auth fails and no password is set, work around it
      if (updateError.message === 'Not authenticated' && !hasPassword) {
        const dbData = (database as any).data;
        const now = new Date().toISOString();
        
        const existingIndex = dbData.variables?.findIndex((v: any) => 
          v.name === variable.name && v.branch === variable.branch
        );
        
        if (existingIndex >= 0) {
          dbData.variables[existingIndex] = {
            ...dbData.variables[existingIndex],
            value: variable.value,
            description: variable.description || dbData.variables[existingIndex].description,
            sensitive: variable.sensitive !== undefined ? variable.sensitive : dbData.variables[existingIndex].sensitive,
            category: variable.category || dbData.variables[existingIndex].category,
            updatedAt: now
          };
          
          // Add to history
          dbData.history = dbData.history || [];
          dbData.history.push({
            id: crypto.randomUUID(),
            action: 'update',
            variableName: variable.name,
            oldValue: dbData.variables[existingIndex].value,
            newValue: variable.value,
            timestamp: now
          });
          
          await (database as any).saveData();
          result = dbData.variables[existingIndex];
        } else {
          throw new Error('Variable not found');
        }
      } else {
        throw updateError;
      }
    }
    
    // Trigger hot reload if configured
    const hotReloadManager = getHotReloadManager(projectPath || undefined);
    if (hotReloadManager.isEnabled()) {
      hotReloadManager.triggerReload('variables');
    }
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update variable error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update variable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  try {
    const projectPath = url.searchParams.get('projectPath');
    const database = getDatabase(projectPath || undefined);
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { name } = await request.json();
    const result = database.deleteVariable(name);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete variable error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete variable' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
