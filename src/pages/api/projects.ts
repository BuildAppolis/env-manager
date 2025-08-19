import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Project registry file path
const registryPath = path.join(os.homedir(), '.env-manager', 'projects.json');

interface ProjectInfo {
  name: string;
  path: string;
  port: number;
  wsPort: number;
  lastAccessed: string;
  hotReload: {
    enabled: boolean;
    autoReload: boolean;
    reloadDelay: number;
  };
  projectPassword?: {
    passwordHash: string;
    salt: string;
  };
}

interface ProjectRegistry {
  projects: Record<string, ProjectInfo>;
  activeProject: string | null;
}

function loadProjectRegistry(): ProjectRegistry {
  try {
    if (!fs.existsSync(registryPath)) {
      return { projects: {}, activeProject: null };
    }
    return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  } catch (error) {
    return { projects: {}, activeProject: null };
  }
}

async function checkProjectStatus(projectPath: string, port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function getGitBranch(projectPath: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: projectPath });
    return stdout.trim();
  } catch {
    return null;
  }
}

export const GET: APIRoute = async () => {
  try {
    const registry = loadProjectRegistry();
    const projectsWithStatus = [];

    for (const [projectPath, project] of Object.entries(registry.projects)) {
      // Check if project is running
      const isRunning = await checkProjectStatus(projectPath, project.port);
      
      // Get git branch if available
      const gitBranch = await getGitBranch(projectPath);
      
      // Check if project still exists
      const exists = fs.existsSync(projectPath);
      
      // Get package.json info if available
      let packageInfo = null;
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (exists && fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          packageInfo = {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description
          };
        } catch {}
      }
      
      projectsWithStatus.push({
        ...project,
        id: projectPath,
        isRunning,
        gitBranch,
        exists,
        packageInfo,
        hasProjectPassword: !!project.projectPassword,
        isActive: projectPath === registry.activeProject
      });
    }

    // Sort by last accessed date
    projectsWithStatus.sort((a, b) => 
      new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    );

    return new Response(JSON.stringify({
      projects: projectsWithStatus,
      activeProject: registry.activeProject
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error loading projects:', error);
    return new Response(JSON.stringify({ error: 'Failed to load projects' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { action, projectPath, port } = await request.json();
    
    if (action === 'start') {
      // Start the project
      const envManagerPath = path.join(__dirname, '..', '..', '..', '..');
      
      // Build first
      await new Promise((resolve, reject) => {
        const buildProcess = spawn('npm', ['run', 'build'], {
          cwd: envManagerPath,
          env: {
            ...process.env,
            PROJECT_ROOT: projectPath
          }
        });
        
        buildProcess.on('close', (code) => {
          if (code === 0) resolve(undefined);
          else reject(new Error(`Build failed with code ${code}`));
        });
      });
      
      // Start the server in background
      spawn('npm', ['start'], {
        cwd: envManagerPath,
        detached: true,
        stdio: 'ignore',
        env: {
          ...process.env,
          PROJECT_ROOT: projectPath,
          PORT: port?.toString() || '3001'
        }
      }).unref();
      
      // Update registry
      const registry = loadProjectRegistry();
      registry.activeProject = projectPath;
      if (registry.projects[projectPath]) {
        registry.projects[projectPath].lastAccessed = new Date().toISOString();
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
      
      return new Response(JSON.stringify({ success: true, message: 'Project started' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'stop') {
      // Stop the project by killing the process on the port
      try {
        await execAsync(`lsof -ti:${port} | xargs kill -9`);
      } catch {
        // Process might not be running
      }
      
      return new Response(JSON.stringify({ success: true, message: 'Project stopped' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'remove') {
      // Remove project from registry
      const registry = loadProjectRegistry();
      delete registry.projects[projectPath];
      if (registry.activeProject === projectPath) {
        registry.activeProject = null;
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
      
      return new Response(JSON.stringify({ success: true, message: 'Project removed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error managing project:', error);
    return new Response(JSON.stringify({ error: 'Failed to manage project' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};