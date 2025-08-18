#!/usr/bin/env node

/**
 * Version Bump Script for BuildAppolis Env-Manager
 * Maintains single source of truth for versioning
 * 
 * Usage: 
 *   npm run version:patch  - Bump patch version (1.0.0 -> 1.0.1)
 *   npm run version:minor  - Bump minor version (1.0.0 -> 1.1.0)
 *   npm run version:major  - Bump major version (1.0.0 -> 2.0.0)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Read current version from VERSION file
const versionFile = path.join(rootDir, 'VERSION');
const currentVersion = fs.readFileSync(versionFile, 'utf-8').trim();

// Parse version
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Determine bump type from command line
const bumpType = process.argv[2] || 'patch';

let newVersion;
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`📦 Bumping version from ${currentVersion} to ${newVersion}`);

// Update VERSION file
fs.writeFileSync(versionFile, newVersion);
console.log('✅ Updated VERSION file');

// Update package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Updated package.json');

// Update CHANGELOG.md
const changelogPath = path.join(rootDir, 'CHANGELOG.md');
const changelog = fs.readFileSync(changelogPath, 'utf-8');
const today = new Date().toISOString().split('T')[0];

// Add new version section after Unreleased
const updatedChangelog = changelog.replace(
  '## [Unreleased]',
  `## [Unreleased]\n\n## [${newVersion}] - ${today}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- `
);

// Update links at the bottom
const lines = updatedChangelog.split('\n');
const linkIndex = lines.findIndex(line => line.startsWith('[Unreleased]:'));
if (linkIndex !== -1) {
  // Update Unreleased link
  lines[linkIndex] = `[Unreleased]: https://github.com/buildappolis/env-manager/compare/v${newVersion}...HEAD`;
  // Add new version link
  lines.splice(linkIndex + 1, 0, `[${newVersion}]: https://github.com/buildappolis/env-manager/compare/v${currentVersion}...v${newVersion}`);
}

fs.writeFileSync(changelogPath, lines.join('\n'));
console.log('✅ Updated CHANGELOG.md');

console.log(`\n🎉 Version bumped to ${newVersion}`);
console.log('\n📝 Next steps:');
console.log('1. Update CHANGELOG.md with your changes');
console.log('2. Commit: git add -A && git commit -m "chore: bump version to ' + newVersion + '"');
console.log('3. Tag: git tag v' + newVersion);
console.log('4. Publish: npm publish --access public');
console.log('5. Push: git push && git push --tags');