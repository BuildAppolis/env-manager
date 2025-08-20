#!/bin/bash

# Release Tasks Helper
# Moves completed tasks to RELEASED and prepares for version bump

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
TASKS_DIR="$PROJECT_ROOT/.claude/tasks"
COMPLETED_FILE="$TASKS_DIR/COMPLETED.md"
RELEASED_FILE="$TASKS_DIR/RELEASED.md"

# Check if there are completed tasks
if [ ! -f "$COMPLETED_FILE" ]; then
    echo -e "${RED}❌ No completed tasks file found${NC}"
    exit 1
fi

completed_count=$(grep -c "^###" "$COMPLETED_FILE" 2>/dev/null || echo "0")

if [ "$completed_count" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  No completed tasks to release${NC}"
    exit 0
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📦 Release Preparation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Found $completed_count completed tasks to release:${NC}"
echo ""

# Show completed tasks
grep "^###" "$COMPLETED_FILE" | while read -r line; do
    task="${line#### }"
    echo -e "  ${GREEN}✓${NC} $task"
done

echo ""
echo -e "${YELLOW}Moving tasks to RELEASED...${NC}"

# Extract release version and date
release_date=$(date +"%Y-%m-%d")
release_version="v$(cat "$PROJECT_ROOT/package.json" | grep '"version"' | sed -E 's/.*"version": "([^"]+)".*/\1/')"

# Create release header
release_header="## Release $release_version ($release_date)

### Changes in this release:"

# Move completed tasks to RELEASED
if [ ! -f "$RELEASED_FILE" ]; then
    echo "# RELEASED - Version History

## Description
Tasks that have been released in published versions.

---
" > "$RELEASED_FILE"
fi

# Add release section
echo "" >> "$RELEASED_FILE"
echo "$release_header" >> "$RELEASED_FILE"
echo "" >> "$RELEASED_FILE"

# Copy completed tasks to RELEASED
awk '/^###/,/^---$|^###|^$/' "$COMPLETED_FILE" | sed '/^---$/d' >> "$RELEASED_FILE"

# Clear COMPLETED file but keep header
cat > "$COMPLETED_FILE" << 'EOF'
# COMPLETED - Ready for Release

## Description
Tasks that have been completed but not yet released. These will be moved to RELEASED during the next version bump.

---

<!-- Completed tasks will appear here -->

---
*Last Updated: $(date +"%Y-%m-%d")*
EOF

echo -e "${GREEN}✅ Tasks moved to RELEASED${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. Review CHANGELOG.md"
echo -e "  2. Run: ${GREEN}pnpm release:patch${NC} (or minor/major)"
echo -e "  3. Commit and push changes"
echo -e "  4. Publish to npm: ${GREEN}npm publish${NC}"