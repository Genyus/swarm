/* eslint-disable no-undef */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Get valid scopes by reading package directories
 * @returns {Array} - Array of valid scope names
 */
function getValidScopes() {
  try {
    const packagesDir = path.join(process.cwd(), 'packages');
    const packageDirs = fs
      .readdirSync(packagesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    return packageDirs;
  } catch {
    console.warn(
      'Warning: Could not read packages directory, falling back to default scopes'
    );
    return ['swarm', 'swarm-wasp'];
  }
}

/**
 * Map scope to full package name, handling prefix variations
 * @param {string} scope - The scope from commit message
 * @returns {string} - The full package directory name
 */
function mapScopeToPackage(scope) {
  const validScopes = getValidScopes();

  // Special case: 'core' maps to 'swarm' package
  if (scope === 'core') {
    return 'swarm';
  }

  // Direct match (e.g., "swarm-cli" -> "swarm-cli")
  if (validScopes.includes(scope)) {
    return scope;
  }
  // Try with "swarm-" prefix (e.g., "cli" -> "swarm-cli")
  const withPrefix = `swarm-${scope}`;
  if (validScopes.includes(withPrefix)) {
    return withPrefix;
  }

  return null;
}

// Export for use in help messages
const validScopes = getValidScopes();

// Define regex patterns for conventional commits
const commitPatterns = {
  major: /^BREAKING CHANGE(?:\(([^)]+)\))?: (.+)/,
  majorAlt: /^(\w+)(?:\(([^)]+)\))?!: (.+)/, // feat!: or fix!: syntax
  minor: /^feat(?:\(([^)]+)\))?: (.+)/,
  patch: /^fix(?:\(([^)]+)\))?: (.+)/,
  patchAlt: /^(perf|refactor)(?:\(([^)]+)\))?: (.+)/, // performance improvements and refactors
};

/**
 * Parse a conventional commit message and extract package, change type, and description
 * @param {string} message - The commit message to parse
 * @returns {Object} - { packageName, changeType, description, hasExplicitScope }
 */
export function parseCommitMessage(message) {
  let packageName = null;
  let changeType = null;
  let description = null;
  let hasExplicitScope = false;

  // Get the first package directory as default (usually swarm)
  const defaultPackage = validScopes[0] || 'swarm';

  // Check for breaking changes first
  if (commitPatterns.major.test(message)) {
    const match = message.match(commitPatterns.major);
    changeType = 'major';
    if (match[1]) {
      hasExplicitScope = true;
      packageName = mapScopeToPackage(match[1]) || defaultPackage;
    } else {
      packageName = defaultPackage;
    }
    description = match[2];
  } else if (commitPatterns.majorAlt.test(message)) {
    const match = message.match(commitPatterns.majorAlt);
    changeType = 'major';
    if (match[2]) {
      hasExplicitScope = true;
      packageName = mapScopeToPackage(match[2]) || defaultPackage;
    } else {
      packageName = defaultPackage;
    }
    description = match[3];
  } else if (commitPatterns.minor.test(message)) {
    const match = message.match(commitPatterns.minor);
    const scope = match[1];
    if (scope) {
      hasExplicitScope = true;
      const mappedPackage = mapScopeToPackage(scope);
      if (mappedPackage) {
        packageName = mappedPackage;
        changeType = 'minor';
        description = match[2];
      }
    } else {
      packageName = defaultPackage;
      changeType = 'minor';
      description = match[2];
    }
  } else if (commitPatterns.patch.test(message)) {
    const match = message.match(commitPatterns.patch);
    const scope = match[1];
    if (scope) {
      hasExplicitScope = true;
      const mappedPackage = mapScopeToPackage(scope);
      if (mappedPackage) {
        packageName = mappedPackage;
        changeType = 'patch';
        description = match[2];
      }
    } else {
      packageName = defaultPackage;
      changeType = 'patch';
      description = match[2];
    }
  } else if (commitPatterns.patchAlt.test(message)) {
    const match = message.match(commitPatterns.patchAlt);
    const scope = match[2];
    if (scope) {
      hasExplicitScope = true;
      const mappedPackage = mapScopeToPackage(scope);
      if (mappedPackage) {
        packageName = mappedPackage;
        changeType = 'patch';
        description = match[3];
      }
    } else {
      packageName = defaultPackage;
      changeType = 'patch';
      description = match[3];
    }
  }

  return { packageName, changeType, description, hasExplicitScope };
}

/**
 * Convert package name to file-friendly format
 * @param {string} packageName - Full package name (e.g., '@ingenyus/swarm-cli')
 * @returns {string} - File-friendly package name (e.g., 'swarm-cli')
 */
function packageNameToFileFriendly(packageName) {
  return packageName
    .replace(/^@[^/]+\//, '') // Remove @scope/ prefix
    .replace(/[/@]/g, '-') // Replace / and @ with -
    .replace(/[^a-zA-Z0-9\-_]/g, '-') // Replace other non-alphanumeric chars with -
    .replace(/-+/g, '-') // Replace multiple consecutive - with single -
    .replace(/^-|-$/g, ''); // Remove leading/trailing -
}

/**
 * Create a changeset file with pre-formatted changelog entries
 * @param {string} packageName - Full package name (e.g., '@ingenyus/swarm-cli')
 * @param {string} changeType - Version bump type (patch/minor/major)
 * @param {Array} commits - Array of commit objects with hash, fullHash, message, authorName, authorEmail
 * @param {string} filenamePrefix - Prefix for the changeset filename
 * @returns {string} - The created filename
 */
export function createChangesetFile(
  packageName,
  changeType,
  commits,
  filenamePrefix = 'auto'
) {
  const fileFriendlyPackage = packageNameToFileFriendly(packageName);
  const filename = `${filenamePrefix}-changeset-${fileFriendlyPackage}.md`;
  const filepath = path.join('.changeset', filename);

  // Get repository URL from git config or use default
  let repoUrl = 'https://github.com/genyus/swarm';
  try {
    const remoteUrl = execSync('git config --get remote.origin.url')
      .toString()
      .trim();
    if (remoteUrl) {
      // Convert SSH to HTTPS format if needed
      if (remoteUrl.startsWith('git@')) {
        repoUrl = remoteUrl
          .replace('git@github.com:', 'https://github.com/')
          .replace('.git', '');
      } else if (remoteUrl.includes('github.com')) {
        repoUrl = remoteUrl.replace('.git', '');
        if (!repoUrl.startsWith('http')) {
          repoUrl = `https://${repoUrl}`;
        }
      }
    }
  } catch {
    // Use default
  }

  // Format each commit as a changelog entry with commit link
  // Keep the full commit message including prefix for categorisation
  const changelogEntries = commits.map((commit) => {
    const commitUrl = `${repoUrl}/commit/${commit.fullHash}`;
    return `- ${commit.message} ([${commit.hash}](${commitUrl}))`;
  });

  // Collect unique authors
  const authors = new Set();
  commits.forEach((commit) => {
    if (commit.authorName && commit.authorEmail) {
      authors.add(`${commit.authorName}<${commit.authorEmail}>`);
    }
  });

  const authorsComment =
    authors.size > 0
      ? `\n\n<!-- Authors: ${Array.from(authors).join(', ')} -->`
      : '';

  const changesetContent = `---
"${packageName}": ${changeType}
---

${changelogEntries.join('\n')}${authorsComment}
`;

  fs.writeFileSync(filepath, changesetContent);
  return filename;
}

/**
 * Get the most recent commit message
 * @returns {string} - The commit message
 */
export function getLatestCommitMessage() {
  return execSync('git log -1 --format=%s').toString().trim();
}

/**
 * Get changed files for a specific commit
 * @param {string} hash - The commit hash
 * @returns {Array} - Array of file paths that were changed in the commit
 */
function getChangedFilesForCommit(hash) {
  try {
    const output = execSync(
      `git diff-tree --no-commit-id --name-only -r ${hash}`,
      { encoding: 'utf8' }
    ).trim();
    if (!output) {
      return [];
    }
    return output.split('\n').filter((line) => line.trim());
  } catch (error) {
    console.warn(
      `Warning: Could not get changed files for commit ${hash}:`,
      error.message
    );
    return [];
  }
}

/**
 * Extract package names from file paths
 * Checks for files in packages/<packageName>/ directories
 * @param {Array<string>} filePaths - Array of file paths
 * @returns {Array<string>} - Array of unique package directory names found
 */
function extractPackagesFromFilePaths(filePaths) {
  const validScopes = getValidScopes();
  const packagesFound = new Set();

  for (const filePath of filePaths) {
    // Match packages/<packageName>/ pattern
    const match = filePath.match(/^packages\/([^/]+)\//);
    if (match) {
      const packageDir = match[1];
      // Only include if it's a valid package directory
      if (validScopes.includes(packageDir)) {
        packagesFound.add(packageDir);
      }
    }
  }

  return Array.from(packagesFound);
}

/**
 * Get commits since the last release tag
 * @returns {Array} - Array of { hash, message, authorName, authorEmail } objects
 */
export function getCommitsSinceLastRelease() {
  try {
    // Try to get the last release tag
    const lastTag = execSync(
      'git describe --tags --abbrev=0 2>/dev/null || echo ""'
    )
      .toString()
      .trim();
    let commitRange;
    if (lastTag) {
      commitRange = `${lastTag}..HEAD`;
      console.log(`📋 Processing commits since last release: ${lastTag}`);
    } else {
      commitRange = 'HEAD';
      console.log('📋 Processing all commits (no previous release found)');
    }

    const commits = execSync(
      `git log ${commitRange} --format="%H|%s|%an|%ae" --reverse`
    )
      .toString()
      .trim();

    if (!commits) {
      console.log('ℹ️  No new commits to process');
      return [];
    }
    return commits.split('\n').map((line) => {
      const [hash, message, authorName, authorEmail] = line.split('|');
      return { hash, message, authorName, authorEmail };
    });
  } catch (error) {
    console.error('Error getting commits:', error.message);
    return [];
  }
}

/**
 * Group changes by package and determine the highest version bump needed
 * @param {Array} commits - Array of commit objects with hash, message, authorName, authorEmail
 * @returns {Object} - Package changes grouped by package name
 */
export function consolidateChanges(commits) {
  const packageChanges = {};

  commits.forEach(({ hash, message, authorName, authorEmail }) => {
    const { packageName, changeType, description, hasExplicitScope } =
      parseCommitMessage(message);

    // Skip if we don't have a valid conventional commit pattern
    if (!changeType || !description) {
      return;
    }

    let packagesToUse = [];

    // If no explicit scope was provided, try file path fallback
    if (!hasExplicitScope && packageName) {
      const changedFiles = getChangedFilesForCommit(hash);

      // Skip commits with no changed files
      if (changedFiles.length === 0) {
        return;
      }

      const packagesFromPaths = extractPackagesFromFilePaths(changedFiles);

      // If packages found via file paths, use those instead of default
      if (packagesFromPaths.length > 0) {
        packagesToUse = packagesFromPaths;
      } else {
        // No packages found in file paths - skip commits that only modify files outside packages/
        return;
      }
    } else if (packageName) {
      // Explicit scope was provided, use the parsed package name
      packagesToUse = [packageName];
    } else {
      // No package name at all, skip
      return;
    }

    // Process each package that was affected
    packagesToUse.forEach((pkgName) => {
      const fullPackageName = `@ingenyus/${pkgName}`;

      if (!packageChanges[fullPackageName]) {
        packageChanges[fullPackageName] = {
          changeType: changeType,
          descriptions: [],
          commits: [],
        };
      }

      // Upgrade change type if necessary (patch < minor < major)
      const currentType = packageChanges[fullPackageName].changeType;
      const typeHierarchy = { patch: 1, minor: 2, major: 3 };

      if (typeHierarchy[changeType] > typeHierarchy[currentType]) {
        packageChanges[fullPackageName].changeType = changeType;
      }

      packageChanges[fullPackageName].descriptions.push(description);
      packageChanges[fullPackageName].commits.push({
        hash: hash.substring(0, 7),
        fullHash: hash,
        message,
        authorName,
        authorEmail,
      });
    });
  });
  return packageChanges;
}

/**
 * Print help message for valid conventional commit patterns
 */
export function printValidPatterns() {
  const scopes = getValidScopes();
  const scopeExamples = scopes.map((scope) => {
    // Show both full name and short form if applicable
    if (scope.startsWith('swarm-')) {
      const shortForm = scope.replace('swarm-', '');
      return `${scope} or ${shortForm}`;
    }
    return scope;
  });

  console.log('⚠️  No valid conventional commit pattern found.');
  console.log('   Valid patterns:');
  console.log('   - feat: description (minor)');
  console.log('   - feat(scope): description (minor)');
  console.log('   - fix: description (patch)');
  console.log('   - fix(scope): description (patch)');
  console.log('   - feat!: description (major)');
  console.log('   - BREAKING CHANGE: description (major)');
  console.log('   - perf: description (patch)');
  console.log('   - refactor: description (patch)');
  console.log(`   Valid scopes: ${scopeExamples.join(', ')}`);
  console.log('   Examples:');
  console.log('   - feat(cli): add new command');
  console.log('   - fix(swarm-cli): resolve parsing issue');
  console.log('   - feat: add feature (defaults to first package)');
}
