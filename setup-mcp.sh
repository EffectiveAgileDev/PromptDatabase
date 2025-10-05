#!/bin/bash

# MCP Server Setup Script for Prompt Database
# This script helps complete the MCP server configuration

echo "🚀 Setting up MCP servers for Prompt Database..."

# Check if GitHub token is provided
if [ -z "$1" ]; then
    echo "❌ Error: GitHub Personal Access Token required"
    echo ""
    echo "Usage: ./setup-mcp.sh YOUR_GITHUB_TOKEN"
    echo ""
    echo "To create a GitHub PAT:"
    echo "1. Go to GitHub.com → Settings → Developer settings → Personal access tokens"
    echo "2. Generate new token (classic)"
    echo "3. Select 'repo' scope"
    echo "4. Copy the token and use it as the first argument"
    echo ""
    exit 1
fi

GITHUB_TOKEN=$1

echo "📝 Updating MCP configuration..."

# Replace the GitHub token in the config file
sed "s/YOUR_GITHUB_PAT_HERE/$GITHUB_TOKEN/g" mcp_config_updated.json > mcp_config_final.json

echo "📋 Copying configuration to Claude Desktop..."

# Copy to Claude Desktop config
cp mcp_config_final.json ~/.config/claude/mcp_config.json

echo "🔍 Verifying configuration..."

# Check if files exist
if [ -f ~/.config/claude/mcp_config.json ]; then
    echo "✅ Claude configuration updated"
else
    echo "❌ Failed to update Claude configuration"
    exit 1
fi

if [ -f .mcp-memory.json ]; then
    echo "✅ Memory storage file exists"
else
    echo "❌ Memory storage file missing"
    exit 1
fi

echo ""
echo "🎉 MCP server setup complete!"
echo ""
echo "Next steps:"
echo "1. Completely quit Claude Desktop (don't just close the window)"
echo "2. Restart Claude Desktop"
echo "3. The new servers should be available in your next conversation"
echo ""
echo "Available servers:"
echo "  • Memory: Store context across sessions"
echo "  • GitHub: Manage issues and PRs"
echo "  • Playwright: Already configured for browser automation"
echo ""
echo "Test the setup by asking Claude to:"
echo "  - Store some information using the memory server"
echo "  - List GitHub issues for your repository"
echo ""

# Clean up temporary file
rm -f mcp_config_final.json

echo "⚠️  Remember to add .mcp-memory.json to .gitignore (already done)"
echo "⚠️  Keep your GitHub token secure and don't commit it to git"