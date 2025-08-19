import React, { useState } from 'react'
import { Button } from './ui/8bit/button'
import { Input } from './ui/8bit/input'

interface MissingVariableItemProps {
  variable: {
    name: string
    configured: boolean
    hasValue: boolean
    valid: boolean
    errors: string[]
    sensitive?: boolean
    type?: 'client' | 'server'
    description?: string
  }
  groupKey: string
  currentProject: any
  selectedBranch: string
  onSuccess: () => void
  playSound: (type: string) => void
}

export default function MissingVariableItem({ 
  variable, 
  groupKey, 
  currentProject, 
  selectedBranch,
  onSuccess,
  playSound 
}: MissingVariableItemProps) {
  const [tempValue, setTempValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  // Use the sensitivity from config, don't allow toggling
  const isSensitive = variable.sensitive ?? true
  
  const handleAdd = async () => {
    setIsAdding(true)
    try {
      const res = await fetch(`/api/variables?projectPath=${encodeURIComponent(currentProject?.path || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: variable.name,
          value: tempValue,
          description: variable.description || '',
          sensitive: isSensitive,
          category: groupKey,
          branch: selectedBranch
        })
      })
      
      if (res.ok) {
        onSuccess()
        setTempValue('')
        playSound('powerup')
      } else {
        playSound('error')
      }
    } catch (err) {
      console.error('Failed to add variable:', err)
      playSound('error')
    }
    setIsAdding(false)
  }
  
  return (
    <div className="p-3 bg-red-900/20 border border-red-500/50 rounded">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="font-mono text-sm text-red-400">{variable.name}</p>
          <div className="flex gap-1">
            {variable.type && (
              <span className="px-1 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                {variable.type.toUpperCase()}
              </span>
            )}
            {variable.sensitive && (
              <span className="px-1 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                SENSITIVE
              </span>
            )}
          </div>
        </div>
      </div>
      {variable.description && (
        <p className="text-xs text-gray-400 mb-2">{variable.description}</p>
      )}
      <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="space-y-2">
        <input
          type="text"
          name="username"
          value={variable.name}
          autoComplete="username"
          style={{ display: 'none' }}
          readOnly
          aria-hidden="true"
        />
        <div className="flex gap-2">
          <Input
            type={isSensitive ? "password" : "text"}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            placeholder="Enter value..."
            className="flex-1 text-sm"
            disabled={isAdding}
            autoComplete={isSensitive ? "new-password" : "off"}
          />
          <Button
            type="submit"
            size="sm"
            variant="default"
            disabled={!tempValue || isAdding}
          >
            {isAdding ? 'ADDING...' : 'ADD'}
          </Button>
        </div>
        {/* Show sensitivity status from config - not editable */}
        {isSensitive && (
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <span>⚠️ This value will be encrypted</span>
          </div>
        )}
      </form>
    </div>
  )
}