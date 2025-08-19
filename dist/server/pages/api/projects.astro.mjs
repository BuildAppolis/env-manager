import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
export { renderers } from '../../renderers.mjs';

const execAsync = promisify(exec);
const registryPath = path.join(os.homedir(), ".env-manager", "projects.json");
function loadProjectRegistry() {
  try {
    if (!fs.existsSync(registryPath)) {
      return { projects: {}, activeProject: null };
    }
    return JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  } catch (error) {
    return { projects: {}, activeProject: null };
  }
}
async function checkProjectStatus(projectPath, port) {
  try {
    const response = await fetch(`http://localhost:${port}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}
async function getGitBranch(projectPath) {
  try {
    const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD", { cwd: projectPath });
    return stdout.trim();
  } catch {
    return null;
  }
}
const GET = async () => {
  try {
    const registry = loadProjectRegistry();
    const projectsWithStatus = [];
    for (const [projectPath, project] of Object.entries(registry.projects)) {
      const isRunning = await checkProjectStatus(projectPath, project.port);
      const gitBranch = await getGitBranch(projectPath);
      const exists = fs.existsSync(projectPath);
      let packageInfo = null;
      const packageJsonPath = path.join(projectPath, "package.json");
      if (exists && fs.existsSync(packageJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
          packageInfo = {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description
          };
        } catch {
        }
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
    projectsWithStatus.sort(
      (a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
    );
    return new Response(JSON.stringify({
      projects: projectsWithStatus,
      activeProject: registry.activeProject
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error loading projects:", error);
    return new Response(JSON.stringify({ error: "Failed to load projects" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const { action, projectPath, port } = await request.json();
    if (action === "start") {
      const envManagerPath = path.join(__dirname, "..", "..", "..", "..");
      await new Promise((resolve, reject) => {
        const buildProcess = spawn("npm", ["run", "build"], {
          cwd: envManagerPath,
          env: {
            ...process.env,
            PROJECT_ROOT: projectPath
          }
        });
        buildProcess.on("close", (code) => {
          if (code === 0) resolve(void 0);
          else reject(new Error(`Build failed with code ${code}`));
        });
      });
      spawn("npm", ["start"], {
        cwd: envManagerPath,
        detached: true,
        stdio: "ignore",
        env: {
          ...process.env,
          PROJECT_ROOT: projectPath,
          PORT: port?.toString() || "3001"
        }
      }).unref();
      const registry = loadProjectRegistry();
      registry.activeProject = projectPath;
      if (registry.projects[projectPath]) {
        registry.projects[projectPath].lastAccessed = (/* @__PURE__ */ new Date()).toISOString();
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
      return new Response(JSON.stringify({ success: true, message: "Project started" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (action === "stop") {
      try {
        await execAsync(`lsof -ti:${port} | xargs kill -9`);
      } catch {
      }
      return new Response(JSON.stringify({ success: true, message: "Project stopped" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (action === "remove") {
      const registry = loadProjectRegistry();
      delete registry.projects[projectPath];
      if (registry.activeProject === projectPath) {
        registry.activeProject = null;
      }
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
      return new Response(JSON.stringify({ success: true, message: "Project removed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error managing project:", error);
    return new Response(JSON.stringify({ error: "Failed to manage project" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
