import { v4 } from 'uuid';

class DraftManager {
  constructor(database) {
    this.currentDraft = null;
    this.versionHistory = [];
    this.db = database;
    this.loadVersionHistory();
  }
  // Draft Management
  createDraft(description, author) {
    this.currentDraft = {
      id: v4(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      changes: /* @__PURE__ */ new Map(),
      description,
      author
    };
    return this.currentDraft;
  }
  getCurrentDraft() {
    return this.currentDraft;
  }
  hasDraft() {
    return this.currentDraft !== null && this.currentDraft.changes.size > 0;
  }
  discardDraft() {
    this.currentDraft = null;
  }
  // Variable Draft Operations
  addVariableToDraft(variable, changeType = "update") {
    if (!this.currentDraft) {
      this.createDraft();
    }
    const originalVariable = this.db.getVariable(variable.name);
    const draftVariable = {
      ...variable,
      isDraft: true,
      originalValue: originalVariable?.value,
      changeType,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.currentDraft.changes.set(variable.name, draftVariable);
  }
  updateDraftVariable(name, updates) {
    if (!this.currentDraft || !this.currentDraft.changes.has(name)) {
      throw new Error("Variable not in draft or no draft session active");
    }
    const draftVar = this.currentDraft.changes.get(name);
    const updatedVar = {
      ...draftVar,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.currentDraft.changes.set(name, updatedVar);
  }
  removeDraftVariable(name) {
    if (!this.currentDraft) return;
    const existingVar = this.db.getVariable(name);
    if (existingVar) {
      this.addVariableToDraft({ ...existingVar }, "delete");
    } else {
      this.currentDraft.changes.delete(name);
    }
  }
  getDraftVariables() {
    if (!this.currentDraft) return [];
    return Array.from(this.currentDraft.changes.values());
  }
  getDraftChanges() {
    if (!this.currentDraft) return [];
    const changes = [];
    for (const draftVar of this.currentDraft.changes.values()) {
      const change = {
        name: draftVar.name,
        type: draftVar.changeType,
        oldValue: draftVar.originalValue,
        newValue: draftVar.changeType === "delete" ? void 0 : draftVar.value,
        sensitive: draftVar.sensitive || false
      };
      changes.push(change);
    }
    return changes;
  }
  // Publishing
  async publishDraft() {
    if (!this.currentDraft || this.currentDraft.changes.size === 0) {
      throw new Error("No draft changes to publish");
    }
    const changes = this.getDraftChanges();
    for (const change of changes) {
      const draftVar = this.currentDraft.changes.get(change.name);
      switch (change.type) {
        case "create":
        case "update":
          this.db.setVariable(draftVar.name, draftVar.value, {
            category: draftVar.category,
            description: draftVar.description,
            sensitive: draftVar.sensitive,
            branch: draftVar.branch,
            environment: draftVar.environment
          });
          break;
        case "delete":
          this.db.deleteVariable(draftVar.name);
          break;
      }
    }
    const versionEntry = {
      id: v4(),
      version: this.generateVersionNumber(),
      description: this.currentDraft.description || `Published ${changes.length} changes`,
      author: this.currentDraft.author,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      variableCount: this.db.getAllVariables().length,
      changes,
      published: true
    };
    this.versionHistory.unshift(versionEntry);
    this.saveVersionHistory();
    this.discardDraft();
    return versionEntry;
  }
  // Version History
  getVersionHistory() {
    return [...this.versionHistory];
  }
  getVersion(id) {
    return this.versionHistory.find((v) => v.id === id);
  }
  compareVersions(fromId, toId) {
    const fromVersion = this.getVersion(fromId);
    const toVersion = this.getVersion(toId);
    if (!fromVersion || !toVersion) {
      throw new Error("Version not found");
    }
    return toVersion.changes;
  }
  generateVersionNumber() {
    const now = /* @__PURE__ */ new Date();
    return `v${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, "0")}.${now.getDate().toString().padStart(2, "0")}.${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;
  }
  loadVersionHistory() {
    try {
      const historyData = this.db.getMetadata("versionHistory");
      if (historyData) {
        this.versionHistory = JSON.parse(historyData);
      }
    } catch (error) {
      console.warn("Failed to load version history:", error);
      this.versionHistory = [];
    }
  }
  saveVersionHistory() {
    try {
      this.db.setMetadata("versionHistory", JSON.stringify(this.versionHistory));
    } catch (error) {
      console.error("Failed to save version history:", error);
    }
  }
  // Restore from version
  async restoreFromVersion(versionId) {
    const version = this.getVersion(versionId);
    if (!version) {
      throw new Error("Version not found");
    }
    this.createDraft(`Restore from ${version.version}`);
    console.log(`Would restore from version ${version.version}`);
  }
}

export { DraftManager as D };
