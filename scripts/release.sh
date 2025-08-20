#!/bin/bash

# BuildAppolis Env-Manager Release Script
# Automates the release process including version bump, changelog update, and npm publish

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if version type is provided
if [ -z "$1" ]; then
    print_error "Version type not specified"
    echo "Usage: ./scripts/release.sh [patch|minor|major]"
    echo ""
    echo "Version types:"
    echo "  patch - Bug fixes and minor updates (1.0.0 -> 1.0.1)"
    echo "  minor - New features, backward compatible (1.0.0 -> 1.1.0)"
    echo "  major - Breaking changes (1.0.0 -> 2.0.0)"
    exit 1
fi

VERSION_TYPE=$1

# Validate version type
if [[ "$VERSION_TYPE" != "patch" && "$VERSION_TYPE" != "minor" && "$VERSION_TYPE" != "major" ]]; then
    print_error "Invalid version type: $VERSION_TYPE"
    echo "Must be one of: patch, minor, major"
    exit 1
fi

print_status "Starting release process for $VERSION_TYPE version bump..."

# 1. Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes. Please commit or stash them first."
    git status -s
    exit 1
fi

# 2. Pull latest changes
print_status "Pulling latest changes from remote..."
git pull origin main || {
    print_warning "Could not pull from main branch. Continuing anyway..."
}

# 3. Read current version
CURRENT_VERSION=$(cat VERSION)
print_status "Current version: $CURRENT_VERSION"

# 4. Bump version
print_status "Bumping $VERSION_TYPE version..."
node scripts/bump-version.js $VERSION_TYPE

# 5. Read new version
NEW_VERSION=$(cat VERSION)
print_success "Version bumped to: $NEW_VERSION"

# 6. Build the project
print_status "Building project..."
pnpm build || {
    print_error "Build failed!"
    exit 1
}
print_success "Build completed successfully"

# 7. Run tests if they exist
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    print_status "Running tests..."
    pnpm test || {
        print_warning "Tests failed or not configured. Continuing..."
    }
fi

# 8. Check if CHANGELOG was updated
print_warning "Please ensure CHANGELOG.md has been updated with the latest changes"
echo "Press Enter to continue or Ctrl+C to abort..."
read

# 9. Commit version bump
print_status "Committing version bump..."
git add -A
git commit -m "chore: bump version to $NEW_VERSION

- Version bump from $CURRENT_VERSION to $NEW_VERSION
- See CHANGELOG.md for details" || {
    print_warning "Nothing to commit or commit failed"
}

# 10. Create git tag
print_status "Creating git tag v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION" || {
    print_warning "Tag already exists or creation failed"
}

# 11. Push changes
print_status "Pushing changes to remote..."
git push origin main || {
    print_error "Failed to push to main branch"
    exit 1
}

print_status "Pushing tags..."
git push --tags || {
    print_warning "Failed to push tags"
}

# 12. Check npm login
print_status "Checking npm authentication..."
NPM_USER=$(npm whoami 2>/dev/null || echo "")
if [ -z "$NPM_USER" ]; then
    print_error "Not logged in to npm. Please run 'npm login' first"
    exit 1
fi
print_success "Logged in to npm as: $NPM_USER"

# 13. Publish to npm
print_status "Publishing to npm..."
npm publish --access public || {
    print_error "Failed to publish to npm"
    exit 1
}

# 14. Verify publication
print_status "Verifying npm publication..."
sleep 5  # Wait for npm to update
PUBLISHED_VERSION=$(npm view @buildappolis/env-manager version)
if [ "$PUBLISHED_VERSION" = "$NEW_VERSION" ]; then
    print_success "Successfully published version $NEW_VERSION to npm!"
else
    print_warning "Published version mismatch. Expected $NEW_VERSION, got $PUBLISHED_VERSION"
    print_warning "This might be due to npm cache. Check https://www.npmjs.com/package/@buildappolis/env-manager"
fi

# 15. Create GitHub release (optional, requires gh CLI)
if command -v gh &> /dev/null; then
    print_status "Creating GitHub release..."
    gh release create "v$NEW_VERSION" \
        --title "Release v$NEW_VERSION" \
        --notes "See CHANGELOG.md for details" || {
        print_warning "Failed to create GitHub release. You can create it manually."
    }
else
    print_warning "GitHub CLI not installed. Skipping GitHub release creation."
fi

# 16. Final success message
echo ""
print_success "🎉 Release v$NEW_VERSION completed successfully!"
echo ""
echo "Summary:"
echo "  - Version bumped from $CURRENT_VERSION to $NEW_VERSION"
echo "  - Changes committed and pushed to git"
echo "  - Tag v$NEW_VERSION created and pushed"
echo "  - Package published to npm"
echo "  - View at: https://www.npmjs.com/package/@buildappolis/env-manager"
echo ""
echo "Next steps:"
echo "  1. Update CHANGES-FINISHED.md to archive released changes"
echo "  2. Clear completed items from CHANGES-QUEUE.md"
echo "  3. Announce the release to users if needed"