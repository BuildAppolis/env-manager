import type { DraftVariable, DraftSession, VariableChange, VersionEntry, DatabaseVariable } from '../types.js'
import type EnvDatabase from './database.js'
import { v4 as uuidv4 } from 'uuid'

export class DraftManager {
  private db: EnvDatabase
  private currentDraft: DraftSession | null = null
  private versionHistory: VersionEntry[] = []

  constructor(database: EnvDatabase) {
    this.db = database
    this.loadVersionHistory()
  }

  // Draft Management
  createDraft(description?: string, author?: string): DraftSession {
    this.currentDraft = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      changes: new Map(),
      description,
      author
    }
    return this.currentDraft
  }

  getCurrentDraft(): DraftSession | null {
    return this.currentDraft
  }

  hasDraft(): boolean {
    return this.currentDraft !== null && this.currentDraft.changes.size > 0
  }

  discardDraft(): void {
    this.currentDraft = null
  }

  // Variable Draft Operations
  addVariableToDraft(variable: DatabaseVariable, changeType: 'create' | 'update' | 'delete' = 'update'): void {
    if (!this.currentDraft) {
      this.createDraft()
    }

    const originalVariable = this.db.getVariable(variable.name)
    
    const draftVariable: DraftVariable = {
      ...variable,
      isDraft: true,
      originalValue: originalVariable?.value,
      changeType,
      updatedAt: new Date().toISOString()
    }

    this.currentDraft!.changes.set(variable.name, draftVariable)
  }

  updateDraftVariable(name: string, updates: Partial<DatabaseVariable>): void {
    if (!this.currentDraft || !this.currentDraft.changes.has(name)) {
      throw new Error('Variable not in draft or no draft session active')
    }

    const draftVar = this.currentDraft.changes.get(name)!
    const updatedVar: DraftVariable = {
      ...draftVar,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.currentDraft.changes.set(name, updatedVar)
  }

  removeDraftVariable(name: string): void {
    if (!this.currentDraft) return
    
    const existingVar = this.db.getVariable(name)
    if (existingVar) {
      // Mark for deletion if it exists in database
      this.addVariableToDraft({ ...existingVar }, 'delete')
    } else {
      // Remove from draft if it was only added in draft
      this.currentDraft.changes.delete(name)
    }
  }

  getDraftVariables(): DraftVariable[] {
    if (!this.currentDraft) return []
    return Array.from(this.currentDraft.changes.values())
  }

  getDraftChanges(): VariableChange[] {
    if (!this.currentDraft) return []

    const changes: VariableChange[] = []
    
    for (const draftVar of this.currentDraft.changes.values()) {
      const change: VariableChange = {
        name: draftVar.name,
        type: draftVar.changeType,
        oldValue: draftVar.originalValue,
        newValue: draftVar.changeType === 'delete' ? undefined : draftVar.value,
        sensitive: draftVar.sensitive || false
      }
      changes.push(change)
    }

    return changes
  }

  // Publishing
  async publishDraft(): Promise<VersionEntry> {
    if (!this.currentDraft || this.currentDraft.changes.size === 0) {
      throw new Error('No draft changes to publish')
    }

    const changes = this.getDraftChanges()
    
    // Apply all changes to database
    for (const change of changes) {
      const draftVar = this.currentDraft.changes.get(change.name)!
      
      switch (change.type) {
        case 'create':
        case 'update':
          this.db.setVariable(draftVar.name, draftVar.value, {
            category: draftVar.category,
            description: draftVar.description,
            sensitive: draftVar.sensitive,
            branch: draftVar.branch,
            environment: draftVar.environment
          })
          break
        case 'delete':
          this.db.deleteVariable(draftVar.name)
          break
      }
    }

    // Create version entry
    const versionEntry: VersionEntry = {
      id: uuidv4(),
      version: this.generateVersionNumber(),
      description: this.currentDraft.description || `Published ${changes.length} changes`,
      author: this.currentDraft.author,
      timestamp: new Date().toISOString(),
      variableCount: this.db.getAllVariables().length,
      changes,
      published: true
    }

    // Add to version history
    this.versionHistory.unshift(versionEntry)
    this.saveVersionHistory()

    // Clear draft
    this.discardDraft()

    return versionEntry
  }

  // Version History
  getVersionHistory(): VersionEntry[] {
    return [...this.versionHistory]
  }

  getVersion(id: string): VersionEntry | undefined {
    return this.versionHistory.find(v => v.id === id)
  }

  compareVersions(fromId: string, toId: string): VariableChange[] {
    const fromVersion = this.getVersion(fromId)
    const toVersion = this.getVersion(toId)
    
    if (!fromVersion || !toVersion) {
      throw new Error('Version not found')
    }

    // This is a simplified comparison - in a real implementation,
    // you'd want to compare the actual variable states at those versions
    return toVersion.changes
  }

  private generateVersionNumber(): string {
    const now = new Date()
    return `v${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}.${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`
  }

  private loadVersionHistory(): void {
    try {
      const historyData = this.db.getMetadata('versionHistory')
      if (historyData) {
        this.versionHistory = JSON.parse(historyData)
      }
    } catch (error) {
      console.warn('Failed to load version history:', error)
      this.versionHistory = []
    }
  }

  private saveVersionHistory(): void {
    try {
      this.db.setMetadata('versionHistory', JSON.stringify(this.versionHistory))
    } catch (error) {
      console.error('Failed to save version history:', error)
    }
  }

  // Restore from version
  async restoreFromVersion(versionId: string): Promise<void> {
    const version = this.getVersion(versionId)
    if (!version) {
      throw new Error('Version not found')
    }

    // This would require storing full snapshots at each version
    // For now, we'll create a new draft with reverse changes
    this.createDraft(`Restore from ${version.version}`)
    
    // Note: This is a simplified implementation
    // A full implementation would need to store complete snapshots
    console.log(`Would restore from version ${version.version}`)
  }
}

export default DraftManager