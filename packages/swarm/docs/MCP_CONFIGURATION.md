# MCP Configuration Guide

This guide explains how to configure the Swarm MCP Server with various AI-enabled development tools and editors.

## Table of Contents

- [What is MCP?](#what-is-mcp)
- [Quick Setup](#quick-setup)
- [Editor-Specific Configuration](#editor-specific-configuration)
- [Configuration Options](#configuration-options)
- [Troubleshooting](#troubleshooting)
- [Testing Configuration](#testing-configuration)
- [Security Considerations](#security-considerations)

## What is MCP?

The Model Context Protocol (MCP) is a standard that allows AI assistants to interact with external tools and data sources. The Swarm MCP Server implements this protocol to provide AI tools with access to Swarm CLI functionality for generating Wasp application code.

## Getting Started

### Prerequisites

1. **Node.js 18+** installed on your system
2. **MCP-compatible editor** (Cursor, Windsurf, Claude Code, etc.)

### Basic Configuration

The Swarm MCP Server runs as a local process that communicates with your MCP clients via stdio (standard input/output). You can configure your editor to use a local project server, or set up a user-level server for use across multiple projects.

#### Project-Level Configuration

To use the Swarm server in a local project, you can set the path directly:

```json
{
  "mcpServers": {
    "swarm-mcp": {
      "command": "node",
      "args": ["/path/to/project/node_modules/.bin/swarm-mcp", "start"]
    }
  }
}
```

#### User-Level Configuration

When using user-level configuration, you must install Swarm and any plugin packages globally:

```bash
npm install -g @ingenyus/swarm @ingenyus/swarm-wasp
```

Create `~/.swarm/swarm.config.json` with your configuration:

```json
{
  "logging": {
    "level": "info",
    "format": "json"
  },
  "plugins": []
}
```

Then set the `--config` argument in your editor configuration:

```json
{
  "mcpServers": {
    "swarm-mcp": {
      "command": "npx",
      "args": ["-y", "--package=@ingenyus/swarm", "swarm-mcp", "start", "--config", "~/.swarm/swarm.config.json"]
    }
  }
}
```

### Command-Line Options

#### `-c, --config <path>`

Specify a custom path to the configuration file. If not specified, Swarm searches for a `swarm.config.json` file in the current working directory.

**Note:** `~/.swarm/swarm.config.json` is recommended for user-level configuration, but you can use any location you prefer:

```bash
swarm-mcp start --config ~/.swarm/swarm.config.json
```

### Environment Variables

Environment variables can be used to override default logging settings:

| Variable               | Default | Valid Values                     | Description   |
| ---------------------- | ------- | -------------------------------- | ------------- |
| `SWARM_MCP_LOG_LEVEL`  | `info`  | `debug`, `info`, `warn`, `error` | Logging level |
| `SWARM_MCP_LOG_FORMAT` | `json`  | `json`, `text`                   | Log format    |

## Editor-Specific Configuration

### Cursor

Cursor supports MCP through its configuration system.

#### Global Configuration

Create or edit `~/.cursor/mcp.json` (macOS/Linux) or `%USERPROFILE%\.cursor\mcp.json` (Windows):

**Prerequisite**: Install Swarm and any plugin packages globally first:
```bash
npm install -g @ingenyus/swarm @ingenyus/swarm-wasp
```

Then configure Cursor to use the `--config` option:

```json
{
  "mcpServers": {
    "swarm-mcp": {
      "command": "npx",
      "args": ["-y", "--package=@ingenyus/swarm", "swarm-mcp", "start", "--config", "~/.swarm/swarm.config.json"],
      "env": {}
    }
  }
}
```

#### Project-Specific Configuration

For project-specific settings, create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "swarm-mcp": {
      "command": "npx",
      "args": ["-y", "--package=@ingenyus/swarm", "swarm-mcp"],
      "env": {
        "SWARM_MCP_LOG_LEVEL": "debug",
        "SWARM_MCP_LOG_FORMAT": "json"
      }
    }
  }
}
```

#### Enable in Cursor

1. Open Cursor Settings (Ctrl+Shift+J or Cmd+,)
2. Click on the **MCP** tab on the left sidebar
3. Find `swarm-mcp` in the list and toggle it **ON**
4. Restart Cursor if prompted

#### Verify Installation

In Cursor's AI chat pane, ask:

```
Can you help me generate a new feature using Swarm?
```

The AI should now have access to Swarm CLI generation tools.

For more information, see the [Cursor MCP documentation](https://cursor.com/docs/context/mcp).

### Windsurf

Windsurf supports MCP through its configuration system.

#### Global Configuration

Create or edit `~/.codeium/windsurf/mcp_config.json` (macOS/Linux) or `%USERPROFILE%\.codeium\windsurf\mcp_config.json` (Windows):

**Prerequisite**: Install Swarm and any plugin packages globally first:
```bash
npm install -g @ingenyus/swarm @ingenyus/swarm-wasp
```

Create `~/.swarm/swarm.config.json` with your configuration, then use the `--config` option:

```json
{
  "mcpServers": {
    "swarm-mcp": {
      "command": "npx",
      "args": ["-y", "--package=@ingenyus/swarm", "swarm-mcp", "start", "--config", "~/.swarm/swarm.config.json"],
      "env": {}
    }
  }
}
```

#### Project-Specific Configuration

Create `.windsurf/mcp_config.json` in your project root:

```json
{
  "mcpServers": {
    "swarm-mcp": {
      "command": "npx",
      "args": ["-y", "--package=@ingenyus/swarm", "swarm-mcp"],
      "env": {
        "SWARM_MCP_LOG_LEVEL": "debug",
        "SWARM_MCP_LOG_FORMAT": "json"
      }
    }
  }
}
```

For more information, see the [Windsurf MCP documentation](https://docs.windsurf.com/windsurf/cascade/mcp).

### VS Code

VS Code requires the MCP extension to use MCP servers.

#### Install MCP Extension

1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search for "MCP" or "Model Context Protocol"
3. Install the official MCP extension

#### Configuration

Create `.vscode/mcp.json` in your project root:

**Using User-Level Config File (Recommended for Global Installations)**

**Prerequisite**: Install Swarm and any plugin packages globally first:
```bash
npm install -g @ingenyus/swarm @ingenyus/swarm-wasp
```

```json
{
  "servers": {
    "swarm-mcp": {
      "command": "npx",
      "args": ["-y", "--package=@ingenyus/swarm", "swarm-mcp", "start", "--config", "~/.swarm/swarm.config.json"],
      "env": {},
      "type": "stdio"
    }
  }
}
```


For more information, see the [VS Code MCP documentation](https://code.visualstudio.com/docs/copilot/customization/mcp-servers).

### Other MCP-Compatible Tools

#### Claude Code

Claude Code supports MCP through its configuration:

```json
{
  "mcpServers": {
    "swarm-mcp": {
      "command": "npx",
      "args": ["-y", "--package=@ingenyus/swarm", "swarm-mcp"],
      "env": {
        "SWARM_MCP_LOG_LEVEL": "info",
        "SWARM_MCP_LOG_FORMAT": "json"
      }
    }
  }
}
```

For more information, see the [Claude Code MCP documentation](https://docs.claude.com/en/docs/claude-code/mcp).

#### Codex

Codex uses a TOML configuration format stored in `~/.codex/config.toml`.

**Configuration via CLI:**

Add a MCP server using the Codex CLI:

```bash
codex mcp add swarm-mcp --env SWARM_MCP_LOG_LEVEL=info --env SWARM_MCP_LOG_FORMAT=json -- npx -y --package=@ingenyus/swarm swarm-mcp
```

**Configuration via config.toml:**

Alternatively, you can manually edit `~/.codex/config.toml`:

```toml
[mcp_servers.swarm-mcp]
command = "npx"
args = ["-y", "--package=@ingenyus/swarm", "swarm-mcp"]

[mcp_servers.swarm-mcp.env]
SWARM_MCP_LOG_LEVEL = "info"
SWARM_MCP_LOG_FORMAT = "json"
```

**Optional Configuration Options:**

```toml
[mcp_servers.swarm-mcp]
command = "npx"
args = ["-y", "--package=@ingenyus/swarm", "swarm-mcp"]
startup_timeout_sec = 30
tool_timeout_sec = 300

[mcp_servers.swarm-mcp.env]
SWARM_MCP_LOG_LEVEL = "info"
SWARM_MCP_LOG_FORMAT = "json"
```

For more information, see the [Codex MCP documentation](https://developers.openai.com/codex/mcp/).

## Troubleshooting

### Common Issues

#### 1. MCP Server Not Starting

**Symptoms**: AI assistant can't access Swarm tools
**Solutions**:
- Check Node.js version: `node --version` (should be 18+)
- Verify npx is available: `which npx`
- Check package installation: `npx swarm-mcp --version`

#### 2. Permission Errors

**Symptoms**: "Permission denied" or "Command not found"
**Solutions**:
- Ensure npx is accessible: `npm config get prefix`
- Check PATH environment variable
- Try installing globally: `npm install -g swarm-mcp`

#### 3. Configuration Not Loading

**Symptoms**: MCP settings not appearing in editor
**Solutions**:
- Verify JSON syntax is valid
- Check file permissions
- Restart the editor after configuration changes
- Verify configuration file path is correct

#### 4. Swarm CLI Integration Issues

**Symptoms**: Swarm generation tools fail
**Solutions**:
- Verify Swarm CLI is installed: `swarm --version`
- Check project structure (should be a Wasp project)
- Ensure `main.wasp.ts` exists in project root

### Debug Mode

Enable debug logging to troubleshoot issues:

```json
{
  "mcpServers": {
    "swarm-mcp": {
      "command": "npx",
      "args": ["-y", "--package=@ingenyus/swarm", "swarm-mcp"],
      "env": {
        "SWARM_MCP_LOG_LEVEL": "debug",
        "SWARM_MCP_LOG_FORMAT": "json"
      }
    }
  }
}
```

### Log Files

Check for log files in your project directory:
```bash
# Look for log files
find . -name "*.log" -type f

# Check MCP server logs
cat .taskmaster/logs/mcp-server.log
```

## Testing Configuration

### Basic Test

After configuration, test the setup:

1. **Restart your editor**
2. **Open AI chat pane**
3. **Ask a simple question**:
   ```
   Can you list the available Swarm tools?
   ```

### Advanced Test

Test Swarm CLI integration:

```
Can you generate a simple API endpoint for a User entity?
```

The AI should be able to:
- Access Swarm CLI tools
- Generate code files
- Provide feedback on the generation process

## Security Considerations

### Local-Only Access

The Swarm MCP Server runs locally and only communicates with your editor via stdio. This provides several security benefits:

- **No network exposure**: Server doesn't listen on network ports
- **Local file access**: Only accesses files in your project directory
- **Process isolation**: Runs in separate process from your editor

### File System Safety

- **Path validation**: Prevents directory traversal attacks
- **Project isolation**: Operations restricted to specified project directory
- **Backup system**: Automatic backups before file modifications

### Best Practices

1. **Keep configuration local**: Don't commit MCP configs to public repositories
2. **Review generated code**: Always review AI-generated code before committing
3. **Use project-specific configs**: Different settings for different projects
4. **Regular updates**: Keep swarm-mcp package updated

