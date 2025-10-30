#!/usr/bin/env node
/* global console */

import { execSync } from "child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import process from "process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

/**
 * Parse shadcn CLI output to extract installed file paths
 * @param {string} output - The stdout/stderr from shadcn command
 * @returns {string[]} Array of file paths that were created/updated
 */
function parseInstalledFiles(output) {
  const lines = output.split("\n");
  const files = [];

  for (const line of lines) {
    if (line.trim().startsWith("- ")) {
      const filePath = line.trim().substring(2);
      if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
        files.push(filePath);
      }
    }
  }

  return files;
}

/**
 * Fix import paths in a file to use relative paths
 * @param {string} filePath - Path to the file to fix
 */
function fixImportPaths(filePath) {
  if (!existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = readFileSync(filePath, "utf8");
  let modified = false;

  // Fix @/ aliases to relative paths
  const aliasPattern = /from\s+['"]@\/([^'"]+)['"]/g;
  content = content.replace(aliasPattern, (match, path) => {
    modified = true;
    // Convert @/lib/utils to ../../lib/utils (from ui/ to shared/client/)
    if (path === "lib/utils") {
      return `from "../../lib/utils"`;
    }
    // Convert @/hooks/... to ../../hooks/...
    if (path.startsWith("hooks/")) {
      return `from "../../${path}"`;
    }
    // Convert @/components/... to ../... (from ui/ to components/)
    if (path.startsWith("components/")) {
      return `from "../${path.replace("components/", "")}"`;
    }
    // Default fallback
    return `from "../../${path}"`;
  });

  // Fix src/shared/client/ absolute paths to relative paths
  const absolutePattern = /from\s+['"]src\/shared\/client\/([^'"]+)['"]/g;
  content = content.replace(absolutePattern, (match, path) => {
    modified = true;
    // Convert src/shared/client/lib/utils to ../../lib/utils
    if (path === "lib/utils") {
      return `from "../../lib/utils"`;
    }
    // Convert src/shared/client/hooks/... to ../../hooks/...
    if (path.startsWith("hooks/")) {
      return `from "../../${path}"`;
    }
    // Convert src/shared/client/components/ui/... to ./... (same directory)
    if (path.startsWith("components/ui/")) {
      return `from "./${path.replace("components/ui/", "")}"`;
    }
    // Convert src/shared/client/components/... to ../... (from ui/ to components/)
    if (path.startsWith("components/")) {
      return `from "../${path.replace("components/", "")}"`;
    }
    // Default fallback
    return `from "../../${path}"`;
  });

  // Fix src/lib/utils to relative path
  const srcLibPattern = /from\s+['"]src\/lib\/utils['"]/g;
  content = content.replace(srcLibPattern, () => {
    modified = true;
    return `from "../../lib/utils"`;
  });

  if (modified) {
    writeFileSync(filePath, content, "utf8");
  }
}

/**
 * Format files with Prettier
 * @param {string[]} files - Array of file paths to format
 */
function formatFiles(files) {
  if (files.length === 0) return;

  try {
    const fileList = files.join(" ");
    execSync(
      `./node_modules/.bin/prettier --log-level=silent --write ${fileList}`,
      {
        cwd: projectRoot,
        stdio: "inherit",
      },
    );
    console.log("✓ Formatted files");
  } catch (error) {
    console.warn("✖︎ Prettier formatting failed:", error.message);
  }
}

/**
 * Update the ui/index.ts file to export all .tsx files
 */
function updateIndexFile() {
  const uiDir = join(projectRoot, "src/shared/client/components/ui");
  const indexPath = join(uiDir, "index.ts");

  // Get all .tsx files in the ui directory
  const files = readdirSync(uiDir)
    .filter((file) => file.endsWith(".tsx"))
    .sort();

  // Generate export statements
  const exports = files
    .map((file) => {
      const componentName = file.replace(".tsx", "");
      return `export * from "./${componentName}";`;
    })
    .join("\n");

  // Write the index file
  writeFileSync(indexPath, exports + "\n", "utf8");
  console.log("✓ Updated ui/index.ts");
}

/**
 * Lint files with ESLint
 * @param {string[]} files - Array of file paths to lint
 */
function lintFiles(files) {
  if (files.length === 0) return;

  try {
    const fileList = files.join(" ");
    execSync(`./node_modules/.bin/eslint --quiet --fix ${fileList}`, {
      cwd: projectRoot,
      stdio: "pipe",
    });
    console.log("✓ Linted files");
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || "";
    const errorFiles = new Set();
    const lines = output.split("\n");

    for (const line of lines) {
      const match = files.find((file) => line.includes(file));

      if (match) {
        errorFiles.add(match);
      }
    }

    const filesToShow = errorFiles.size > 0 ? Array.from(errorFiles) : files;

    console.warn("✖︎ Linting failed:");
    console.warn(
      filesToShow
        .map((file) => `  - ${file.replace(projectRoot, "")}`)
        .join("\n"),
    );
  }
}

/**
 * Main function to add shadcn component
 * @param {string} componentName - Name of the component to add
 */
async function addComponent(componentName) {
  if (!componentName) {
    console.error("Error: Component name is required");
    console.log("Usage: npm run add-ui <component-name>");
    process.exit(1);
  }

  try {
    console.log(`ℹ︎ Downloading '${componentName}' component...`);

    const command = `npx shadcn@latest add ${componentName} --path=src/shared/client/components/ui`;
    const output = execSync(command, {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    const installedFiles = parseInstalledFiles(output);

    if (installedFiles.length === 0) {
      console.warn("✖︎ No files were added or updated");
      return;
    }

    console.log(
      `✓ Added ${installedFiles.length} file${
        installedFiles.length === 1 ? "" : "s"
      }:`,
    );
    console.log(
      installedFiles
        .map((file) => `  - ${file.replace(projectRoot, "")}`)
        .join("\n"),
    );

    for (const file of installedFiles) {
      const fullPath = join(projectRoot, file);
      fixImportPaths(fullPath);
    }

    console.log(`✓ Fixed imports`);
    updateIndexFile();
    lintFiles(installedFiles);
    formatFiles(installedFiles);
    console.log(`✓ Successfully added '${componentName}' component`);
  } catch (error) {
    console.error(
      `✖︎ Error adding '${componentName}' component:`,
      error.message,
    );
    process.exit(1);
  }
}

const componentName = process.argv[2];

addComponent(componentName);
