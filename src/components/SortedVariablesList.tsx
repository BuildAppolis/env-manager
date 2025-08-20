import React, { useState, useMemo } from 'react'
import VariableCard from './VariableCard'
import { Input } from './ui/8bit/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/8bit/select'
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import type { DatabaseVariable } from '../types'

interface SortedVariablesListProps {
  variables: DatabaseVariable[]
  onUpdateVariable: (name: string, value: string) => Promise<void>
  onDeleteVariable: (name: string) => Promise<void>
  onGenerateSecret?: (name: string, type: 'uuid' | 'crypto' | 'password') => Promise<void>
  deletingVariable: string | null
  projectConfig?: any // ProjectConfig type
}

type SortOption = 'name-asc' | 'name-desc' | 'category' | 'updated' | 'type'

export default function SortedVariablesList({
  variables,
  onUpdateVariable,
  onDeleteVariable,
  onGenerateSecret,
  deletingVariable,
  projectConfig
}: SortedVariablesListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'server'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('category')

  // Detect client variables
  const isClientVariable = (name: string): boolean => {
    const clientPatterns = [
      /^NEXT_PUBLIC_/i,
      /^VITE_/i,
      /^REACT_APP_/i,
      /^GATSBY_/i,
      /^NUXT_PUBLIC_/i,
      /^PUBLIC_/i,
      /^EXPO_PUBLIC_/i,
      /^ASTRO_PUBLIC_/i,
    ]
    return clientPatterns.some(pattern => pattern.test(name))
  }

  // Get unique categories from variables
  const categories = useMemo(() => {
    const cats = new Set<string>()
    variables.forEach(v => {
      if (v.category) cats.add(v.category)
    })
    
    // Add categories from project config if available
    if (projectConfig?.requirements) {
      Object.keys(projectConfig.requirements).forEach(cat => cats.add(cat))
    }
    
    return Array.from(cats).sort()
  }, [variables, projectConfig])

  // Filter and sort variables
  const filteredAndSortedVariables = useMemo(() => {
    let filtered = [...variables]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query) ||
        v.value.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(v => v.category === categoryFilter)
    }

    // Apply type filter (client/server)
    if (typeFilter !== 'all') {
      filtered = filtered.filter(v => {
        const isClient = isClientVariable(v.name)
        return typeFilter === 'client' ? isClient : !isClient
      })
    }

    // Sort variables
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'category':
          // Sort by category first, then by name
          if (a.category === b.category) {
            return a.name.localeCompare(b.name)
          }
          return (a.category || 'zzz').localeCompare(b.category || 'zzz')
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'type':
          // Sort client variables first
          const aIsClient = isClientVariable(a.name)
          const bIsClient = isClientVariable(b.name)
          if (aIsClient === bIsClient) {
            return a.name.localeCompare(b.name)
          }
          return aIsClient ? -1 : 1
        default:
          return 0
      }
    })

    return filtered
  }, [variables, searchQuery, categoryFilter, typeFilter, sortBy])

  // Group variables by category for display
  const groupedVariables = useMemo(() => {
    if (sortBy !== 'category') {
      return { '': filteredAndSortedVariables }
    }

    const grouped: Record<string, DatabaseVariable[]> = {}
    
    filteredAndSortedVariables.forEach(variable => {
      const category = variable.category || 'Other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(variable)
    })

    return grouped
  }, [filteredAndSortedVariables, sortBy])

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 border-2 border-black">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
            <SelectTrigger className="w-32 text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="client">🌐 Client</SelectItem>
              <SelectItem value="server">🔒 Server</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Options */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-40 text-xs">
              {sortBy.includes('desc') ? <SortDesc className="h-3 w-3 mr-1" /> : <SortAsc className="h-3 w-3 mr-1" />}
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="type">By Type</SelectItem>
              <SelectItem value="updated">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-xs text-gray-500">
          {filteredAndSortedVariables.length === variables.length ? (
            <span>{variables.length} variables</span>
          ) : (
            <span>{filteredAndSortedVariables.length} of {variables.length} variables</span>
          )}
        </div>
      </div>

      {/* Variables List */}
      {filteredAndSortedVariables.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No variables found</p>
          {searchQuery && (
            <p className="text-xs mt-2">Try adjusting your search criteria</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedVariables).map(([category, vars]) => (
            <div key={category} className="space-y-2">
              {sortBy === 'category' && category && (
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    {category}
                  </h3>
                  <span className="text-xs text-gray-500">
                    ({vars.length})
                  </span>
                  <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-700" />
                </div>
              )}
              
              <div className="space-y-2">
                {vars.map((variable) => (
                  <VariableCard
                    key={variable.name}
                    variable={variable}
                    onUpdate={onUpdateVariable}
                    onDelete={onDeleteVariable}
                    onGenerateSecret={onGenerateSecret}
                    isDeleting={deletingVariable === variable.name}
                    isClient={isClientVariable(variable.name)}
                    category={sortBy !== 'category' ? variable.category : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}