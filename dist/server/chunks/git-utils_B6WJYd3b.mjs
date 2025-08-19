import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
class GitUtils {
  constructor(projectPath) {
    this.projectPath = projectPath || process.env.PROJECT_ROOT || process.cwd();
  }
  async getGitInfo() {
    const info = { isGitRepo: false };
    try {
      const gitDir = path.join(this.projectPath, ".git");
      if (!fs.existsSync(gitDir)) {
        return info;
      }
      info.isGitRepo = true;
      try {
        const { stdout: branch } = await execAsync("git rev-parse --abbrev-ref HEAD", {
          cwd: this.projectPath
        });
        info.branch = branch.trim();
      } catch (e) {
        info.branch = "unknown";
      }
      try {
        const { stdout: commit } = await execAsync("git rev-parse --short HEAD", {
          cwd: this.projectPath
        });
        info.commit = commit.trim();
      } catch (e) {
        info.commit = "unknown";
      }
      try {
        const { stdout: message } = await execAsync("git log -1 --pretty=%B", {
          cwd: this.projectPath
        });
        info.commitMessage = message.trim().split("\n")[0];
      } catch (e) {
        info.commitMessage = "";
      }
      try {
        const { stdout: author } = await execAsync("git log -1 --pretty=%an", {
          cwd: this.projectPath
        });
        info.author = author.trim();
      } catch (e) {
        info.author = "";
      }
      try {
        const { stdout: date } = await execAsync("git log -1 --pretty=%ai", {
          cwd: this.projectPath
        });
        info.lastCommitDate = date.trim();
      } catch (e) {
        info.lastCommitDate = "";
      }
      try {
        const { stdout: remote } = await execAsync("git config --get remote.origin.url", {
          cwd: this.projectPath
        });
        info.remoteUrl = this.sanitizeRemoteUrl(remote.trim());
      } catch (e) {
        info.remoteUrl = "";
      }
      try {
        const { stdout: status } = await execAsync("git status --porcelain", {
          cwd: this.projectPath
        });
        info.isDirty = status.trim().length > 0;
      } catch (e) {
        info.isDirty = false;
      }
      try {
        const { stdout: tracking } = await execAsync("git rev-list --left-right --count HEAD...@{u}", {
          cwd: this.projectPath
        });
        const [ahead, behind] = tracking.trim().split("	").map((n) => parseInt(n, 10));
        info.ahead = ahead || 0;
        info.behind = behind || 0;
      } catch (e) {
        info.ahead = 0;
        info.behind = 0;
      }
      try {
        const { stdout: tags } = await execAsync("git tag --points-at HEAD", {
          cwd: this.projectPath
        });
        info.tags = tags.trim().split("\n").filter((t) => t.length > 0);
      } catch (e) {
        info.tags = [];
      }
    } catch (error) {
      console.error("Error getting git info:", error);
    }
    return info;
  }
  async getAllBranches() {
    try {
      const { stdout } = await execAsync("git branch -a", {
        cwd: this.projectPath
      });
      return stdout.split("\n").map((b) => b.trim()).filter((b) => b.length > 0).map((b) => b.replace(/^\*\s+/, "")).map((b) => b.replace(/^remotes\/origin\//, "")).filter((b, i, arr) => arr.indexOf(b) === i);
    } catch (error) {
      console.error("Error getting branches:", error);
      return [];
    }
  }
  async switchBranch(branch) {
    try {
      await execAsync(`git checkout ${branch}`, {
        cwd: this.projectPath
      });
      return true;
    } catch (error) {
      console.error("Error switching branch:", error);
      return false;
    }
  }
  sanitizeRemoteUrl(url) {
    if (url.includes("@")) {
      return url.replace(/^.*@/, "https://");
    }
    return url;
  }
}
function getGitUtils(projectPath) {
  return new GitUtils(projectPath);
}

export { GitUtils as G, getGitUtils as g };
