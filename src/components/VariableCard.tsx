import React, { useState } from 'react'
import { Button } from './ui/8bit/button'
import { Input } from './ui/8bit/input'
import { Lock, Unlock, Save, X, Edit2, Trash2, Eye, EyeOff, Copy, Check, Sparkles } from 'lucide-react'
import type { DatabaseVariable } from '../types'

interface VariableCardProps {
  variable: DatabaseVariable
  onUpdate: (name: string, value: string) => Promise<void>
  onDelete: (name: string) => Promise<void>
  onGenerateSecret?: (name: string, type: 'uuid' | 'crypto' | 'password') => Promise<void>
  isDeleting?: boolean
  isClient?: boolean
  category?: string
}

export default function VariableCard({
  variable,
  onUpdate,
  onDelete,
  onGenerateSecret,
  isDeleting = false,
  isClient = false,
  category
}: VariableCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(variable.value)
  const [showValue, setShowValue] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = async () => {
    if (editValue === variable.value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onUpdate(variable.name, editValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update variable:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(variable.value)
    setIsEditing(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(variable.value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleGenerateSecret = async (type: 'uuid' | 'crypto' | 'password') => {
    if (onGenerateSecret) {
      await onGenerateSecret(variable.name, type)
      // Refresh the edit value if in editing mode
      if (isEditing) {
        setEditValue(variable.value)
      }
    }
  }

  const displayValue = variable.encrypted && !showValue 
    ? '••••••••' 
    : variable.value

  return (
    <div className={`
      border-2 border-black 
      ${isClient ? 'bg-blue-50 dark:bg-blue-950' : 'bg-gray-50 dark:bg-gray-900'}
      transition-all duration-200
      ${isEditing ? 'ring-2 ring-cyan-400' : ''}
    `}>
      {/* Header */}
      <div className="p-3 border-b-2 border-black bg-white dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {/* Icon to indicate client/server */}
              <span className="text-lg" title={isClient ? 'Client Variable' : 'Server Variable'}>
                {isClient ? '🌐' : '🔒'}
              </span>
              
              {/* Variable Name */}
              <span className="font-mono text-sm font-bold">
                {variable.name}
              </span>
              
              {/* Encryption indicator */}
              {variable.encrypted && (
                <span title="Encrypted">
                  <Lock className="h-3 w-3 text-yellow-500" />
                </span>
              )}
              
              {/* Sensitive indicator */}
              {variable.sensitive && (
                <span className="text-xs px-1 bg-red-500 text-white rounded" title="Sensitive">
                  SENSITIVE
                </span>
              )}
              
              {/* Required indicator */}
              {variable.required && (
                <span className="text-xs px-1 bg-yellow-500 text-black rounded" title="Required">
                  REQUIRED
                </span>
              )}
            </div>
            
            {/* Description */}
            {variable.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {variable.description}
              </p>
            )}
            
            {/* Category */}
            {category && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                {category}
              </span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-2">
            {!isEditing && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  title="Edit value"
                  className="h-7 w-7 p-0"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  title="Copy value"
                  className="h-7 w-7 p-0"
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(variable.name)}
                  disabled={isDeleting}
                  title="Delete variable"
                  className="h-7 w-7 p-0"
                >
                  {isDeleting ? '⏳' : <Trash2 className="h-3 w-3" />}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Value section */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="font-mono text-xs flex-1"
                placeholder="Enter value..."
                autoFocus
              />
              
              {/* Show/Hide for sensitive values */}
              {variable.sensitive && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowValue(!showValue)}
                  className="h-8 w-8 p-0"
                >
                  {showValue ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              )}
            </div>
            
            {/* Generation buttons for secrets */}
            {onGenerateSecret && variable.sensitive && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Generate:</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateSecret('uuid')}
                  className="text-xs h-6 px-2"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  UUID
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateSecret('crypto')}
                  className="text-xs h-6 px-2"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Secret
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateSecret('password')}
                  className="text-xs h-6 px-2"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Password
                </Button>
              </div>
            )}
            
            {/* Save/Cancel buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <span className="animate-pulse">SAVING...</span>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    SAVE
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-3 w-3 mr-1" />
                CANCEL
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <code className={`
              text-xs px-2 py-1 rounded
              ${isClient ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'}
              ${variable.encrypted ? 'text-yellow-500' : 'text-green-500'}
              font-mono
              max-w-[400px] truncate block
            `}>
              {displayValue}
            </code>
            
            {variable.sensitive && !variable.encrypted && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowValue(!showValue)}
                className="h-6 w-6 p-0 ml-2"
              >
                {showValue ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}