import React, { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/8bit/dialog'
import { Button } from './ui/8bit/button'
import { Input } from './ui/8bit/input'
import { Label } from './ui/8bit/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/8bit/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/8bit/card'
import { Download, Upload, Copy, Check, FileDown, FileUp, AlertCircle, Info, Save } from 'lucide-react'

interface Variable {
  name: string
  value: string
  encrypted: boolean
  description?: string
  sensitive?: boolean
  category?: string
}

interface ParsedVariable {
  name: string
  value: string
  description?: string
  category?: string
  isRequired?: boolean
  isSensitive?: boolean
  isNew?: boolean
  isDuplicate?: boolean
}

interface ImportExportDialogProps {
  isOpen: boolean
  onClose: () => void
  projectPath?: string
  branch?: string
  onImport?: (variables: ParsedVariable[]) => Promise<void>
  requiredVariables?: string[]
  existingVariables?: Variable[]
}

export default function ImportExportDialog({ 
  isOpen, 
  onClose, 
  projectPath,
  branch = 'main',
  onImport,
  requiredVariables = [],
  existingVariables = []
}: ImportExportDialogProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [exportFormat, setExportFormat] = useState('.env')
  const [customExtension, setCustomExtension] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importContent, setImportContent] = useState('')
  const [parsedVariables, setParsedVariables] = useState<ParsedVariable[]>([])
  const [parseError, setParseError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportFormats = [
    { value: '.env', label: '.env' },
    { value: '.env.local', label: '.env.local' },
    { value: '.env.development', label: '.env.development' },
    { value: '.env.production', label: '.env.production' },
    { value: '.env.staging', label: '.env.staging' },
    { value: 'custom', label: 'Custom...' }
  ]

  const handleExport = async (toClipboard = false) => {
    setExportLoading(true)
    try {
      const url = `/api/export?${new URLSearchParams({
        ...(projectPath && { projectPath }),
        branch,
        format: 'env'
      })}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to export')
      
      const data = await response.json()
      const content = data.content || ''
      
      if (toClipboard) {
        await navigator.clipboard.writeText(content)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } else {
        // Download file
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = exportFormat === 'custom' ? `.env.${customExtension}` : exportFormat
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExportLoading(false)
    }
  }

  const parseEnvContent = (content: string): ParsedVariable[] => {
    const lines = content.split('\n')
    const variables: ParsedVariable[] = []
    let currentCategory = 'general'
    let lastDescription = ''
    
    const existingNames = new Set(existingVariables.map(v => v.name))
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Skip empty lines
      if (!trimmed) {
        lastDescription = ''
        continue
      }
      
      // Parse comments for descriptions and categories
      if (trimmed.startsWith('#')) {
        const comment = trimmed.substring(1).trim()
        
        // Check for category markers like "# === Database ===" or "# [Database]"
        if (comment.match(/^(===|---|\[).*?(===|---|\])/)) {
          currentCategory = comment.replace(/[=\-\[\]]/g, '').trim().toLowerCase()
        } else {
          // Store as potential description for next variable
          lastDescription = comment
        }
        continue
      }
      
      // Parse variable
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
      if (match) {
        const [, name, value] = match
        
        // Clean up value (remove quotes if present)
        let cleanValue = value
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          cleanValue = value.slice(1, -1)
        }
        
        // Detect if it's sensitive based on common patterns
        const isSensitive = name.includes('SECRET') || 
                          name.includes('KEY') || 
                          name.includes('PASSWORD') || 
                          name.includes('TOKEN') ||
                          name.includes('PRIVATE')
        
        variables.push({
          name,
          value: cleanValue,
          description: lastDescription || undefined,
          category: currentCategory,
          isRequired: requiredVariables.includes(name),
          isSensitive,
          isNew: !existingNames.has(name),
          isDuplicate: existingNames.has(name)
        })
        
        lastDescription = ''
      }
    }
    
    return variables
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportContent(content)
      handleParseContent(content)
    }
    reader.readAsText(file)
  }

  const handleParseContent = (content: string) => {
    try {
      setParseError('')
      const parsed = parseEnvContent(content)
      setParsedVariables(parsed)
    } catch (error) {
      setParseError('Failed to parse .env file')
      setParsedVariables([])
    }
  }

  const handleImportVariables = async () => {
    if (!onImport || parsedVariables.length === 0) return
    
    setImportLoading(true)
    try {
      await onImport(parsedVariables)
      onClose()
    } catch (error) {
      console.error('Import error:', error)
      setParseError('Failed to import variables')
    } finally {
      setImportLoading(false)
    }
  }

  const getVariableIcon = (variable: ParsedVariable) => {
    if (variable.isRequired) return '⚠️'
    if (variable.isDuplicate) return '🔄'
    if (variable.isNew) return '✨'
    return '📝'
  }

  const getVariableColor = (variable: ParsedVariable) => {
    if (variable.isRequired) return 'text-yellow-400'
    if (variable.isDuplicate) return 'text-blue-400'
    if (variable.isNew) return 'text-green-400'
    return 'text-gray-400'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">IMPORT/EXPORT ENVIRONMENT VARIABLES</DialogTitle>
          <DialogDescription>
            Export your variables to a file or clipboard, or import from an existing .env file
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'export' ? 'default' : 'outline'}
            onClick={() => setActiveTab('export')}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            EXPORT
          </Button>
          <Button
            variant={activeTab === 'import' ? 'default' : 'outline'}
            onClick={() => setActiveTab('import')}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            IMPORT
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">EXPORT FORMAT</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Select format</Label>
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exportFormats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {exportFormat === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-ext">Custom extension</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">.env.</span>
                        <Input
                          id="custom-ext"
                          value={customExtension}
                          onChange={(e) => setCustomExtension(e.target.value)}
                          placeholder="custom"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleExport(false)}
                      disabled={exportLoading || (exportFormat === 'custom' && !customExtension)}
                      className="flex-1"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      DOWNLOAD FILE
                    </Button>
                    <Button
                      onClick={() => handleExport(true)}
                      disabled={exportLoading}
                      variant="outline"
                      className="flex-1"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          COPIED!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          COPY TO CLIPBOARD
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">EXPORT INFO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <Info className="h-3 w-3 mt-0.5 text-blue-400" />
                      <span>Sensitive values will be decrypted during export</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-3 w-3 mt-0.5 text-blue-400" />
                      <span>Comments with descriptions will be included</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-3 w-3 mt-0.5 text-blue-400" />
                      <span>Variables are grouped by category</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">IMPORT SOURCE</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".env,.env.*,text/plain"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      SELECT .ENV FILE
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-900 px-2 text-gray-400">OR PASTE CONTENT</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="import-content">Paste .env content</Label>
                    <textarea
                      id="import-content"
                      value={importContent}
                      onChange={(e) => {
                        setImportContent(e.target.value)
                        handleParseContent(e.target.value)
                      }}
                      placeholder="# Database&#10;DATABASE_URL=postgresql://..."
                      className="w-full h-32 px-3 py-2 text-sm bg-black border border-gray-600 rounded font-mono resize-none focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </CardContent>
              </Card>

              {parseError && (
                <Card className="border-red-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{parseError}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {parsedVariables.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      PARSED VARIABLES ({parsedVariables.length})
                    </CardTitle>
                    <CardDescription>
                      Review the variables that will be imported
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {parsedVariables.map((variable, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 border border-gray-600 rounded text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span>{getVariableIcon(variable)}</span>
                            <div>
                              <div className="font-mono font-bold">{variable.name}</div>
                              {variable.description && (
                                <div className="text-gray-400 text-xs">{variable.description}</div>
                              )}
                              <div className="flex gap-2 mt-1">
                                {variable.category && (
                                  <span className="px-1 py-0.5 bg-gray-800 rounded text-xs">
                                    {variable.category}
                                  </span>
                                )}
                                {variable.isSensitive && (
                                  <span className="px-1 py-0.5 bg-red-900 rounded text-xs">
                                    sensitive
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`text-xs ${getVariableColor(variable)}`}>
                            {variable.isRequired && 'REQUIRED'}
                            {variable.isDuplicate && 'UPDATE'}
                            {variable.isNew && 'NEW'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                        <div className="flex items-center gap-1">
                          <span>✨</span>
                          <span>New: {parsedVariables.filter(v => v.isNew).length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🔄</span>
                          <span>Update: {parsedVariables.filter(v => v.isDuplicate).length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⚠️</span>
                          <span>Required: {parsedVariables.filter(v => v.isRequired).length}</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleImportVariables}
                        disabled={importLoading || parsedVariables.length === 0}
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        IMPORT {parsedVariables.length} VARIABLES
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}