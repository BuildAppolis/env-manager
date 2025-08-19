import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export interface GitInfo {
  isGitRepo: boolean
  branch?: string
  commit?: string
  commitMessage?: string
  author?: string
  remoteUrl?: string
  isDirty?: boolean
  ahead?: number
  behind?: number
  lastCommitDate?: string
  tags?: string[]
}

export class GitUtils {
  private projectPath: string

  constructor(projectPath?: string) {
    this.projectPath = projectPath || process.env.PROJECT_ROOT || process.cwd()
  }

  async getGitInfo(): Promise<GitInfo> {
    const info: GitInfo = { isGitRepo: false }

    try {
      // Check if it's a git repository
      const gitDir = path.join(this.projectPath, '.git')
      if (!fs.existsSync(gitDir)) {
        return info
      }

      info.isGitRepo = true

      // Get current branch
      try {
        const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', {
          cwd: this.projectPath
        })
        info.branch = branch.trim()
      } catch (e) {
        info.branch = 'unknown'
      }

      // Get current commit hash
      try {
        const { stdout: commit } = await execAsync('git rev-parse --short HEAD', {
          cwd: this.projectPath
        })
        info.commit = commit.trim()
      } catch (e) {
        info.commit = 'unknown'
      }

      // Get commit message
      try {
        const { stdout: message } = await execAsync('git log -1 --pretty=%B', {
          cwd: this.projectPath
        })
        info.commitMessage = message.trim().split('\n')[0] // First line only
      } catch (e) {
        info.commitMessage = ''
      }

      // Get author
      try {
        const { stdout: author } = await execAsync('git log -1 --pretty=%an', {
          cwd: this.projectPath
        })
        info.author = author.trim()
      } catch (e) {
        info.author = ''
      }

      // Get last commit date
      try {
        const { stdout: date } = await execAsync('git log -1 --pretty=%ai', {
          cwd: this.projectPath
        })
        info.lastCommitDate = date.trim()
      } catch (e) {
        info.lastCommitDate = ''
      }

      // Get remote URL
      try {
        const { stdout: remote } = await execAsync('git config --get remote.origin.url', {
          cwd: this.projectPath
        })
        info.remoteUrl = this.sanitizeRemoteUrl(remote.trim())
      } catch (e) {
        info.remoteUrl = ''
      }

      // Check if working directory is dirty
      try {
        const { stdout: status } = await execAsync('git status --porcelain', {
          cwd: this.projectPath
        })
        info.isDirty = status.trim().length > 0
      } catch (e) {
        info.isDirty = false
      }

      // Get ahead/behind status
      try {
        const { stdout: tracking } = await execAsync('git rev-list --left-right --count HEAD...@{u}', {
          cwd: this.projectPath
        })
        const [ahead, behind] = tracking.trim().split('\t').map(n => parseInt(n, 10))
        info.ahead = ahead || 0
        info.behind = behind || 0
      } catch (e) {
        // No upstream branch
        info.ahead = 0
        info.behind = 0
      }

      // Get tags at current commit
      try {
        const { stdout: tags } = await execAsync('git tag --points-at HEAD', {
          cwd: this.projectPath
        })
        info.tags = tags.trim().split('\n').filter(t => t.length > 0)
      } catch (e) {
        info.tags = []
      }

    } catch (error) {
      console.error('Error getting git info:', error)
    }

    return info
  }

  async getAllBranches(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git branch -a', {
        cwd: this.projectPath
      })
      
      return stdout
        .split('\n')
        .map(b => b.trim())
        .filter(b => b.length > 0)
        .map(b => b.replace(/^\*\s+/, '')) // Remove current branch marker
        .map(b => b.replace(/^remotes\/origin\//, '')) // Clean remote branch names
        .filter((b, i, arr) => arr.indexOf(b) === i) // Remove duplicates
    } catch (error) {
      console.error('Error getting branches:', error)
      return []
    }
  }

  async switchBranch(branch: string): Promise<boolean> {
    try {
      await execAsync(`git checkout ${branch}`, {
        cwd: this.projectPath
      })
      return true
    } catch (error) {
      console.error('Error switching branch:', error)
      return false
    }
  }

  private sanitizeRemoteUrl(url: string): string {
    // Remove credentials from URLs
    if (url.includes('@')) {
      return url.replace(/^.*@/, 'https://')
    }
    return url
  }
}

export function getGitUtils(projectPath?: string): GitUtils {
  return new GitUtils(projectPath)
}