# MCP Server Setup Guide for Prompt Database

## Overview
This guide will help you set up three prioritized MCP servers for the Prompt Database project:
1. Memory MCP Server - For maintaining context across sessions
2. GitHub MCP Server - For project management and version control
3. Playwright MCP Server - Already installed, needs verification

## Prerequisites

Ensure you have Node.js and npm installed:
```bash
node --version  # Should be 18+ 
npm --version   # Should be 8+
```

## Step 1: Install MCP Servers

### Create MCP servers directory if it doesn't exist
```bash
mkdir -p ~/mcp-servers
cd ~/mcp-servers
```

### Install Memory Server
```bash
npm install @modelcontextprotocol/server-memory
```

### Install GitHub Server
```bash
npm install @modelcontextprotocol/server-github
```

### Verify Playwright Server (should already be installed)
```bash
npm list @modelcontextprotocol/server-playwright
```

If Playwright server is not installed:
```bash
npm install @modelcontextprotocol/server-playwright
```

## Step 2: Configure GitHub Personal Access Token

The GitHub MCP server requires a personal access token.

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "MCP Server for Prompt Database"
4. Select scopes:
   - `repo` (full control of private repositories)
   - `workflow` (for GitHub Actions if needed)
   - `read:org` (if working with organization repos)
5. Generate token and copy it immediately (you won't see it again!)

## Step 3: Update Claude Desktop Configuration

Add the following to your `~/.config/claude/mcp_config.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "node",
      "args": ["/home/rod/mcp-servers/node_modules/@upstash/context7-mcp/dist/index.js"],
      "env": {
        "UPSTASH_REDIS_REST_URL": "https://valued-basilisk-46700.upstash.io",
        "UPSTASH_REDIS_REST_TOKEN": "AbZsAAIjcDE5MWIyYmQ5MGY5MWE0NWIwOGVkZWU5MGNhMWFjNWRiN3AxMA"
      }
    },
    "filesystem": {
      "command": "node",
      "args": ["/home/rod/mcp-servers/node_modules/@modelcontextprotocol/server-filesystem/dist/index.js"],
      "env": {
        "ALLOWED_DIRECTORIES": "/home/rod/AI/Projects/WTEG"
      }
    },
    "fetch": {
      "command": "mcp-server-fetch",
      "args": [],
      "env": {}
    },
    "sqlite": {
      "command": "mcp-server-sqlite",
      "args": ["--db-path", "/home/rod/AI/Projects/WTEG/WTEG/where-to-eat-guide/data/dev.db"],
      "env": {}
    },
    "memory": {
      "command": "node",
      "args": ["/home/rod/mcp-servers/node_modules/@modelcontextprotocol/server-memory/dist/index.js"],
      "env": {
        "MEMORY_FILE_PATH": "/home/rod/AI/Projects/PromptDatabase/.mcp-memory.json"
      }
    },
    "github": {
      "command": "node",
      "args": ["/home/rod/mcp-servers/node_modules/@modelcontextprotocol/server-github/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "YOUR_GITHUB_PAT_HERE",
        "REPO_OWNER": "EffectiveAgileDev",
        "REPO_NAME": "PromptDatabase"
      }
    },
    "playwright": {
      "command": "node",
      "args": ["/home/rod/mcp-servers/node_modules/@modelcontextprotocol/server-playwright/dist/index.js"],
      "env": {
        "HEADLESS": "false",
        "BROWSER": "chromium"
      }
    }
  }
}
```

**IMPORTANT**: Replace `YOUR_GITHUB_PAT_HERE` with your actual GitHub Personal Access Token.

## Step 4: Create Memory Storage File

Create the initial memory storage file:
```bash
echo '{"nodes": [], "edges": []}' > /home/rod/AI/Projects/PromptDatabase/.mcp-memory.json
```

## Step 5: Restart Claude Desktop

After updating the configuration:
1. Completely quit Claude Desktop (not just close the window)
2. Restart Claude Desktop
3. The new MCP servers should be available

## Step 6: Verify Server Connection

In a new Claude conversation, you can verify the servers are working:

1. **Memory Server**: Try storing and retrieving information
2. **GitHub Server**: Try listing issues or creating a test issue
3. **Playwright Server**: Try navigating to a webpage

## Usage in Prompt Database Project

### Memory Server Use Cases
- Store architectural decisions
- Remember test patterns and conventions
- Keep track of component relationships
- Maintain coding standards across sessions

### GitHub Server Use Cases
- Create issues from todo.md tasks
- Manage pull requests
- Track BDD scenarios as issues
- Automate release notes

### Playwright Server Use Cases
- Test the application during development
- Verify responsive design at different breakpoints
- Test clipboard functionality
- Check accessibility features
- Visual regression testing

## Troubleshooting

### If servers don't appear in Claude:
1. Check the paths in mcp_config.json are correct
2. Ensure npm packages are installed in the right directory
3. Check Claude Desktop logs: `~/.config/claude/logs/`
4. Verify Node.js is in your PATH

### Common Issues:
- **Memory server not persisting**: Check file permissions on .mcp-memory.json
- **GitHub server auth failing**: Regenerate PAT and update config
- **Playwright timeouts**: Increase timeout in environment variables

## Security Notes

1. **GitHub Token**: Keep your PAT secure, don't commit it to git
2. **Memory File**: Add `.mcp-memory.json` to .gitignore
3. **Filesystem Access**: Be careful with ALLOWED_DIRECTORIES permissions

## Next Steps

Once all servers are configured:
1. Test each server with simple commands
2. Integrate them into your development workflow
3. Use memory server to maintain project context
4. Use GitHub server for issue tracking
5. Use Playwright for continuous testing

---

Remember to update the GitHub token in the configuration before restarting Claude!