import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, X, Play, Square, FolderOpen, Lock, Unlock, RefreshCw, Key, GitBranch, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  path: string;
  port: number;
  isRunning: boolean;
  gitBranch: string | null;
  exists: boolean;
  packageInfo: {
    name: string;
    version: string;
    description?: string;
  } | null;
  hasProjectPassword: boolean;
  isActive: boolean;
  lastAccessed: string;
}

interface ProjectSelectorProps {
  onProjectSelect?: (project: Project) => void;
}

export default function ProjectSelector({ onProjectSelect }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMode, setPasswordMode] = useState<'setup' | 'verify' | 'change' | 'recover'>('setup');
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    newPassword: '',
    confirmPassword: '',
    recoveryPhrase: '',
    projectPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [hasGlobalPassword, setHasGlobalPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProjects();
    checkPasswordStatus();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStatus = async () => {
    try {
      const response = await fetch('/api/password');
      const data = await response.json();
      setHasGlobalPassword(data.hasGlobalPassword);
      
      // If no global password, show setup modal
      if (!data.hasGlobalPassword) {
        setPasswordMode('setup');
        setShowPasswordModal(true);
      }
    } catch (error) {
      console.error('Failed to check password status:', error);
    }
  };

  const handleProjectSelect = async (project: Project) => {
    setSelectedProject(project);
    
    // Check if authentication is required
    if (hasGlobalPassword || project.hasProjectPassword) {
      setPasswordMode('verify');
      setShowPasswordModal(true);
    } else {
      // No password required, proceed
      if (onProjectSelect) {
        onProjectSelect(project);
      }
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordError('');
    
    try {
      if (passwordMode === 'setup') {
        // Setup new global password
        if (passwordForm.password !== passwordForm.confirmPassword) {
          setPasswordError('Passwords do not match');
          return;
        }
        
        const response = await fetch('/api/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'setup',
            password: passwordForm.password
          })
        });
        
        const data = await response.json();
        if (!response.ok) {
          setPasswordError(data.error);
          return;
        }
        
        setRecoveryPhrase(data.recoveryPhrase);
        setHasGlobalPassword(true);
        alert(`Password set! Your recovery phrase is:\n\n${data.recoveryPhrase}\n\nSAVE THIS PHRASE! You'll need it to recover your password.`);
        setShowPasswordModal(false);
        resetPasswordForm();
      }
      
      if (passwordMode === 'verify') {
        // Verify password
        const response = await fetch('/api/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify',
            password: passwordForm.password,
            projectPath: selectedProject?.path
          })
        });
        
        const data = await response.json();
        if (!response.ok || !data.valid) {
          setPasswordError('Invalid password');
          return;
        }
        
        // Check if project password is also required
        if (data.requiresProjectPassword && !data.projectValid) {
          setPasswordError('Project password required');
          return;
        }
        
        setShowPasswordModal(false);
        resetPasswordForm();
        
        // Proceed with project selection
        if (selectedProject && onProjectSelect) {
          onProjectSelect(selectedProject);
        }
      }
      
      if (passwordMode === 'change') {
        // Change password
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          setPasswordError('New passwords do not match');
          return;
        }
        
        const response = await fetch('/api/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'change',
            password: passwordForm.password,
            newPassword: passwordForm.newPassword
          })
        });
        
        const data = await response.json();
        if (!response.ok) {
          setPasswordError(data.error);
          return;
        }
        
        setRecoveryPhrase(data.recoveryPhrase);
        alert(`Password changed! Your new recovery phrase is:\n\n${data.recoveryPhrase}\n\nSAVE THIS PHRASE!`);
        setShowPasswordModal(false);
        resetPasswordForm();
      }
      
      if (passwordMode === 'recover') {
        // Recover password
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          setPasswordError('New passwords do not match');
          return;
        }
        
        const response = await fetch('/api/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'recover',
            recoveryPhrase: passwordForm.recoveryPhrase,
            newPassword: passwordForm.newPassword
          })
        });
        
        const data = await response.json();
        if (!response.ok) {
          setPasswordError(data.error);
          return;
        }
        
        setRecoveryPhrase(data.recoveryPhrase);
        alert(`Password recovered! Your new recovery phrase is:\n\n${data.recoveryPhrase}\n\nSAVE THIS PHRASE!`);
        setShowPasswordModal(false);
        resetPasswordForm();
      }
    } catch (error) {
      setPasswordError('Operation failed. Please try again.');
    }
  };

  const handleProjectAction = async (project: Project, action: 'start' | 'stop' | 'remove') => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          projectPath: project.path,
          port: project.port
        })
      });
      
      if (response.ok) {
        // Refresh project list
        await loadProjects();
      }
    } catch (error) {
      console.error(`Failed to ${action} project:`, error);
    }
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      password: '',
      newPassword: '',
      confirmPassword: '',
      recoveryPhrase: '',
      projectPassword: ''
    });
    setPasswordError('');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-yellow-400">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="pixel-borders bg-gray-900 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-yellow-400 flex items-center gap-2">
          <FolderOpen className="w-6 h-6" />
          Projects
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className={`pixel-button bg-blue-600 hover:bg-blue-700 text-white p-2 ${refreshing ? 'animate-spin' : ''}`}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {hasGlobalPassword && (
            <button
              onClick={() => {
                setPasswordMode('change');
                setShowPasswordModal(true);
              }}
              className="pixel-button bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Change Password
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="mb-2">No projects found</p>
          <p className="text-sm">Run "env-manager init" in a project directory to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`pixel-borders bg-gray-800 p-4 rounded-lg transition-all hover:bg-gray-700 ${
                project.isActive ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg text-cyan-400">
                      {project.packageInfo?.name || project.name}
                    </h3>
                    {project.isRunning && (
                      <span className="flex items-center gap-1 text-green-400 text-xs">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    )}
                    {project.gitBranch && (
                      <span className="flex items-center gap-1 text-purple-400 text-xs">
                        <GitBranch className="w-3 h-3" />
                        {project.gitBranch}
                      </span>
                    )}
                    {project.hasProjectPassword && (
                      <Lock className="w-4 h-4 text-yellow-400" title="Project password protected" />
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 space-y-1">
                    {project.packageInfo?.version && (
                      <p>Version: {project.packageInfo.version}</p>
                    )}
                    <p className="truncate" title={`Full path: ${project.path}`}>
                      Path: {project.path}
                    </p>
                    <p>Port: {project.port}</p>
                    <p>Last accessed: {new Date(project.lastAccessed).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {project.exists ? (
                    <>
                      <button
                        onClick={() => handleProjectSelect(project)}
                        className="pixel-button bg-green-600 hover:bg-green-700 text-white p-2"
                        title="Open project"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
                      
                      {project.isRunning ? (
                        <button
                          onClick={() => handleProjectAction(project, 'stop')}
                          className="pixel-button bg-red-600 hover:bg-red-700 text-white p-2"
                          title="Stop project"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleProjectAction(project, 'start')}
                          className="pixel-button bg-blue-600 hover:bg-blue-700 text-white p-2"
                          title="Start project"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleProjectAction(project, 'remove')}
                      className="pixel-button bg-red-600 hover:bg-red-700 text-white p-2"
                      title="Remove from list (project not found)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="pixel-borders bg-gray-900 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl text-yellow-400 mb-4">
              {passwordMode === 'setup' && '🔐 Setup Master Password'}
              {passwordMode === 'verify' && '🔓 Enter Password'}
              {passwordMode === 'change' && '🔄 Change Password'}
              {passwordMode === 'recover' && '🔑 Recover Password'}
            </h3>

            {passwordError && (
              <div className="mb-4 p-2 bg-red-900 border border-red-400 rounded text-red-300 text-sm">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              {passwordMode === 'recover' ? (
                <>
                  <div>
                    <label className="block text-cyan-400 text-sm mb-1">
                      Recovery Phrase
                    </label>
                    <input
                      type="text"
                      value={passwordForm.recoveryPhrase}
                      onChange={(e) => setPasswordForm({ ...passwordForm, recoveryPhrase: e.target.value })}
                      className="pixel-input w-full bg-gray-800 text-white p-2 rounded"
                      placeholder="Enter your recovery phrase"
                    />
                  </div>
                </>
              ) : (
                <>
                  {(passwordMode === 'verify' || passwordMode === 'change') && (
                    <div>
                      <label className="block text-cyan-400 text-sm mb-1">
                        {passwordMode === 'change' ? 'Current Password' : 'Password'}
                      </label>
                      <input
                        type="password"
                        value={passwordForm.password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                        className="pixel-input w-full bg-gray-800 text-white p-2 rounded"
                        placeholder="Enter password"
                      />
                    </div>
                  )}
                </>
              )}

              {(passwordMode === 'setup' || passwordMode === 'change' || passwordMode === 'recover') && (
                <>
                  <div>
                    <label className="block text-cyan-400 text-sm mb-1">
                      {passwordMode === 'setup' ? 'Password' : 'New Password'}
                    </label>
                    <input
                      type="password"
                      value={passwordMode === 'setup' ? passwordForm.password : passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ 
                        ...passwordForm, 
                        [passwordMode === 'setup' ? 'password' : 'newPassword']: e.target.value 
                      })}
                      className="pixel-input w-full bg-gray-800 text-white p-2 rounded"
                      placeholder="Enter new password (min 6 chars)"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan-400 text-sm mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="pixel-input w-full bg-gray-800 text-white p-2 rounded"
                      placeholder="Confirm password"
                    />
                  </div>
                </>
              )}

              {selectedProject?.hasProjectPassword && passwordMode === 'verify' && (
                <div>
                  <label className="block text-cyan-400 text-sm mb-1">
                    Project Password (if different)
                  </label>
                  <input
                    type="password"
                    value={passwordForm.projectPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, projectPassword: e.target.value })}
                    className="pixel-input w-full bg-gray-800 text-white p-2 rounded"
                    placeholder="Enter project-specific password"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              {passwordMode === 'verify' && (
                <button
                  onClick={() => {
                    setPasswordMode('recover');
                    resetPasswordForm();
                  }}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Forgot password?
                </button>
              )}
              
              <div className="flex gap-2 ml-auto">
                {passwordMode !== 'setup' && (
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      resetPasswordForm();
                    }}
                    className="pixel-button bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handlePasswordSubmit}
                  className="pixel-button bg-green-600 hover:bg-green-700 text-white px-4 py-2"
                >
                  {passwordMode === 'setup' && 'Setup Password'}
                  {passwordMode === 'verify' && 'Unlock'}
                  {passwordMode === 'change' && 'Change Password'}
                  {passwordMode === 'recover' && 'Reset Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}