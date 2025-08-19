import fs from 'fs/promises';
import fs$1 from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

class EnvDatabase {
  constructor(dbPath) {
    this.encryptionKey = null;
    const projectRoot = process.env.PROJECT_ROOT || process.cwd();
    this.dbPath = dbPath || path.join(projectRoot, "env-data.json");
    this.data = {
      variables: [],
      history: [],
      snapshots: [],
      auth: {
        isAuthenticated: false
      },
      metadata: {}
    };
    this.loadData();
    this.loadMasterPasswordIfNeeded();
  }
  async loadData() {
    try {
      const fileContent = await fs.readFile(this.dbPath, "utf-8");
      this.data = JSON.parse(fileContent);
    } catch (error) {
      await this.saveData();
    }
  }
  async saveData() {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error("Failed to save database:", error);
      throw error;
    }
  }
  generateSalt() {
    return crypto.randomBytes(16).toString("hex");
  }
  hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex");
  }
  deriveEncryptionKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1e4, 32, "sha512").toString("hex");
  }
  encrypt(text) {
    if (!this.encryptionKey) {
      return text;
    }
    const keyBuffer = typeof this.encryptionKey === "string" ? Buffer.from(this.encryptionKey, "hex").slice(0, 32) : this.encryptionKey;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }
  decrypt(encryptedText) {
    if (!this.encryptionKey) {
      return encryptedText;
    }
    if (!encryptedText.includes(":")) {
      return encryptedText;
    }
    const keyBuffer = typeof this.encryptionKey === "string" ? Buffer.from(this.encryptionKey, "hex").slice(0, 32) : this.encryptionKey;
    const [ivHex, encrypted] = encryptedText.split(":");
    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, Buffer.from(ivHex, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
  loadSecureCredentials() {
    try {
      const credPath = path.join(os.homedir(), ".env-manager", "credentials.json");
      if (fs$1.existsSync(credPath)) {
        const credentials = JSON.parse(fs$1.readFileSync(credPath, "utf-8"));
        return credentials;
      }
    } catch (error) {
      console.error("Failed to load secure credentials:", error);
    }
    return null;
  }
  loadMasterPasswordIfNeeded() {
    if (!this.data.auth.passwordHash && !this.data.auth.salt) {
      const masterCreds = this.loadSecureCredentials();
      if (masterCreds) {
        this.encryptionKey = masterCreds.encryptionKey;
        this.data.auth.isAuthenticated = true;
      }
    }
  }
  authenticate(password) {
    try {
      const secureCredentials = this.loadSecureCredentials();
      if (secureCredentials) {
        const hash2 = this.hashPassword(password, secureCredentials.salt);
        if (hash2 === secureCredentials.passwordHash) {
          this.data.auth.isAuthenticated = true;
          this.data.auth.lastAuth = Date.now();
          this.encryptionKey = secureCredentials.encryptionKey;
          this.saveData();
          return true;
        }
        return false;
      }
      if (!this.data.auth.passwordHash || !this.data.auth.salt) {
        const salt = this.generateSalt();
        const hash2 = this.hashPassword(password, salt);
        this.data.auth.salt = salt;
        this.data.auth.passwordHash = hash2;
        this.data.auth.isAuthenticated = true;
        this.data.auth.lastAuth = Date.now();
        this.encryptionKey = this.deriveEncryptionKey(password, salt);
        this.saveData();
        return true;
      }
      const hash = this.hashPassword(password, this.data.auth.salt);
      if (hash === this.data.auth.passwordHash) {
        this.data.auth.isAuthenticated = true;
        this.data.auth.lastAuth = Date.now();
        this.encryptionKey = this.deriveEncryptionKey(password, this.data.auth.salt);
        this.saveData();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Authentication error:", error);
      return false;
    }
  }
  isAuthenticated() {
    if (!this.data.auth.passwordHash && !this.data.auth.salt) {
      return true;
    }
    return this.data.auth.isAuthenticated && !!this.encryptionKey;
  }
  logout() {
    this.data.auth.isAuthenticated = false;
    this.encryptionKey = null;
    this.saveData();
  }
  setVariable(name, value, metadata = {}) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const branch = metadata.branch || "main";
    const existingIndex = this.data.variables.findIndex(
      (v) => v.name === name && (v.branch || "main") === branch
    );
    const variable = {
      name,
      value: metadata.sensitive ? this.encrypt(value) : value,
      category: metadata.category || "other",
      description: metadata.description || "",
      sensitive: metadata.sensitive || false,
      encrypted: (metadata.sensitive || false) && !!this.encryptionKey,
      branch: metadata.branch,
      environment: metadata.environment,
      createdAt: existingIndex >= 0 ? this.data.variables[existingIndex].createdAt : now,
      updatedAt: now
    };
    this.data.history.push({
      id: crypto.randomUUID(),
      action: existingIndex >= 0 ? "update" : "create",
      variableName: name,
      oldValue: existingIndex >= 0 ? this.data.variables[existingIndex].value : void 0,
      newValue: variable.value,
      timestamp: now
    });
    if (existingIndex >= 0) {
      this.data.variables[existingIndex] = variable;
    } else {
      this.data.variables.push(variable);
    }
    this.saveData();
    return variable;
  }
  updateVariable(name, value, metadata = {}) {
    return this.setVariable(name, value, metadata);
  }
  getVariable(name) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    const variable = this.data.variables.find((v) => v.name === name);
    if (!variable) return null;
    if (variable.encrypted && variable.sensitive) {
      return {
        ...variable,
        value: this.decrypt(variable.value)
      };
    }
    return variable;
  }
  getAllVariables(branch) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    const targetBranch = branch || "main";
    const branchVariables = this.data.variables.filter((v) => {
      const varBranch = v.branch || "main";
      return varBranch === targetBranch || targetBranch !== "main" && varBranch === "main";
    });
    const variableMap = /* @__PURE__ */ new Map();
    branchVariables.filter((v) => (v.branch || "main") === "main").forEach((v) => variableMap.set(v.name, v));
    if (targetBranch !== "main") {
      branchVariables.filter((v) => v.branch === targetBranch).forEach((v) => variableMap.set(v.name, v));
    }
    return Array.from(variableMap.values()).map((variable) => {
      if (variable.encrypted && variable.sensitive) {
        try {
          return {
            ...variable,
            value: this.decrypt(variable.value)
          };
        } catch (error) {
          console.error(`Failed to decrypt variable ${variable.name}:`, error);
          return {
            ...variable,
            value: "[DECRYPTION_FAILED]"
          };
        }
      }
      return variable;
    });
  }
  getVariablesByBranch(branch) {
    return this.getAllVariables(branch);
  }
  getBranches() {
    const branches = /* @__PURE__ */ new Set();
    this.data.variables.forEach((v) => {
      branches.add(v.branch || "main");
    });
    return Array.from(branches);
  }
  deleteVariable(name) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    const index = this.data.variables.findIndex((v) => v.name === name);
    if (index === -1) return false;
    const variable = this.data.variables[index];
    this.data.history.push({
      id: crypto.randomUUID(),
      action: "delete",
      variableName: name,
      oldValue: variable.value,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.data.variables.splice(index, 1);
    this.saveData();
    return true;
  }
  getHistory() {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    return this.data.history.slice().reverse();
  }
  createSnapshot(name, description) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    const snapshot = {
      id: crypto.randomUUID(),
      name,
      description: description || "",
      variables: JSON.parse(JSON.stringify(this.data.variables)),
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.snapshots.push(snapshot);
    this.saveData();
    return snapshot;
  }
  getSnapshots() {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    return this.data.snapshots.slice().reverse();
  }
  restoreSnapshot(snapshotId) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    const snapshot = this.data.snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) return false;
    this.createSnapshot(`Backup before restore ${snapshot.name}`, "Auto-created before snapshot restore");
    this.data.variables = JSON.parse(JSON.stringify(snapshot.variables));
    this.data.history.push({
      id: crypto.randomUUID(),
      action: "restore",
      variableName: `Snapshot: ${snapshot.name}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.saveData();
    return true;
  }
  deleteSnapshot(snapshotId) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    const index = this.data.snapshots.findIndex((s) => s.id === snapshotId);
    if (index === -1) return false;
    this.data.snapshots.splice(index, 1);
    this.saveData();
    return true;
  }
  generateEnvFile() {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    const variables = this.getAllVariables();
    const lines = [];
    const categories = /* @__PURE__ */ new Map();
    variables.forEach((variable) => {
      const category = variable.category || "other";
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category).push(variable);
    });
    categories.forEach((vars, category) => {
      lines.push(`# ${category.toUpperCase()}`);
      vars.forEach((variable) => {
        if (variable.description) {
          lines.push(`# ${variable.description}`);
        }
        lines.push(`${variable.name}=${variable.value}`);
      });
      lines.push("");
    });
    return lines.join("\n");
  }
  generateEnvExample() {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    const variables = this.getAllVariables();
    const lines = [];
    const categories = /* @__PURE__ */ new Map();
    variables.forEach((variable) => {
      const category = variable.category || "other";
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category).push(variable);
    });
    categories.forEach((vars, category) => {
      lines.push(`# ${category.toUpperCase()}`);
      vars.forEach((variable) => {
        if (variable.description) {
          lines.push(`# ${variable.description}`);
        }
        const placeholder = variable.sensitive ? "your_secret_here" : variable.value || "your_value_here";
        lines.push(`${variable.name}=${placeholder}`);
      });
      lines.push("");
    });
    return lines.join("\n");
  }
  // Hot-reload settings management
  getHotReloadSettings() {
    if (!this.data.hotReload) {
      this.data.hotReload = {
        enabled: true,
        autoReload: true,
        reloadDelay: 1e3,
        wsPort: 3002,
        notifyOnly: false
      };
      this.saveData();
    }
    return this.data.hotReload;
  }
  setHotReloadSettings(settings) {
    this.data.hotReload = {
      ...this.getHotReloadSettings(),
      ...settings
    };
    this.saveData();
  }
  // Metadata methods for draft/publish system
  getMetadata(key) {
    return this.data.metadata?.[key];
  }
  setMetadata(key, value) {
    if (!this.data.metadata) {
      this.data.metadata = {};
    }
    this.data.metadata[key] = value;
    this.saveData();
  }
  deleteMetadata(key) {
    if (this.data.metadata) {
      delete this.data.metadata[key];
      this.saveData();
    }
  }
  getAllMetadata() {
    return { ...this.data.metadata };
  }
}

const databaseInstances = /* @__PURE__ */ new Map();
function getDatabase(projectPath) {
  const key = projectPath || "default";
  if (!databaseInstances.has(key)) {
    const dbPath = projectPath ? `${projectPath}/env-data.json` : void 0;
    const db = new EnvDatabase(dbPath);
    if (projectPath) {
      process.env.PROJECT_ROOT = projectPath;
    }
    databaseInstances.set(key, db);
  }
  return databaseInstances.get(key);
}

export { EnvDatabase as E, getDatabase as g };
