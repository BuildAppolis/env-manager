import React, { useState, useEffect } from 'react'
import ProjectSelector from './ProjectSelector'
import VersionFooter from './VersionFooter'

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

export default function MainApp() {
  const handleProjectSelect = (project: Project) => {
    // Navigate to the project's page using Astro routing
    const projectName = project.packageInfo?.name || project.name || 'project'
    const branch = project.gitBranch || 'main'
    
    // Clean project name for URL (remove @scope/, special chars)
    const cleanProjectName = projectName
      .replace(/^@[^/]+\//, '') // Remove npm scope
      .replace(/[^a-z0-9-]/gi, '-') // Replace special chars with dashes
      .toLowerCase()
    
    // Navigate using standard navigation
    window.location.href = `/${cleanProjectName}/${branch}`
  }
  
  return (
    <div className="min-h-screen bg-gray-900 p-4 pb-16">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl mb-2 text-yellow-400 animate-pulse">
            🔧 ENV MANAGER
          </h1>
          <p className="text-cyan-300 text-sm">
            SELECT A PROJECT TO MANAGE ENVIRONMENT VARIABLES
          </p>
        </div>
        <ProjectSelector onProjectSelect={handleProjectSelect} />
      </div>
      <VersionFooter />
    </div>
  )
}