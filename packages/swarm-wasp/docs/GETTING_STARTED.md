# Getting Started with Swarm MCP Server

This guide will help you get up and running with the Swarm MCP Server in your AI-enabled development environment.

## 🎯 What You'll Learn

By the end of this guide, you'll be able to:
- Configure the Swarm MCP Server with your AI editor
- Generate Wasp application code using AI assistance
- Understand the basic workflow for AI-powered development

## 🚀 Quick Start (5 minutes)

### Step 1: Prerequisites

Ensure you have:
- **Node.js 18+** installed
- **AI-enabled editor** (Cursor, Windsurf, VS Code, etc.)
- **Wasp project** (or create one with `npx create-wasp-app@latest`)

### Step 2: Configure MCP

#### For Cursor (Recommended)

1. **Create MCP configuration file**:
   ```bash
   mkdir -p ~/.cursor
   touch ~/.cursor/mcp.json
   ```

2. **Add configuration**:
   ```json
   {
     "mcpServers": {
       "swarm-mcp": {
         "command": "npx",
         "args": ["-y", "--package=swarm-mcp", "swarm-mcp"],
         "env": {
           "SWARM_MCP_LOG_LEVEL": "info"
         }
       }
     }
   }
   ```

3. **Enable in Cursor**:
   - Open Settings (Ctrl+Shift+J)
   - Go to MCP tab
   - Toggle `swarm-mcp` ON
   - Restart Cursor

#### For Other Editors

See the [MCP Configuration Guide](./MCP_CONFIGURATION.md) for detailed setup instructions for Windsurf, VS Code, and other editors.

### Step 3: Test the Integration

1. **Open AI chat** in your editor
2. **Ask a simple question**:
   ```
   Can you help me generate a new API endpoint for a User entity?
   ```

3. **The AI should respond** with access to Swarm CLI tools and offer to help generate the code.

## 🏗️ Your First AI-Generated Feature

Let's create a complete user management feature using AI assistance:

### 1. Generate the Feature

Ask your AI assistant:
```
Can you generate a complete user management feature with:
- UserList component
- UserForm component  
- UserDetail component
- CRUD operations
- API endpoints
- Routes
```

### 2. Review Generated Code

The AI will:
- Generate React components
- Create CRUD operations
- Set up API endpoints
- Configure routes
- Handle file creation and organization

### 3. Customize and Extend

Ask follow-up questions:
```
Can you add authentication to the user routes?
Can you generate tests for the UserList component?
Can you add form validation to the UserForm?
```

## 🔧 Common Workflows

### New Feature Development

```
"Generate a blog post feature with:
- Post creation and editing
- Rich text editor
- Image upload support
- Categories and tags
- Search functionality"
```

### API Development

```
"Create a REST API for a shopping cart with:
- Add/remove items
- Update quantities
- Calculate totals
- Apply discounts
- Handle inventory"
```

### Database Operations

```
"Generate CRUD operations for a Product entity with:
- Name, description, price
- Category relationships
- Inventory tracking
- Image management
- Search and filtering"
```

## 🧪 Testing Your Setup

### Basic Functionality Test

Ask your AI:
```
Can you list all the available Swarm tools and what they do?
```

Expected response: The AI should list all available tools like `swarm_generate_api`, `swarm_generate_feature`, etc.

### Code Generation Test

Ask your AI:
```
Generate a simple "Hello World" component and save it to src/components/HelloWorld.tsx
```

Expected result: A new React component file should be created.

### File Operation Test

Ask your AI:
```
Can you read the package.json file and tell me what dependencies are installed?
```

Expected result: The AI should read and display the package.json contents.

## 🐛 Troubleshooting

### AI Can't Access Swarm Tools

**Check these common issues**:

1. **MCP not enabled**: Verify the toggle is ON in your editor's MCP settings
2. **Configuration error**: Check JSON syntax in your MCP config file
3. **Package not found**: Ensure `swarm-mcp` is accessible via npx
4. **Editor restart needed**: Try restarting your editor after configuration

### Swarm CLI Errors

**Common solutions**:

1. **Verify Swarm CLI**: Run `npx swarm --version`
2. **Check project structure**: Ensure you're in a Wasp project directory
3. **File permissions**: Check if the AI can read/write project files

### Debug Mode

Enable detailed logging:
```json
{
  "mcpServers": {
    "swarm-mcp": {
      "command": "npx",
      "args": ["-y", "--package=swarm-mcp", "swarm-mcp"],
      "env": {
        "SWARM_MCP_LOG_LEVEL": "debug"
      }
    }
  }
}
```

## 📚 Next Steps

### Explore Available Tools

- **Read the [API Reference](./API.md)** to understand all available capabilities
- **Check [Usage Examples](./EXAMPLES.md)** for advanced workflows
- **Review [Troubleshooting Guide](./TROUBLESHOOTING.md)** for common issues

### Advanced Workflows

- **Multi-entity applications**: Generate related entities with relationships
- **Complex APIs**: Create nested API structures with authentication
- **Background jobs**: Set up scheduled tasks and processing
- **Custom components**: Extend generated components with custom logic

### Best Practices

1. **Start simple**: Begin with basic features and gradually add complexity
2. **Review generated code**: Always review AI-generated code before committing
3. **Iterate with AI**: Use follow-up questions to refine and improve generated code
4. **Combine with manual development**: Use AI for boilerplate, manual coding for business logic

## 🆘 Getting Help

### Documentation Resources

- **[MCP Configuration Guide](./MCP_CONFIGURATION.md)** - Detailed setup instructions
- **[API Reference](./API.md)** - Complete tool documentation
- **[Usage Examples](./EXAMPLES.md)** - Practical workflow examples
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions

### Community Support

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share experiences
- **Documentation**: Check this guide and related docs first

### Example Questions

When asking for help, include:
- Your editor and version
- MCP configuration (without sensitive data)
- Error messages and logs
- Steps to reproduce the issue
- What you were trying to accomplish

## 🎉 Congratulations!

You've successfully set up the Swarm MCP Server and can now:
- Generate Wasp application code using AI assistance
- Automate repetitive development tasks
- Focus on business logic instead of boilerplate
- Build applications faster with AI-powered code generation

**Ready to build something amazing?** Start by asking your AI assistant to help you create your next feature!
