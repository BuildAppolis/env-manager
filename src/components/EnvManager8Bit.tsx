import React, { useState, useEffect } from 'react'
import { Button } from './ui/8bit/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/8bit/card'
import { Input } from './ui/8bit/input'
import { Label } from './ui/8bit/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/8bit/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/8bit/select'
import { Lock, Unlock, Save, Download, Upload, RefreshCw, Shield, Settings, Terminal, Key, Database, Clock, FolderOpen, History, FileEdit, Import, FileInput, FileOutput } from 'lucide-react'
import ProjectSelector from './ProjectSelector'
import MissingVariableItem from './MissingVariableItem'
import VersionHistory from './VersionHistory'
import DraftMode from './DraftMode'
import ImportExportDialog from './ImportExportDialog'
import type { ValidationResults, GroupResult, VariableResult } from '../types'

interface Variable {
  name: string
  value: string
  encrypted: boolean
  description?: string
}


interface EnvManagerProps {
  project?: any;
  onBack?: () => void;
  skipAuth?: boolean;
  onBranchChange?: (branch: string) => void;
  initialBranch?: string;
}

export default function EnvManager8Bit({ project, onBack, skipAuth = false, onBranchChange, initialBranch }: EnvManagerProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(skipAuth)
  const [activeTab, setActiveTab] = useState<'variables' | 'draft' | 'history'>('variables')
  const [password, setPassword] = useState('')
  const [branches, setBranches] = useState<string[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch || 'main')
  const [variables, setVariables] = useState<Variable[]>([])
  const [newVar, setNewVar] = useState({ name: '', value: '', type: 'server', description: '', sensitive: false })
  const [isLoading, setIsLoading] = useState(false)
  const [deletingVariable, setDeletingVariable] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [currentProject, setCurrentProject] = useState<any>(project || null)
  const [projectStatus, setProjectStatus] = useState<ValidationResults | null>(null)
  const [showImportExport, setShowImportExport] = useState(false)

  useEffect(() => {
    if (!skipAuth) {
      checkAuthStatus()
    } else if (project) {
      loadBranches()
      loadProjectStatus()
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
      if (data.authenticated) {
        loadBranches()
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      if (res.ok) {
        setIsAuthenticated(true)
        setPassword('')
        loadBranches()
        // Play success sound
        playSound('success')
      } else {
        setError('Invalid password')
        playSound('error')
      }
    } catch (err) {
      setError('Login failed')
      playSound('error')
    }
    setIsLoading(false)
  }

  const loadBranches = async () => {
    try {
      // Pass project path if available
      const url = currentProject?.path 
        ? `/api/branches?projectPath=${encodeURIComponent(currentProject.path)}`
        : '/api/branches'
      const res = await fetch(url)
      if (!res.ok) {
        console.error('Failed to load branches:', res.status)
        return
      }
      const data = await res.json()
      
      // Check if it's a git repo
      let branchList: string[] = []
      if (data.gitInfo?.isGitRepo && data.gitBranches?.length > 0) {
        // Use git branches if available
        branchList = data.gitBranches
      } else {
        // Non-git project - use default environments
        branchList = ['development', 'staging', 'production']
      }
      
      setBranches(branchList)
      
      // Set current/default branch as selected
      const defaultBranch = data.current || branchList[0] || 'development'
      setSelectedBranch(defaultBranch)
      loadVariables(defaultBranch)
    } catch (err) {
      console.error('Failed to load branches:', err)
      // Fallback to default branches
      const defaultBranches = ['development', 'staging', 'production']
      setBranches(defaultBranches)
      setSelectedBranch(defaultBranches[0])
      loadVariables(defaultBranches[0])
    }
  }

  const loadProjectStatus = async () => {
    if (!currentProject?.path) return
    
    try {
      const url = `/api/project/status?projectPath=${encodeURIComponent(currentProject.path)}`
      const res = await fetch(url)
      if (res.ok) {
        const status = await res.json()
        setProjectStatus(status)
      }
    } catch (err) {
      console.error('Failed to load project status:', err)
    }
  }

  const loadVariables = async (branch: string) => {
    try {
      let url = `/api/variables?branch=${branch}`
      if (currentProject?.path) {
        url += `&projectPath=${encodeURIComponent(currentProject.path)}`
      }
      const res = await fetch(url)
      if (!res.ok) {
        console.error('Failed to load variables:', res.status)
        setVariables([])
        return
      }
      const data = await res.json()
      setVariables(data.variables || [])
    } catch (err) {
      console.error('Failed to load variables:', err)
      setVariables([])
    }
  }

  // Optimized version that doesn't block UI
  const refreshVariables = () => {
    loadVariables(selectedBranch)
  }

  const handleAddVariable = async () => {
    if (!newVar.name || !newVar.value) return
    
    setIsLoading(true)
    try {
      let url = '/api/variables'
      if (currentProject?.path) {
        url += `?projectPath=${encodeURIComponent(currentProject.path)}`
      }
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVar.name,
          value: newVar.value,
          description: newVar.description,
          sensitive: newVar.sensitive,
          category: selectedBranch,
          branch: selectedBranch
        })
      })
      
      if (res.ok) {
        await loadVariables(selectedBranch)
        loadProjectStatus() // Refresh required variables list
        setNewVar({ name: '', value: '', type: 'server', description: '', sensitive: false })
        playSound('powerup')
        // Show success notification
        setNotification({type: 'success', message: `Variable "${newVar.name}" added successfully!`})
        setTimeout(() => setNotification(null), 3000)
        setError('')
      } else {
        const errorData = await res.json().catch(() => ({}))
        const errorMsg = errorData.error || 'Failed to add variable'
        setNotification({type: 'error', message: errorMsg})
        setTimeout(() => setNotification(null), 5000)
        playSound('error')
      }
    } catch (err) {
      setNotification({type: 'error', message: 'Failed to add variable'})
      setTimeout(() => setNotification(null), 5000)
      playSound('error')
    }
    setIsLoading(false)
  }

  const handleDeleteVariable = async (name: string) => {
    if (!confirm(`Delete variable ${name}?`)) return
    
    setDeletingVariable(name)
    try {
      let url = '/api/variables'
      if (currentProject?.path) {
        url += `?projectPath=${encodeURIComponent(currentProject.path)}`
      }
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      
      if (res.ok) {
        await loadVariables(selectedBranch)
        loadProjectStatus() // Refresh required variables list
        playSound('hit')
        // Show success notification
        setNotification({type: 'success', message: `Variable "${name}" deleted successfully!`})
        setTimeout(() => setNotification(null), 3000)
      } else {
        const errorData = await res.json().catch(() => ({}))
        const errorMsg = errorData.error || 'Failed to delete variable'
        setNotification({type: 'error', message: errorMsg})
        setTimeout(() => setNotification(null), 5000)
        playSound('error')
      }
    } catch (err) {
      console.error('Failed to delete variable:', err)
      setNotification({type: 'error', message: 'Failed to delete variable'})
      setTimeout(() => setNotification(null), 5000)
      playSound('error')
    }
    setDeletingVariable(null)
  }

  const handleImportVariables = async (parsedVariables: any[]) => {
    setIsLoading(true)
    let successCount = 0
    let errorCount = 0
    
    try {
      for (const variable of parsedVariables) {
        try {
          let url = '/api/variables'
          if (currentProject?.path) {
            url += `?projectPath=${encodeURIComponent(currentProject.path)}`
          }
          
          // Check if variable exists (update) or is new (create)
          const method = variable.isDuplicate ? 'PUT' : 'POST'
          
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: variable.name,
              value: variable.value,
              description: variable.description || '',
              sensitive: variable.isSensitive || false,
              category: variable.category || selectedBranch,
              branch: selectedBranch
            })
          })
          
          if (res.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (err) {
          errorCount++
        }
      }
      
      // Reload variables and project status
      await loadVariables(selectedBranch)
      loadProjectStatus()
      
      // Show notification
      if (errorCount === 0) {
        setNotification({
          type: 'success', 
          message: `Successfully imported ${successCount} variable${successCount !== 1 ? 's' : ''}!`
        })
        playSound('powerup')
      } else {
        setNotification({
          type: 'error',
          message: `Imported ${successCount} variable${successCount !== 1 ? 's' : ''}, ${errorCount} failed`
        })
        playSound('error')
      }
      setTimeout(() => setNotification(null), 5000)
      
    } catch (err) {
      setNotification({type: 'error', message: 'Import failed'})
      setTimeout(() => setNotification(null), 5000)
      playSound('error')
    } finally {
      setIsLoading(false)
    }
  }

  const playSound = (type: 'success' | 'error' | 'powerup' | 'hit') => {
    // Optional: Add actual 8-bit sound effects
    switch(type) {
      case 'success':
        // Play success beep
        break
      case 'error':
        // Play error buzz
        break
      case 'powerup':
        // Play powerup sound
        break
      case 'hit':
        // Play hit sound
        break
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="text-center">
            <div className="mb-4 text-6xl animate-bounce">🔐</div>
            <CardTitle className="text-2xl mb-2">ENV MANAGER</CardTitle>
            <CardDescription className="text-xs">
              ENTER PASSWORD TO CONTINUE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              {/* Hidden username field for accessibility */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                value="admin"
                style={{ display: 'none' }}
                readOnly
                aria-hidden="true"
              />
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs">PASSWORD</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="font-mono"
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <div className="text-red-500 text-xs animate-pulse">
                  ⚠️ {error}
                </div>
              )}
              <Button 
                type="submit"
                disabled={isLoading || !password}
                className="w-full"
                variant="default"
              >
                {isLoading ? (
                  <span className="animate-pulse">LOADING...</span>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    LOGIN
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl mb-2 text-white animate-pulse">
          ENV MANAGER
        </h1>
        <p className="text-xs text-cyan-300">
          PROJECT: {currentProject?.packageInfo?.name || currentProject?.name || 'Unknown'}
          | BRANCH: {selectedBranch}
          | VARIABLES: {variables.length}
        </p>
        <Button
          onClick={() => window.location.href = '/'}
          className="mt-4"
          variant="outline"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          BACK TO PROJECTS
        </Button>
      </div>


      {/* Branch Selector */}
      <Card className="mb-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SELECT BRANCH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBranch} onValueChange={(val) => {
            // Navigate to new branch URL
            if (currentProject) {
              const projectName = currentProject.packageInfo?.name || currentProject.name || 'project'
              const cleanProjectName = projectName
                .replace(/^@[^/]+\//, '')
                .replace(/[^a-z0-9-]/gi, '-')
                .toLowerCase()
              window.location.href = `/${cleanProjectName}/${val}`
            }
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {branches.map(branch => (
                <SelectItem key={branch} value={branch}>
                  {branch.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Add Variable */}
      <Card className="mb-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            ADD NEW VARIABLE
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!currentProject ? (
            <div className="text-center py-8 text-yellow-400">
              <FolderOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm mb-2">NO PROJECT SELECTED</p>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                size="sm"
              >
                SELECT PROJECT
              </Button>
            </div>
          ) : (
            <form id="add-variable-form" onSubmit={(e) => { e.preventDefault(); handleAddVariable(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="var-name" className="text-xs">NAME</Label>
                <Input
                  id="var-name"
                  value={newVar.name}
                  onChange={(e) => setNewVar({...newVar, name: e.target.value})}
                  placeholder="VARIABLE_NAME"
                  className="font-mono"
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="var-value" className="text-xs">VALUE</Label>
                <Input
                  id="var-value"
                  type={newVar.sensitive ? "password" : "text"}
                  value={newVar.value}
                  onChange={(e) => setNewVar({...newVar, value: e.target.value})}
                  placeholder="value"
                  className="font-mono"
                  autoComplete={newVar.sensitive ? "new-password" : "off"}
                />
              </div>
              <div>
                <Label htmlFor="var-desc" className="text-xs">DESCRIPTION</Label>
                <Input
                  id="var-desc"
                  value={newVar.description}
                  onChange={(e) => setNewVar({...newVar, description: e.target.value})}
                  placeholder="Optional description"
                  className="font-mono"
                  autoComplete="off"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-4">
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="var-type"
                        value="server"
                        checked={newVar.type === 'server'}
                        onChange={(e) => setNewVar({...newVar, type: e.target.value})}
                        className="w-4 h-4"
                      />
                      <span className="text-xs">SERVER</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="var-type"
                        value="client"
                        checked={newVar.type === 'client'}
                        onChange={(e) => setNewVar({...newVar, type: e.target.value})}
                        className="w-4 h-4"
                      />
                      <span className="text-xs">CLIENT</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newVar.sensitive}
                      onChange={(e) => setNewVar({...newVar, sensitive: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-xs">SENSITIVE</span>
                  </label>
                </div>
                <Button 
                  type="submit"
                  disabled={isLoading || !newVar.name || !newVar.value || !currentProject}
                >
                  <Save className="mr-2 h-4 w-4" />
                  ADD
                </Button>
              </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Missing Variables by Category */}
      {projectStatus && projectStatus.groups && Object.keys(projectStatus.groups).length > 0 && (
        <Card className="mb-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              REQUIRED VARIABLES
            </CardTitle>
            <CardDescription>
              {projectStatus.missing.length > 0 
                ? `Missing ${projectStatus.missing.length} required variable(s)`
                : 'All required variables configured'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(projectStatus.groups).map(([groupKey, group]) => {
              const typedGroup = group as GroupResult
              if (typedGroup.missing.length === 0) return null
              
              return (
                <div key={groupKey} className="mb-6">
                  <h3 className="text-sm font-bold text-yellow-400 mb-3">
                    {typedGroup.name.toUpperCase()} ({typedGroup.missing.length} missing)
                  </h3>
                  <div className="space-y-2">
                    {typedGroup.variables
                      .filter((v: VariableResult) => !v.configured)
                      .map((variable: VariableResult) => (
                        <MissingVariableItem
                          key={variable.name}
                          variable={variable}
                          groupKey={groupKey}
                          currentProject={currentProject}
                          selectedBranch={selectedBranch}
                          onSuccess={() => {
                            loadVariables(selectedBranch)
                            loadProjectStatus()
                          }}
                          playSound={playSound as (type: string) => void}
                        />
                      ))
                    }
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'variables' ? 'default' : 'outline'}
                onClick={() => setActiveTab('variables')}
                size="sm"
              >
                <Terminal className="mr-2 h-4 w-4" />
                VARIABLES
              </Button>
              <Button 
                variant={activeTab === 'draft' ? 'default' : 'outline'}
                onClick={() => setActiveTab('draft')}
                size="sm"
              >
                <FileEdit className="mr-2 h-4 w-4" />
                DRAFT MODE
              </Button>
              <Button 
                variant={activeTab === 'history' ? 'default' : 'outline'}
                onClick={() => setActiveTab('history')}
                size="sm"
              >
                <History className="mr-2 h-4 w-4" />
                HISTORY
              </Button>
            </div>
            {activeTab === 'variables' && (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowImportExport(true)}
                  title="Import/Export Variables"
                >
                  <FileInput className="h-4 w-4 mr-1" />
                  <FileOutput className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={refreshVariables}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {activeTab === 'variables' && (
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              VARIABLES ({variables.length})
            </CardTitle>
          )}
        </CardHeader>
        <CardContent>
          {/* Notification Display */}
          {notification && (
            <div className={`mb-4 p-3 rounded border animate-pulse ${
              notification.type === 'success' 
                ? 'bg-green-900/50 border-green-500 text-green-200' 
                : 'bg-red-900/50 border-red-500 text-red-200'
            }`}>
              {notification.type === 'success' ? '✅' : '⚠️'} {notification.message}
            </div>
          )}
          
          {activeTab === 'variables' && (
            <div>
              {!currentProject ? (
                <div className="text-center py-12 text-gray-500">
                  <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">NO PROJECT SELECTED</p>
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    SELECT PROJECT
                  </Button>
                </div>
              ) : variables.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-xs">NO VARIABLES FOUND</p>
                  <p className="text-xs mt-2">ADD YOUR FIRST VARIABLE ABOVE</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {variables.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 border-2 border-black"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">
                            {variable.name}
                          </span>
                          {variable.encrypted && (
                            <Lock className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        {variable.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {variable.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-black text-green-400 px-2 py-1 max-w-[200px] truncate">
                          {variable.encrypted ? '••••••••' : variable.value}
                        </code>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteVariable(variable.name)}
                          disabled={deletingVariable === variable.name || isLoading}
                        >
                          {deletingVariable === variable.name ? '⏳' : 'X'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'draft' && (
            <DraftMode 
              projectPath={currentProject?.path}
              onPublish={() => {
                loadVariables(selectedBranch)
                playSound('success')
              }}
              onDiscard={() => {
                playSound('hit')
              }}
              playSound={playSound}
            />
          )}
          
          {activeTab === 'history' && (
            <VersionHistory 
              projectPath={currentProject?.path}
              onRestoreVersion={() => {
                setActiveTab('draft')
                playSound('powerup')
              }}
              playSound={playSound}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Import/Export Dialog */}
      <ImportExportDialog
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        projectPath={currentProject?.path}
        branch={selectedBranch}
        onImport={handleImportVariables}
        requiredVariables={projectStatus?.missing || []}
        existingVariables={variables}
      />
    </div>
  )
}