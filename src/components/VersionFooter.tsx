import React, { useEffect, useState } from 'react'

interface VersionInfo {
  version: string;
  environment: string;
  isPublished: boolean;
}

export default function VersionFooter() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  
  useEffect(() => {
    fetch('/api/version')
      .then(res => res.json())
      .then(data => setVersionInfo(data))
      .catch(err => console.error('Failed to fetch version:', err))
  }, [])
  
  if (!versionInfo) return null
  
  const getEnvironmentColor = () => {
    switch (versionInfo.environment) {
      case 'development':
        return 'text-yellow-400'
      case 'production':
        return 'text-green-400'
      case 'local':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }
  
  const getEnvironmentIcon = () => {
    switch (versionInfo.environment) {
      case 'development':
        return '🔧'
      case 'production':
        return '✅'
      case 'local':
        return '🏠'
      default:
        return '📦'
    }
  }
  
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-2 border-gray-800 px-4 py-2">
      <div className="container mx-auto flex justify-between items-center text-xs">
        <div className="flex items-center gap-4">
          <span className="text-gray-500">
            ENV MANAGER v{versionInfo.version}
          </span>
          <span className={`flex items-center gap-1 ${getEnvironmentColor()}`}>
            {getEnvironmentIcon()} {versionInfo.environment.toUpperCase()}
          </span>
          {versionInfo.isPublished && (
            <span className="text-cyan-400">
              📦 PUBLISHED
            </span>
          )}
        </div>
        <div className="text-gray-600">
          © {new Date().getFullYear()} BuildAppolis
        </div>
      </div>
    </footer>
  )
}