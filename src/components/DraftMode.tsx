import React, { useState, useEffect } from 'react'
import { Button } from './ui/8bit/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/8bit/card'
import { Input } from './ui/8bit/input'
import { Label } from './ui/8bit/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/8bit/dialog'
import { Edit3, Save, X, Plus, Trash2, Eye, EyeOff, GitCommit, FileEdit, AlertTriangle } from 'lucide-react'
import type { DraftVariable, VariableChange, DraftSession } from '../types'

interface DraftModeProps {
  projectPath?: string
  onPublish?: () => void
  onDiscard?: () => void
  playSound?: (type: 'success' | 'error' | 'powerup' | 'hit') => void
}

export default function DraftMode({ projectPath, onPublish, onDiscard, playSound }: DraftModeProps) {
  const [draft, setDraft] = useState<DraftSession | null>(null)
  const [draftVariables, setDraftVariables] = useState<DraftVariable[]>([])
  const [changes, setChanges] = useState<VariableChange[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [publishDescription, setPublishDescription] = useState('')
  const [showSensitive, setShowSensitive] = useState<Set<string>>(new Set())
  const [editingVariable, setEditingVariable] = useState<string | null>(null)

  useEffect(() => {
    loadDraftState()
  }, [projectPath])

  const loadDraftState = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/draft${projectPath ? `?projectPath=${encodeURIComponent(projectPath)}` : ''}`)
      if (res.ok) {
        const data = await res.json()
        setDraft(data.draft)
        setDraftVariables(data.variables || [])
        setChanges(data.changes || [])
        setPublishDescription(data.draft?.description || '')
      }
    } catch (error) {
      console.error('Failed to load draft state:', error)
      playSound?.('error')
    }
    setIsLoading(false)
  }

  const createDraft = async () => {
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create',
          projectPath,
          description: publishDescription
        })
      })

      if (res.ok) {
        await loadDraftState()
        playSound?.('powerup')
      }
    } catch (error) {
      console.error('Failed to create draft:', error)
      playSound?.('error')
    }
  }

  const updateDraftVariable = async (name: string, updates: Partial<DraftVariable>) => {
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_variable',
          projectPath,
          name,
          updates
        })
      })

      if (res.ok) {
        await loadDraftState()
        setEditingVariable(null)
        playSound?.('hit')
      }
    } catch (error) {
      console.error('Failed to update draft variable:', error)
      playSound?.('error')
    }
  }

  const addVariableToDraft = async (variable: Partial<DraftVariable>) => {
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_variable',
          projectPath,
          variable
        })
      })

      if (res.ok) {
        await loadDraftState()
        playSound?.('powerup')
      }
    } catch (error) {
      console.error('Failed to add variable to draft:', error)
      playSound?.('error')
    }
  }

  const removeFromDraft = async (name: string) => {
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_variable',
          projectPath,
          name
        })
      })

      if (res.ok) {
        await loadDraftState()
        playSound?.('hit')
      }
    } catch (error) {
      console.error('Failed to remove variable from draft:', error)
      playSound?.('error')
    }
  }

  const publishDraft = async () => {
    if (!draft || changes.length === 0) return

    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          projectPath,
          description: publishDescription
        })
      })

      if (res.ok) {
        const data = await res.json()
        await loadDraftState()
        onPublish?.()
        playSound?.('success')
        setPublishDescription('')
      }
    } catch (error) {
      console.error('Failed to publish draft:', error)
      playSound?.('error')
    }
  }

  const discardDraft = async () => {
    if (!confirm('Are you sure you want to discard all draft changes? This cannot be undone.')) {
      return
    }

    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'discard',
          projectPath
        })
      })

      if (res.ok) {
        await loadDraftState()
        onDiscard?.()
        playSound?.('hit')
        setPublishDescription('')
      }
    } catch (error) {
      console.error('Failed to discard draft:', error)
      playSound?.('error')
    }
  }

  const toggleSensitiveVisibility = (name: string) => {
    const newSet = new Set(showSensitive)
    if (newSet.has(name)) {
      newSet.delete(name)
    } else {
      newSet.add(name)
    }
    setShowSensitive(newSet)
  }

  const getChangeTypeDisplay = (type: 'create' | 'update' | 'delete' | 'none') => {
    switch (type) {
      case 'create':
        return { text: 'NEW', color: 'bg-green-500/20 text-green-400', icon: Plus }
      case 'update':
        return { text: 'MODIFIED', color: 'bg-yellow-500/20 text-yellow-400', icon: Edit3 }
      case 'delete':
        return { text: 'DELETE', color: 'bg-red-500/20 text-red-400', icon: Trash2 }
      case 'none':
      default:
        return { text: 'UNCHANGED', color: 'bg-gray-500/20 text-gray-400', icon: Edit3 }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading draft state...</div>
        </CardContent>
      </Card>
    )
  }

  if (!draft) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            DRAFT MODE
          </CardTitle>
          <CardDescription>
            Start drafting changes to edit multiple variables before publishing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">No active draft session</p>
            <Button onClick={createDraft}>
              <Plus className="mr-2 h-4 w-4" />
              START DRAFT
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Draft Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileEdit className="h-5 w-5" />
              DRAFT MODE
              <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                ACTIVE
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={discardDraft}>
                <X className="mr-2 h-4 w-4" />
                DISCARD
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={changes.length === 0}>
                    <GitCommit className="mr-2 h-4 w-4" />
                    PUBLISH ({changes.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publish Draft Changes</DialogTitle>
                    <DialogDescription>
                      You're about to publish {changes.length} change(s). This will apply all modifications to your environment variables.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="publish-description">Description (optional)</Label>
                      <Input
                        id="publish-description"
                        value={publishDescription}
                        onChange={(e) => setPublishDescription(e.target.value)}
                        placeholder="Describe what you changed..."
                      />
                    </div>
                    
                    {changes.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Changes to be published:</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {changes.map((change, idx) => {
                            const { text, color, icon: Icon } = getChangeTypeDisplay(change.type)
                            return (
                              <div key={idx} className="flex items-center justify-between p-2 border border-gray-600 rounded">
                                <span className="font-mono text-sm">{change.name}</span>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${color}`}>
                                  <Icon className="h-3 w-3" />
                                  {text}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      <Button onClick={publishDraft} className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        PUBLISH CHANGES
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
          {changes.length > 0 && (
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              {changes.length} pending change(s) ready to publish
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Draft Variables */}
      <Card>
        <CardHeader>
          <CardTitle>Draft Variables</CardTitle>
          <CardDescription>
            Variables that are currently being modified in this draft
          </CardDescription>
        </CardHeader>
        <CardContent>
          {draftVariables.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No variables in draft</p>
              <p className="text-sm">Add or modify variables to start drafting changes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {draftVariables.map((variable) => {
                const { text, color, icon: Icon } = getChangeTypeDisplay(variable.changeType)
                const isEditing = editingVariable === variable.name
                const isVisible = showSensitive.has(variable.name)

                return (
                  <div key={variable.name} className="border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${color}`}>
                          <Icon className="h-3 w-3" />
                          {text}
                        </div>
                        <span className="font-mono font-bold">{variable.name}</span>
                        {variable.sensitive && (
                          <span className="px-1 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                            SENSITIVE
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {variable.sensitive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSensitiveVisibility(variable.name)}
                          >
                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingVariable(isEditing ? null : variable.name)}
                        >
                          {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromDraft(variable.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label>Value</Label>
                          <Input
                            type={variable.sensitive && !isVisible ? "password" : "text"}
                            value={variable.value}
                            onChange={(e) => updateDraftVariable(variable.name, { value: e.target.value })}
                            placeholder="Enter value..."
                          />
                        </div>
                        {variable.description && (
                          <div>
                            <Label>Description</Label>
                            <Input
                              value={variable.description}
                              onChange={(e) => updateDraftVariable(variable.name, { description: e.target.value })}
                              placeholder="Variable description..."
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-gray-400">Current Value:</span>
                          <div className="font-mono text-sm mt-1">
                            {variable.sensitive && !isVisible 
                              ? '••••••••••••••••' 
                              : variable.value || <span className="text-gray-500">Not set</span>
                            }
                          </div>
                        </div>
                        {variable.originalValue && variable.originalValue !== variable.value && (
                          <div>
                            <span className="text-sm text-gray-400">Original Value:</span>
                            <div className="font-mono text-sm mt-1 text-gray-500">
                              {variable.sensitive && !isVisible 
                                ? '••••••••••••••••' 
                                : variable.originalValue
                              }
                            </div>
                          </div>
                        )}
                        {variable.description && (
                          <div>
                            <span className="text-sm text-gray-400">Description:</span>
                            <div className="text-sm mt-1">{variable.description}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}