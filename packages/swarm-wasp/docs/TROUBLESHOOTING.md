# Troubleshooting Guide

This guide helps you resolve common issues when using the Swarm MCP Server.

## 🚨 Common Issues

### 1. Server Won't Start

#### Symptoms
- `swarm-mcp start` command fails
- Server exits immediately
- Port already in use errors

#### Solutions

**Check if server is already running:**
```bash
swarm-mcp status
```

**Kill existing processes:**
```bash
# Find and kill existing swarm-mcp processes
pkill -f swarm-mcp

# Or check what's using the port
lsof -i :<port-number>
```

**Verify Node.js version:**
```bash
node --version
# Should be 18.0.0 or higher
```

**Check dependencies:**
```bash
npm install
npm run build
```

**Enable debug logging:**
```bash
SWARM_MCP_LOG_LEVEL=debug swarm-mcp start
```

### 2. Permission Denied Errors

#### Symptoms
- `Permission denied` errors when reading/writing files
- Cannot access project directories
- Backup creation fails

#### Solutions

**Check file permissions:**
```bash
ls -la /path/to/project
chmod 755 /path/to/project
```

**Verify user ownership:**
```bash
whoami
ls -la /path/to/project | head -1
```

**Check backup directory permissions:**
```bash
ls -la .taskmaster/backups/
chmod 755 .taskmaster/backups/
```

**Run with appropriate permissions:**
```bash
# If needed, run with sudo (not recommended for production)
sudo swarm-mcp start
```

### 3. Swarm CLI Integration Failures

#### Symptoms
- `swarm_generate_*` operations fail
- "Command not found" errors
- Swarm CLI execution errors

#### Solutions

**Verify Swarm CLI installation:**
```bash
npx swarm --version
# or
swarm --version
```

**Install Swarm CLI globally:**
```bash
npm install -g @ingenyus/swarm-cli
```

**Check PATH configuration:**
```bash
echo $PATH
which swarm
```

**Verify project structure:**
```bash
# Ensure you're in a Wasp project directory
ls -la main.wasp.ts
ls -la package.json
```

**Check Swarm CLI configuration:**
```bash
# Look for swarm configuration files
ls -la .swarm/
cat .swarm/config.json
```

### 4. File Operation Failures

#### Symptoms
- File read/write operations fail
- Directory listing errors
- Backup/rollback operations fail

#### Solutions

**Verify file paths:**
```bash
# Check if file exists
ls -la /path/to/file

# Verify path is relative to project root
pwd
ls -la src/components/
```

**Check file size limits:**
```bash
# Large files may exceed default limits
ls -lh /path/to/large/file

# Check configuration for file size limits
cat .taskmaster/config.json
```

**Verify MIME type detection:**
```bash
# Check file extension and content
file /path/to/file
head -c 100 /path/to/file
```

**Check symlink issues:**
```bash
# Follow symlinks to see actual targets
ls -laL /path/to/symlink
readlink -f /path/to/symlink
```

### 5. Configuration Issues

#### Symptoms
- Configuration not loading
- Default values being used
- Environment variables ignored

#### Solutions

**Check configuration file:**
```bash
cat .taskmaster/config.json
# Verify JSON syntax is valid
```

**Verify environment variables:**
```bash
# Check if variables are set
echo $SWARM_MCP_LOG_LEVEL
echo $SWARM_MCP_LOG_FORMAT

# Set variables if needed
export SWARM_MCP_LOG_LEVEL=debug
export SWARM_MCP_LOG_FORMAT=json
```

**Check configuration file location:**
```bash
# Configuration should be in project root
pwd
ls -la .taskmaster/
```

**Reset to defaults:**
```bash
# Remove configuration file to use defaults
rm .taskmaster/config.json
swarm-mcp start
```

### 6. Network and Transport Issues

#### Symptoms
- Connection refused errors
- Transport initialization failures
- Server not accessible

#### Solutions

**Check transport configuration:**
```bash
# Verify stdio transport is working
swarm-mcp start --stdio

# Check for transport configuration in config
cat .taskmaster/config.json | grep transport
```

**Verify network configuration:**
```bash
# Check if ports are available
netstat -tulpn | grep :<port>
lsof -i :<port>
```

**Check firewall settings:**
```bash
# On macOS
sudo pfctl -s rules

# On Linux
sudo iptables -L
```

### 7. Memory and Performance Issues

#### Symptoms
- Server becomes unresponsive
- High memory usage
- Slow file operations

#### Solutions

**Monitor resource usage:**
```bash
# Check memory usage
ps aux | grep swarm-mcp
top -p $(pgrep swarm-mcp)

# Check disk space
df -h
du -sh .taskmaster/backups/
```

**Clean up old backups:**
```bash
# Remove old backup files
find .taskmaster/backups/ -name "*.bak" -mtime +7 -delete

# Check backup configuration
cat .taskmaster/config.json | grep backup
```

**Optimize configuration:**
```json
{
  "logging": {
    "level": "warn",
    "format": "plain"
  },
  "backup": {
    "maxAge": 86400,
    "maxCount": 10
  }
}
```

## 🔍 Debugging Techniques

### 1. Enable Debug Logging

```bash
# Set debug level
export SWARM_MCP_LOG_LEVEL=debug

# Start server with debug logging
swarm-mcp start
```

### 2. Check Log Files

```bash
# Look for log files
find . -name "*.log" -type f

# Check system logs
journalctl -u swarm-mcp -f
```

### 3. Use Dry Run Mode

```bash
# Enable dry run for file operations
export SWARM_MCP_DRY_RUN=true
swarm-mcp start
```

### 4. Validate Project Structure

```bash
# Check if project is valid Wasp project
ls -la main.wasp.ts package.json

# Verify required directories
ls -la src/ src/components/ src/features/
```

## 🧪 Testing and Validation

### 1. Run Test Suite

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:unit
npm run test:integration

# Run with coverage
npm run test:coverage
```

### 2. Validate Configuration

```bash
# Check configuration syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('.taskmaster/config.json')))"

# Validate environment variables
node -e "console.log('LOG_LEVEL:', process.env.SWARM_MCP_LOG_LEVEL)"
```

### 3. Test Individual Operations

```bash
# Test file operations
swarm-mcp test-file-operations

# Test Swarm CLI integration
swarm-mcp test-swarm-integration
```

## 📞 Getting Help

### 1. Check Documentation

- [API Reference](./API.md)
- [Usage Examples](./EXAMPLES.md)
- [Documentation Index](./README.md)

### 2. Enable Debug Mode

```bash
export SWARM_MCP_LOG_LEVEL=debug
export SWARM_MCP_LOG_FORMAT=json
swarm-mcp start
```

### 3. Collect Debug Information

```bash
# System information
uname -a
node --version
npm --version

# Configuration
cat .taskmaster/config.json
env | grep SWARM_MCP

# Project structure
ls -la
ls -la src/
```

### 4. Report Issues

When reporting issues, include:
- Error messages and stack traces
- System information (OS, Node.js version)
- Configuration files
- Steps to reproduce
- Debug logs

## 🔧 Preventive Measures

### 1. Regular Maintenance

```bash
# Clean up old backups weekly
find .taskmaster/backups/ -name "*.bak" -mtime +7 -delete

# Check disk space
df -h | grep -E "(Filesystem|/dev/)"
```

### 2. Configuration Validation

```bash
# Validate configuration on startup
swarm-mcp validate-config

# Check configuration syntax
swarm-mcp check-config
```

### 3. Health Checks

```bash
# Run health check
swarm-mcp health-check

# Monitor server status
swarm-mcp status
```

### 4. Backup Strategy

```json
{
  "backup": {
    "enabled": true,
    "maxAge": 86400,
    "maxCount": 10,
    "directory": ".taskmaster/backups"
  }
}
```

## 🚀 Performance Optimization

### 1. Logging Optimization

```json
{
  "logging": {
    "level": "warn",
    "format": "plain",
    "serviceName": "swarm-mcp"
  }
}
```

### 2. Backup Optimization

```json
{
  "backup": {
    "maxAge": 3600,
    "maxCount": 5,
    "compression": true
  }
}
```

### 3. File Operation Limits

```json
{
  "filesystem": {
    "maxFileSize": 10485760,
    "maxBackupSize": 52428800
  }
}
```

This troubleshooting guide should help you resolve most common issues. If you continue to experience problems, please check the documentation or report an issue with detailed information about your environment and the specific error you're encountering.
