import React, { useState, useEffect } from 'react'
import { Button } from './ui/8bit/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/8bit/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/8bit/dialog'
import { History, GitBranch, FileText, User, Clock, Package, ChevronDown, ChevronRight } from 'lucide-react'
import type { VersionEntry, VariableChange } from '../types'

interface VersionHistoryProps {
  projectPath?: string
  onRestoreVersion?: (versionId: string) => void
  playSound?: (type: 'success' | 'error' | 'powerup' | 'hit') => void
}

export default function VersionHistory({ projectPath, onRestoreVersion, playSound }: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<VersionEntry | null>(null)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadVersionHistory()
  }, [projectPath])

  const loadVersionHistory = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/versions${projectPath ? `?projectPath=${encodeURIComponent(projectPath)}` : ''}`)
      if (res.ok) {
        const data = await res.json()
        setVersions(data.versions || [])
      }
    } catch (error) {
      console.error('Failed to load version history:', error)
      playSound?.('error')
    }
    setIsLoading(false)
  }

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will create a new draft with the restored state.')) {
      return
    }

    try {
      const res = await fetch('/api/versions/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          versionId,
          projectPath 
        })
      })

      if (res.ok) {
        onRestoreVersion?.(versionId)
        playSound?.('powerup')
      } else {
        playSound?.('error')
      }
    } catch (error) {
      console.error('Failed to restore version:', error)
      playSound?.('error')
    }
  }

  const toggleVersionExpanded = (versionId: string) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId)
    } else {
      newExpanded.add(versionId)
    }
    setExpandedVersions(newExpanded)
  }

  const formatChangeType = (type: 'create' | 'update' | 'delete' | 'none'): { text: string; color: string } => {
    switch (type) {
      case 'create':
        return { text: 'ADDED', color: 'text-green-400' }
      case 'update':
        return { text: 'MODIFIED', color: 'text-yellow-400' }
      case 'delete':
        return { text: 'DELETED', color: 'text-red-400' }
      case 'none':
      default:
        return { text: 'UNCHANGED', color: 'text-gray-400' }
    }
  }

  const getTimeDifference = (timestamp: string): string => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          VERSION HISTORY
        </CardTitle>
        <CardDescription>
          Track and manage environment variable changes over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Loading version history...</div>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No version history available</p>
            <p className="text-sm">Publish some changes to start tracking versions</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {versions.map((version) => {
              const isExpanded = expandedVersions.has(version.id)
              
              return (
                <div
                  key={version.id}
                  className="border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVersionExpanded(version.id)}
                        className="p-1 h-6 w-6"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-blue-400" />
                          <span className="font-mono text-sm font-bold text-blue-400">
                            {version.version}
                          </span>
                          {version.published && (
                            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
                              PUBLISHED
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{version.description}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeDifference(version.timestamp)}
                      </div>
                      {version.author && (
                        <div className="flex items-center gap-1 mt-1">
                          <User className="h-3 w-3" />
                          {version.author}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {version.variableCount} variables
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {version.changes.length} changes
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedVersion(version)}>
                            VIEW DETAILS
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Version {selectedVersion?.version} Details</DialogTitle>
                            <DialogDescription>
                              {selectedVersion?.description}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Published:</strong> {new Date(selectedVersion?.timestamp || '').toLocaleString()}
                              </div>
                              <div>
                                <strong>Author:</strong> {selectedVersion?.author || 'Unknown'}
                              </div>
                              <div>
                                <strong>Variables:</strong> {selectedVersion?.variableCount}
                              </div>
                              <div>
                                <strong>Changes:</strong> {selectedVersion?.changes.length}
                              </div>
                            </div>
                            
                            {selectedVersion && selectedVersion.changes.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Changes:</h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {selectedVersion.changes.map((change, idx) => {
                                    const { text, color } = formatChangeType(change.type)
                                    return (
                                      <div key={idx} className="border border-gray-600 rounded p-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-mono text-sm">{change.name}</span>
                                          <span className={`text-xs font-bold ${color}`}>{text}</span>
                                        </div>
                                        {change.type !== 'create' && change.oldValue && (
                                          <div className="text-xs text-red-400">
                                            <span className="text-gray-400">Old:</span> {change.sensitive ? '••••••••' : change.oldValue}
                                          </div>
                                        )}
                                        {change.type !== 'delete' && change.newValue && (
                                          <div className="text-xs text-green-400">
                                            <span className="text-gray-400">New:</span> {change.sensitive ? '••••••••' : change.newValue}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRestoreVersion(version.id)}
                      >
                        RESTORE
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <h5 className="text-xs font-semibold text-gray-400 mb-2">CHANGES IN THIS VERSION:</h5>
                      <div className="space-y-1">
                        {version.changes.map((change, idx) => {
                          const { text, color } = formatChangeType(change.type)
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="font-mono">{change.name}</span>
                              <span className={`font-bold ${color}`}>{text}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}