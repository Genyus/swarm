# VS Code Debugging Guide for Swarm CLI

This guide explains how to set up and use VS Code debugging for the Swarm CLI, specifically for debugging the feature generator.

## Prerequisites

- VS Code with the TypeScript and JavaScript debugger extensions
- Node.js 18+ installed
- All dependencies installed (`pnpm install`)
- Project built (`pnpm build`)

## Debugging Configurations

I've set up several debugging configurations in `.vscode/launch.json`:

### 1. Debug Feature Generator (CLI) - **Recommended**
- **What it does**: Debugs the compiled CLI when running the feature generator
- **Best for**: Most debugging scenarios
- **How to use**: 
  1. Set breakpoints in the TypeScript source files
  2. Press F5 or go to Run and Debug → "Debug Feature Generator (CLI)"
  3. The debugger will stop at your breakpoints

### 2. Debug Feature Generator (Custom Args)
- **What it does**: Same as above but prompts for custom arguments
- **Best for**: Testing different feature names, paths, and descriptions
- **How to use**: 
  1. Set breakpoints
  2. Run this configuration
  3. Enter custom values when prompted

### 3. Debug Feature Generator (Attach to Process)
- **What it does**: Attaches to a running Node.js process with debugging enabled
- **Best for**: Debugging when the CLI is run from terminal
- **How to use**:
  1. Run this command in terminal: `node --inspect-brk=9229 packages/swarm-cli/bin/swarm feature create test-feature --path test-feature --description "Test"`
  2. Start the "Attach to Process" configuration
  3. Set breakpoints and debug

### 4. Debug Feature Generator (Direct TypeScript)
- **What it does**: Runs TypeScript directly without compilation
- **Best for**: Quick debugging without rebuilding
- **How to use**: Set breakpoints and run this configuration

## Setting Breakpoints

### Key Files to Debug

1. **Feature Generator Entry Point**:
   - `packages/swarm/src/generators/feature.ts`
   - Set breakpoints in the `create` method (line ~104)

2. **CLI Command Handler**:
   - `packages/swarm-cli/src/cli/commands/feature.command.ts`
   - Set breakpoints in the command execution logic

3. **Main CLI Entry**:
   - `packages/swarm-cli/src/cli/index.ts`
   - Set breakpoints in the `main` function

### Common Breakpoint Locations

```typescript
// In FeatureGenerator.create() method
async create(featurePath: string, flags: FeatureFlags): Promise<void> {
  // Set breakpoint here to debug feature creation start
  const { name, path: featureName, description } = flags;
  
  // Set breakpoint here to debug path validation
  const validatedPath = validateFeaturePath(featurePath);
  
  // Set breakpoint here to debug directory creation
  const featureDir = getFeatureDir(validatedPath, featureName);
  
  // Set breakpoint here to debug template processing
  const templatesDir = getTemplatesDir();
}
```

## Debugging Workflow

### Step 1: Prepare for Debugging
1. Ensure the project is built: `pnpm build`
2. Open the feature generator file: `packages/swarm/src/generators/feature.ts`
3. Set breakpoints at the locations you want to inspect

### Step 2: Start Debugging
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Debug: Start Debugging"
3. Select "Debug Feature Generator (CLI)"
4. The debugger will start and stop at your first breakpoint

### Step 3: Debug
- Use F10 to step over
- Use F11 to step into
- Use Shift+F11 to step out
- Use F5 to continue
- Use Shift+F5 to stop debugging

### Step 4: Inspect Variables
- Hover over variables to see their values
- Use the Variables panel to inspect all local variables
- Use the Watch panel to add expressions to monitor
- Use the Debug Console to evaluate expressions

## Common Debugging Scenarios

### Debugging Feature Creation Issues
1. Set breakpoint in `FeatureGenerator.create()` method
2. Run "Debug Feature Generator (CLI)"
3. Step through the feature creation process
4. Inspect the `featurePath`, `flags`, and intermediate variables

### Debugging Template Processing
1. Set breakpoint in template-related methods
2. Inspect template paths and content
3. Check file system operations

### Debugging Error Handling
1. Set breakpoint in error handling code
2. Use the Call Stack panel to see the error path
3. Inspect error objects and their properties

## Troubleshooting

### Source Maps Not Working
- Ensure `sourceMaps: true` in the configuration
- Check that `outFiles` includes the correct dist directories
- Rebuild the project: `pnpm build`

### Breakpoints Not Hit
- Ensure the file is saved
- Check that you're setting breakpoints in the correct file (source, not dist)
- Verify the debugging configuration is correct

### TypeScript Not Loading
- Ensure tsx is installed: `pnpm add -D tsx`
- Check that the runtime args include the tsx loader

### Process Not Attaching
- Ensure the process is running with `--inspect-brk=9229`
- Check that the port 9229 is not in use
- Verify the process is running in the correct directory

## Advanced Debugging

### Debugging with Custom Arguments
1. Use the "Custom Args" configuration
2. Enter your specific feature name, path, and description
3. Debug with your exact scenario

### Debugging Multiple Commands
1. Modify the `args` array in the launch configuration
2. Add different CLI commands to test various scenarios

### Debugging Integration Tests
1. Set breakpoints in the test files
2. Use the "Direct TypeScript" configuration
3. Run specific test files

## Tips

1. **Use the Debug Console**: Evaluate expressions and inspect variables
2. **Set Conditional Breakpoints**: Right-click on a breakpoint to add conditions
3. **Use Logpoints**: Add logging without modifying code
4. **Debug Async Code**: Use `await` in the Debug Console to inspect promises
5. **Inspect Call Stack**: Use the Call Stack panel to understand execution flow

## Example Debugging Session

1. Open `packages/swarm/src/generators/feature.ts`
2. Set breakpoint at line 104 (start of `create` method)
3. Press F5 and select "Debug Feature Generator (CLI)"
4. When the debugger stops:
   - Inspect the `featurePath` and `flags` parameters
   - Step through the validation logic
   - Check the directory creation process
   - Examine template processing
   - Debug any error conditions

This setup gives you full line-by-line debugging capabilities for the feature generator when called from the CLI.
