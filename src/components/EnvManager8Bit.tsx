import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/8bit/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/8bit/card'
import { Input } from '@/components/ui/8bit/input'
import { Label } from '@/components/ui/8bit/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/8bit/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/8bit/select'
import { Lock, Unlock, Save, Download, Upload, RefreshCw, Shield, Settings, Terminal, Key, Database, Clock } from 'lucide-react'

interface Variable {
  name: string
  value: string
  encrypted: boolean
  description?: string
}

interface Environment {
  name: string
  variables: Variable[]
}

export default function EnvManager8Bit() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [selectedEnv, setSelectedEnv] = useState<string>('development')
  const [variables, setVariables] = useState<Variable[]>([])
  const [newVar, setNewVar] = useState({ name: '', value: '', encrypted: false, description: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
      if (data.authenticated) {
        loadEnvironments()
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      if (res.ok) {
        setIsAuthenticated(true)
        setPassword('')
        loadEnvironments()
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

  const loadEnvironments = async () => {
    try {
      const res = await fetch('/api/environments')
      const data = await res.json()
      setEnvironments(data.environments || [])
      if (data.environments?.length > 0) {
        loadVariables(selectedEnv)
      }
    } catch (err) {
      console.error('Failed to load environments:', err)
    }
  }

  const loadVariables = async (env: string) => {
    try {
      const res = await fetch(`/api/variables?environment=${env}`)
      const data = await res.json()
      setVariables(data.variables || [])
    } catch (err) {
      console.error('Failed to load variables:', err)
    }
  }

  const handleAddVariable = async () => {
    if (!newVar.name || !newVar.value) return
    
    setIsLoading(true)
    try {
      const res = await fetch('/api/variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environment: selectedEnv,
          ...newVar
        })
      })
      
      if (res.ok) {
        loadVariables(selectedEnv)
        setNewVar({ name: '', value: '', encrypted: false, description: '' })
        playSound('powerup')
      }
    } catch (err) {
      setError('Failed to add variable')
      playSound('error')
    }
    setIsLoading(false)
  }

  const handleDeleteVariable = async (name: string) => {
    if (!confirm(`Delete variable ${name}?`)) return
    
    try {
      const res = await fetch(`/api/variables?environment=${selectedEnv}&name=${name}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        loadVariables(selectedEnv)
        playSound('hit')
      }
    } catch (err) {
      console.error('Failed to delete variable:', err)
      playSound('error')
    }
  }

  const playSound = (type: 'success' | 'error' | 'powerup' | 'hit') => {
    // Optional: Add actual 8-bit sound effects
    const audio = new Audio()
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs">PASSWORD</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  className="font-mono"
                />
              </div>
              {error && (
                <div className="text-red-500 text-xs animate-pulse">
                  ⚠️ {error}
                </div>
              )}
              <Button 
                onClick={handleLogin}
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
            </div>
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
          LEVEL: {selectedEnv.toUpperCase()} | VARIABLES: {variables.length}
        </p>
      </div>

      {/* Environment Selector */}
      <Card className="mb-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SELECT ENVIRONMENT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedEnv} onValueChange={(val) => {
            setSelectedEnv(val)
            loadVariables(val)
            playSound('powerup')
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">DEVELOPMENT</SelectItem>
              <SelectItem value="staging">STAGING</SelectItem>
              <SelectItem value="production">PRODUCTION</SelectItem>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="var-name" className="text-xs">NAME</Label>
              <Input
                id="var-name"
                value={newVar.name}
                onChange={(e) => setNewVar({...newVar, name: e.target.value})}
                placeholder="VARIABLE_NAME"
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="var-value" className="text-xs">VALUE</Label>
              <Input
                id="var-value"
                type={newVar.encrypted ? "password" : "text"}
                value={newVar.value}
                onChange={(e) => setNewVar({...newVar, value: e.target.value})}
                placeholder="value"
                className="font-mono"
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
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newVar.encrypted}
                  onChange={(e) => setNewVar({...newVar, encrypted: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-xs">ENCRYPT</span>
              </label>
              <Button 
                onClick={handleAddVariable}
                disabled={isLoading || !newVar.name || !newVar.value}
              >
                <Save className="mr-2 h-4 w-4" />
                ADD
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variables List */}
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              VARIABLES
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => loadVariables(selectedEnv)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {variables.length === 0 ? (
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
                    >
                      X
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}