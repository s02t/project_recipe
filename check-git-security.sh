#!/bin/bash

# Git Security Check - Verify no sensitive files are tracked
# Run this before committing to ensure credentials aren't exposed

echo "🔒 Checking for sensitive files in Git..."
echo ""

ISSUES_FOUND=0

# Check if .env is tracked
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo "❌ CRITICAL: .env is tracked by Git!"
    echo "   Run: git rm --cached .env"
    ISSUES_FOUND=1
else
    echo "✅ .env is not tracked"
fi

# Check if firebase-credentials.json is tracked
if git ls-files --error-unmatch firebase-credentials.json 2>/dev/null; then
    echo "❌ CRITICAL: firebase-credentials.json is tracked by Git!"
    echo "   Run: git rm --cached firebase-credentials.json"
    ISSUES_FOUND=1
else
    echo "✅ firebase-credentials.json is not tracked"
fi

# Check for any .env files
ENV_FILES=$(git ls-files | grep -E '\.env' || true)
if [ ! -z "$ENV_FILES" ]; then
    echo "❌ WARNING: Found .env files tracked:"
    echo "$ENV_FILES"
    echo "   Review and remove with: git rm --cached <file>"
    ISSUES_FOUND=1
else
    echo "✅ No .env files tracked"
fi

# Check for credential files
CRED_FILES=$(git ls-files | grep -iE '(credential|secret|key|password|token).*\.(json|txt|key|pem)' || true)
if [ ! -z "$CRED_FILES" ]; then
    echo "⚠️  WARNING: Found potential credential files:"
    echo "$CRED_FILES"
    echo "   Review these files carefully!"
fi

# Check for backup files with credentials
BACKUP_FILES=$(git ls-files | grep -E '\.(backup|bak)$' || true)
if [ ! -z "$BACKUP_FILES" ]; then
    echo "⚠️  WARNING: Found backup files tracked:"
    echo "$BACKUP_FILES"
    echo "   These might contain sensitive data!"
fi

echo ""
echo "========================================="

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ All security checks passed!"
    echo "✅ Safe to commit"
else
    echo "❌ ISSUES FOUND - DO NOT COMMIT YET!"
    echo ""
    echo "To remove tracked sensitive files:"
    echo "  git rm --cached <filename>"
    echo ""
    echo "After removing, commit the change:"
    echo "  git commit -m 'Remove sensitive files from tracking'"
    exit 1
fi

echo "========================================="
echo ""

# Show what would be committed
echo "Files staged for commit:"
git status --short

exit 0
