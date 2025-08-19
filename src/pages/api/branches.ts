import type { APIRoute } from 'astro';
import { getDatabase } from '../../lib/session.js';
import { getGitUtils } from '../../lib/git-utils.js';
import path from 'path';

export const GET: APIRoute = async ({ request }) => {
  try {
    const database = getDatabase();
    
    // No auth required for reading git branches - it's just local filesystem info
    const url = new URL(request.url);
    const projectPath = url.searchParams.get('projectPath');
    const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), '..');
    const gitUtils = getGitUtils(projectRoot);
    
    // Get all branches from git
    const gitBranches = await gitUtils.getAllBranches();
    
    // Get branches that have variables
    const dbBranches = database.getBranches();
    
    // Get current branch info
    const gitInfo = await gitUtils.getGitInfo();
    
    const response = {
      current: gitInfo.branch || 'main',
      gitBranches,
      dbBranches,
      gitInfo
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get branches error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get branches' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const database = getDatabase();
    
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { action, branch } = await request.json();
    const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd(), '..');
    const gitUtils = getGitUtils(projectRoot);
    
    switch (action) {
      case 'switch':
        const success = await gitUtils.switchBranch(branch);
        if (success) {
          return new Response(JSON.stringify({ 
            success: true,
            message: `Switched to branch ${branch}`
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({ 
            error: `Failed to switch to branch ${branch}`
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
      case 'copy':
        // Copy variables from one branch to another
        const { sourceBranch, targetBranch } = await request.json();
        const sourceVars = database.getVariablesByBranch(sourceBranch);
        
        for (const variable of sourceVars) {
          database.setVariable(variable.name, variable.value, {
            ...variable,
            branch: targetBranch
          });
        }
        
        return new Response(JSON.stringify({ 
          success: true,
          message: `Copied ${sourceVars.length} variables from ${sourceBranch} to ${targetBranch}`
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
  } catch (error) {
    console.error('Branch operation error:', error);
    return new Response(JSON.stringify({ error: 'Branch operation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};