import type { DatabaseVariable, ValidationResults, Snapshot } from '../types';

export class UIManager {
  private envManager: any; // Will be injected from the page
  
  constructor(envManager: any) {
    this.envManager = envManager;
  }

  init(): void {
    this.setupEventListeners();
    this.initAuth();
  }

  private async initAuth(): Promise<void> {
    const authenticated = await this.envManager.checkAuthStatus();
    this.updateAuthStatus(authenticated);
    
    if (authenticated) {
      this.showMainSection();
      await this.loadData();
    }
  }

  private setupEventListeners(): void {
    // Login form
    this.addFormListener('loginForm', async (data) => {
      const success = await this.envManager.authenticate(data.password);
      if (success) {
        this.updateAuthStatus(true);
        this.showMainSection();
        await this.loadData();
      } else {
        alert('Invalid password');
      }
    });

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        this.switchTab(target.dataset.tab || 'variables');
      });
    });

    // Variable management
    this.addClickListener('addVariableBtn', () => this.showVariableModal());
    this.addFormListener('variableForm', (data) => this.handleVariableSubmit(data));
    
    // Modal controls
    this.addClickListener('.close', () => this.hideModal('variableModal'));
    this.addClickListener('cancelBtn', () => this.hideModal('variableModal'));
    this.addClickListener('.close-password', () => this.hideModal('passwordModal'));
    this.addClickListener('cancelPasswordBtn', () => this.hideModal('passwordModal'));

    // Search and filter
    this.addInputListener('searchFilter', () => this.filterVariables());
    this.addChangeListener('categoryFilter', () => this.filterVariables());

    // Snapshots
    this.addClickListener('createSnapshotBtn', () => this.createSnapshot());
    this.addClickListener('refreshProjectBtn', () => this.loadProjectStatus());

    // Export
    this.addClickListener('exportExampleBtn', () => this.exportEnvExample());
    this.addClickListener('exportEnvBtn', () => this.showModal('passwordModal'));
    this.addFormListener('passwordForm', (data) => this.handlePasswordConfirmation(data));
  }

  private addClickListener(selector: string, handler: () => void): void {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener('click', handler);
    }
  }

  private addInputListener(id: string, handler: () => void): void {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', handler);
    }
  }

  private addChangeListener(id: string, handler: () => void): void {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', handler);
    }
  }

  private addFormListener(id: string, handler: (data: any) => void): void {
    const form = document.getElementById(id) as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data: any = {};
        formData.forEach((value, key) => {
          data[key] = key === 'sensitive' ? value === 'on' : value;
        });
        await handler(data);
      });
    }
  }

  private updateAuthStatus(authenticated: boolean): void {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    if (statusIndicator && statusText) {
      statusIndicator.textContent = authenticated ? '🔓' : '🔒';
      statusText.textContent = authenticated ? 'Authenticated' : 'Not Authenticated';
    }
  }

  private showMainSection(): void {
    const loginSection = document.getElementById('loginSection');
    const mainSection = document.getElementById('mainSection');
    
    if (loginSection) loginSection.style.display = 'none';
    if (mainSection) mainSection.style.display = 'block';
  }

  private switchTab(tabName: string): void {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`)?.classList.add('active');

    this.envManager.currentTab = tabName;

    // Load data for specific tabs
    if (tabName === 'snapshots') {
      this.loadSnapshots();
    } else if (tabName === 'project') {
      this.loadProjectStatus();
    }
  }

  private async loadData(): Promise<void> {
    await this.loadVariables();
    if (this.envManager.currentTab === 'snapshots') {
      await this.loadSnapshots();
    } else if (this.envManager.currentTab === 'project') {
      await this.loadProjectStatus();
    }
  }

  private async loadVariables(): Promise<void> {
    const variables = await this.envManager.loadVariables();
    this.renderVariables(variables);
  }

  private renderVariables(variables: DatabaseVariable[]): void {
    const container = document.getElementById('variablesList');
    if (!container) return;
    
    container.innerHTML = '';
    const filteredVariables = this.getFilteredVariables(variables);

    filteredVariables.forEach(variable => {
      const item = this.createVariableItem(variable);
      container.appendChild(item);
    });
  }

  private createVariableItem(variable: DatabaseVariable): HTMLElement {
    const item = document.createElement('div');
    item.className = 'variable-item';
    
    const maskedValue = variable.sensitive ? 
      '*'.repeat(Math.min(variable.value.length, 20)) : 
      variable.value;

    item.innerHTML = `
      <div class="variable-info">
        <div class="variable-name">${variable.name}</div>
        <div class="variable-value">${maskedValue}</div>
        <div class="variable-meta">
          Category: ${variable.category || 'Other'} | 
          ${variable.sensitive ? 'Sensitive' : 'Public'} |
          Updated: ${new Date(variable.updatedAt).toLocaleDateString()}
        </div>
      </div>
      <div class="variable-actions">
        <button class="btn-secondary edit-btn" data-name="${variable.name}">Edit</button>
        <button class="btn-danger delete-btn" data-name="${variable.name}">Delete</button>
      </div>
    `;

    // Add event listeners
    item.querySelector('.edit-btn')?.addEventListener('click', () => {
      this.editVariable(variable.name);
    });

    item.querySelector('.delete-btn')?.addEventListener('click', () => {
      this.deleteVariable(variable.name);
    });
    
    return item;
  }

  private getFilteredVariables(variables: DatabaseVariable[]): DatabaseVariable[] {
    const searchInput = document.getElementById('searchFilter') as HTMLInputElement;
    const categorySelect = document.getElementById('categoryFilter') as HTMLSelectElement;
    
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const categoryFilter = categorySelect?.value || '';

    return this.envManager.getFilteredVariables(searchTerm, categoryFilter);
  }

  private filterVariables(): void {
    this.loadVariables();
  }

  private showVariableModal(variable?: DatabaseVariable): void {
    const modal = document.getElementById('variableModal');
    const form = document.getElementById('variableForm') as HTMLFormElement;
    const title = document.getElementById('modalTitle');
    
    if (!modal || !form || !title) return;
    
    if (variable) {
      title.textContent = 'Edit Variable';
      this.fillVariableForm(variable);
    } else {
      title.textContent = 'Add Variable';
      form.reset();
      (document.getElementById('varName') as HTMLInputElement).readOnly = false;
    }
    
    this.showModal('variableModal');
  }

  private fillVariableForm(variable: DatabaseVariable): void {
    (document.getElementById('varName') as HTMLInputElement).value = variable.name;
    (document.getElementById('varValue') as HTMLTextAreaElement).value = variable.value;
    (document.getElementById('varCategory') as HTMLSelectElement).value = variable.category || 'other';
    (document.getElementById('varDescription') as HTMLTextAreaElement).value = variable.description || '';
    (document.getElementById('varSensitive') as HTMLInputElement).checked = variable.sensitive || false;
    (document.getElementById('varName') as HTMLInputElement).readOnly = true;
  }

  private async handleVariableSubmit(data: any): Promise<void> {
    const success = await this.envManager.saveVariable(data);
    if (success) {
      this.hideModal('variableModal');
      await this.loadVariables();
    } else {
      alert('Failed to save variable');
    }
  }

  private async editVariable(name: string): Promise<void> {
    const variable = this.envManager.variables.find((v: DatabaseVariable) => v.name === name);
    if (variable) {
      this.showVariableModal(variable);
    }
  }

  private async deleteVariable(name: string): Promise<void> {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    const success = await this.envManager.deleteVariable(name);
    if (success) {
      await this.loadVariables();
    } else {
      alert('Failed to delete variable');
    }
  }

  private async loadSnapshots(): Promise<void> {
    const snapshots = await this.envManager.loadSnapshots();
    this.renderSnapshots(snapshots);
  }

  private renderSnapshots(snapshots: Snapshot[]): void {
    const container = document.getElementById('snapshotsList');
    if (!container) return;
    
    container.innerHTML = '';

    snapshots.forEach(snapshot => {
      const item = this.createSnapshotItem(snapshot);
      container.appendChild(item);
    });
  }

  private createSnapshotItem(snapshot: Snapshot): HTMLElement {
    const item = document.createElement('div');
    item.className = 'snapshot-item';
    
    item.innerHTML = `
      <div class="snapshot-info">
        <div class="snapshot-name">${snapshot.name}</div>
        <div class="snapshot-meta">
          ${snapshot.description} | 
          ${snapshot.variables.length} variables |
          Created: ${new Date(snapshot.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div class="snapshot-actions">
        <button class="btn-secondary restore-btn" data-id="${snapshot.id}">Restore</button>
        <button class="btn-danger delete-snapshot-btn" data-id="${snapshot.id}">Delete</button>
      </div>
    `;

    // Add event listeners
    item.querySelector('.restore-btn')?.addEventListener('click', () => {
      this.restoreSnapshot(snapshot.id);
    });

    item.querySelector('.delete-snapshot-btn')?.addEventListener('click', () => {
      this.deleteSnapshot(snapshot.id);
    });
    
    return item;
  }

  private async createSnapshot(): Promise<void> {
    const name = prompt('Snapshot name:');
    if (!name) return;

    const description = prompt('Description (optional):') || '';
    
    const success = await this.envManager.createSnapshot(name, description);
    if (success) {
      await this.loadSnapshots();
    } else {
      alert('Failed to create snapshot');
    }
  }

  private async restoreSnapshot(id: string): Promise<void> {
    if (!confirm('Are you sure you want to restore this snapshot? Current variables will be backed up.')) {
      return;
    }

    const success = await this.envManager.restoreSnapshot(id);
    if (success) {
      await this.loadVariables();
      await this.loadSnapshots();
      alert('Snapshot restored successfully');
    } else {
      alert('Failed to restore snapshot');
    }
  }

  private async deleteSnapshot(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this snapshot?')) {
      return;
    }

    const success = await this.envManager.deleteSnapshot(id);
    if (success) {
      await this.loadSnapshots();
    } else {
      alert('Failed to delete snapshot');
    }
  }

  private async loadProjectStatus(): Promise<void> {
    const status = await this.envManager.loadProjectStatus();
    this.renderProjectStatus(status);
  }

  private renderProjectStatus(status: ValidationResults | null): void {
    const container = document.getElementById('projectStatus');
    if (!container) return;
    
    container.innerHTML = '';

    if (!status) {
      container.innerHTML = '<p>No project configuration found</p>';
      return;
    }

    // Create status elements
    const overallStatus = this.createOverallStatus(status);
    container.appendChild(overallStatus);

    // Group status
    Object.values(status.groups).forEach(group => {
      const groupElement = this.createGroupStatus(group);
      container.appendChild(groupElement);
    });
  }

  private createOverallStatus(status: ValidationResults): HTMLElement {
    const element = document.createElement('div');
    element.className = `status-group ${status.isValid ? 'valid' : 'invalid'}`;
    element.innerHTML = `
      <div class="group-header">
        <div class="group-name">Overall Project Status</div>
        <div class="group-status ${status.canStart ? 'valid' : 'invalid'}">
          ${status.canStart ? 'Ready to Start' : 'Not Ready'}
        </div>
      </div>
      <p>Project: ${status.projectName}</p>
      <p>Missing variables: ${status.missing.length}</p>
      <p>Invalid variables: ${status.invalid.length}</p>
    `;
    return element;
  }

  private createGroupStatus(group: any): HTMLElement {
    const element = document.createElement('div');
    element.className = `status-group ${group.configured ? 'valid' : 'invalid'}`;
    
    element.innerHTML = `
      <div class="group-header">
        <div class="group-name">${group.name}</div>
        <div class="group-status ${group.configured ? 'valid' : 'invalid'}">
          ${group.configured ? 'Configured' : 'Missing Variables'}
        </div>
      </div>
      <div class="variable-status">
        ${group.variables.map((variable: any) => `
          <div class="variable-status-item ${variable.valid ? 'valid' : 'invalid'}">
            <div class="variable-info">
              <span class="variable-name">${variable.name}</span>
              ${variable.errors.length > 0 ? `<span class="variable-errors">${variable.errors.join(', ')}</span>` : ''}
            </div>
            <div class="variable-actions">
              <span class="status-icon">${variable.valid ? '✅' : '❌'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    return element;
  }

  private async exportEnvExample(): Promise<void> {
    const result = await this.envManager.exportEnvExample();
    if (result.success) {
      alert('✅ ' + result.message);
    } else {
      alert('Failed to export .env.example: ' + result.message);
    }
  }

  private async handlePasswordConfirmation(data: any): Promise<void> {
    const result = await this.envManager.exportEnv(data.password);
    if (result.success) {
      this.hideModal('passwordModal');
      alert('✅ ' + result.message + '\n\n⚠️ Remember to set ENV_MANAGER_ENABLED=false in your config to use the exported .env file!');
    } else {
      alert('Failed to export .env: ' + result.message);
    }
  }

  private showModal(id: string): void {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'block';
    }
  }

  private hideModal(id: string): void {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'none';
    }
  }
}

export default UIManager;