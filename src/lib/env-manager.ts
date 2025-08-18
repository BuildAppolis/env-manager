import type { DatabaseVariable } from '../types.js';

export interface EnvManagerConfig {
  apiBasePath?: string;
  projectRoot?: string;
}

export interface EnvManagerState {
  authenticated: boolean;
  variables: DatabaseVariable[];
  snapshots: any[];
  currentTab: string;
}

export interface ExportResult {
  success: boolean;
  message: string;
  path?: string;
}

export class EnvManager {
  private config: EnvManagerConfig;
  private state: EnvManagerState;

  constructor(config: EnvManagerConfig = {}) {
    this.config = {
      apiBasePath: config.apiBasePath || '/api',
      projectRoot: config.projectRoot || process.cwd(),
    };

    this.state = {
      authenticated: false,
      variables: [],
      snapshots: [],
      currentTab: 'variables',
    };
  }

  async init(): Promise<void> {
    await this.checkAuthStatus();
    if (this.state.authenticated) {
      await this.loadData();
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/auth`);
      const data = await response.json();
      this.state.authenticated = data.authenticated;
      return this.state.authenticated;
    } catch (error) {
      console.error('Auth check failed:', error);
      this.state.authenticated = false;
      return false;
    }
  }

  async authenticate(password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.state.authenticated = true;
        await this.loadData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async loadData(): Promise<void> {
    await this.loadVariables();
  }

  async loadVariables(): Promise<DatabaseVariable[]> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/variables`);
      const data = await response.json();
      this.state.variables = data;
      return this.state.variables;
    } catch (error) {
      console.error('Failed to load variables:', error);
      return [];
    }
  }

  async saveVariable(variable: Partial<DatabaseVariable>): Promise<boolean> {
    try {
      const isEdit = this.state.variables.some(v => v.name === variable.name);
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(`${this.config.apiBasePath}/variables`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(variable)
      });

      if (response.ok) {
        await this.loadVariables();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save variable:', error);
      return false;
    }
  }

  async deleteVariable(name: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/variables`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        await this.loadVariables();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete variable:', error);
      return false;
    }
  }

  async exportEnvExample(): Promise<ExportResult> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'env-example' })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const error = await response.json();
        return { success: false, message: error.error };
      }
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, message: 'Failed to export .env.example' };
    }
  }

  async exportEnv(password: string): Promise<ExportResult> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          type: 'env',
          password: password 
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const error = await response.json();
        return { success: false, message: error.error };
      }
    } catch (error) {
      console.error('Export failed:', error);
      return { success: false, message: 'Failed to export .env' };
    }
  }

  async loadSnapshots(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/snapshots`);
      const data = await response.json();
      this.state.snapshots = data;
      return this.state.snapshots;
    } catch (error) {
      console.error('Failed to load snapshots:', error);
      return [];
    }
  }

  async createSnapshot(name: string, description?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/snapshots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description })
      });

      if (response.ok) {
        await this.loadSnapshots();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to create snapshot:', error);
      return false;
    }
  }

  async restoreSnapshot(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/snapshots/${id}/restore`, {
        method: 'POST'
      });

      if (response.ok) {
        await this.loadVariables();
        await this.loadSnapshots();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to restore snapshot:', error);
      return false;
    }
  }

  async deleteSnapshot(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/snapshots/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await this.loadSnapshots();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
      return false;
    }
  }

  async loadProjectStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/project/status`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to load project status:', error);
      return null;
    }
  }

  async getVariableConfig(variableName: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiBasePath}/project/variable-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ variableName })
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get variable config:', error);
      return null;
    }
  }

  // Getters for state
  get isAuthenticated(): boolean {
    return this.state.authenticated;
  }

  get variables(): DatabaseVariable[] {
    return this.state.variables;
  }

  get snapshots(): any[] {
    return this.state.snapshots;
  }

  get currentTab(): string {
    return this.state.currentTab;
  }

  set currentTab(tab: string) {
    this.state.currentTab = tab;
  }

  // Utility methods
  getFilteredVariables(searchTerm: string = '', category: string = ''): DatabaseVariable[] {
    return this.state.variables.filter(variable => {
      const matchesSearch = variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (variable.description && variable.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !category || variable.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }

  getVariablesByCategory(): Record<string, DatabaseVariable[]> {
    const categories: Record<string, DatabaseVariable[]> = {};
    
    for (const variable of this.state.variables) {
      const category = variable.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(variable);
    }

    return categories;
  }

  generateSecret(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Export a singleton instance for convenience
export const envManager = new EnvManager();

// Export the class for custom instances
export default EnvManager;
