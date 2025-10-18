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
    const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return packageDirs;
  } catch (error) {
    console.warn('Warning: Could not read packages directory, falling back to default scopes');
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
 * @returns {Object} - { packageName, changeType, description }
 */
export function parseCommitMessage(message) {
  let packageName = null;
  let changeType = null;
  let description = null;

  // Get the first package directory as default (usually swarm)
  const defaultPackage = getValidScopes()[0] || 'swarm';

  // Check for breaking changes first
  if (commitPatterns.major.test(message)) {
    const match = message.match(commitPatterns.major);
    changeType = 'major';
    packageName = match[1] ? mapScopeToPackage(match[1]) || defaultPackage : defaultPackage;
    description = match[2];
  } else if (commitPatterns.majorAlt.test(message)) {
    const match = message.match(commitPatterns.majorAlt);
    changeType = 'major';
    packageName = match[2] ? mapScopeToPackage(match[2]) || defaultPackage : defaultPackage;
    description = match[3];
  } else if (commitPatterns.minor.test(message)) {
    const match = message.match(commitPatterns.minor);
    const scope = match[1];
    const mappedPackage = scope ? mapScopeToPackage(scope) : defaultPackage;
    if (mappedPackage) {
      changeType = 'minor';
      packageName = mappedPackage;
      description = match[2];
    }
  } else if (commitPatterns.patch.test(message)) {
    const match = message.match(commitPatterns.patch);
    const scope = match[1];
    const mappedPackage = scope ? mapScopeToPackage(scope) : defaultPackage;
    if (mappedPackage) {
      changeType = 'patch';
      packageName = mappedPackage;
      description = match[2];
    }
  } else if (commitPatterns.patchAlt.test(message)) {
    const match = message.match(commitPatterns.patchAlt);
    const scope = match[2];
    const mappedPackage = scope ? mapScopeToPackage(scope) : defaultPackage;
    if (mappedPackage) {
      changeType = 'patch';
      packageName = mappedPackage;
      description = match[3];
    }
  }

  return { packageName, changeType, description };
}

/**
 * Convert package name to file-friendly format
 * @param {string} packageName - Full package name (e.g., '@ingenyus/swarm-cli')
 * @returns {string} - File-friendly package name (e.g., 'swarm-cli')
 */
function packageNameToFileFriendly(packageName) {
  return packageName
    .replace(/^@[^/]+\//, '') // Remove @scope/ prefix
    .replace(/[/@]/g, '-')    // Replace / and @ with -
    .replace(/[^a-zA-Z0-9\-_]/g, '-') // Replace other non-alphanumeric chars with -
    .replace(/-+/g, '-')      // Replace multiple consecutive - with single -
    .replace(/^-|-$/g, '');   // Remove leading/trailing -
}

/**
 * Create a changeset file with the given content
 * @param {string} packageName - Full package name (e.g., '@ingenyus/swarm-cli')
 * @param {string} changeType - Version bump type (patch/minor/major)
 * @param {string} description - Change description
 * @param {string} filenamePrefix - Prefix for the changeset filename
 * @returns {string} - The created filename
 */
export function createChangesetFile(packageName, changeType, description, filenamePrefix = 'auto') {
  const fileFriendlyPackage = packageNameToFileFriendly(packageName);
  const filename = `${filenamePrefix}-changeset-${fileFriendlyPackage}.md`;
  const filepath = path.join('.changeset', filename);
  const changesetContent = `---
"${packageName}": ${changeType}
---

${description}
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
 * Get commits since the last release tag
 * @returns {Array} - Array of { hash, message } objects
 */
export function getCommitsSinceLastRelease() {
  try {
    // Try to get the last release tag
    const lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""').toString().trim();
    let commitRange;
    if (lastTag) {
      commitRange = `${lastTag}..HEAD`;
      console.log(`📋 Processing commits since last release: ${lastTag}`);
    } else {
      commitRange = 'HEAD';
      console.log('📋 Processing all commits (no previous release found)');
    }

    const commits = execSync(`git log ${commitRange} --format="%H|%s" --reverse`).toString().trim();

    if (!commits) {
      console.log('ℹ️  No new commits to process');
      return [];
    }
    return commits.split('\n').map(line => {
      const [hash, message] = line.split('|');
      return { hash, message };
    });
  } catch (error) {
    console.error('Error getting commits:', error.message);
    return [];
  }
}

/**
 * Group changes by package and determine the highest version bump needed
 * @param {Array} commits - Array of commit objects
 * @returns {Object} - Package changes grouped by package name
 */
export function consolidateChanges(commits) {
  const packageChanges = {};

  commits.forEach(({ hash, message }) => {
    const { packageName, changeType, description } = parseCommitMessage(message);

    if (packageName && changeType && description) {
      const fullPackageName = `@ingenyus/${packageName}`;

      if (!packageChanges[fullPackageName]) {
        packageChanges[fullPackageName] = {
          changeType: changeType,
          descriptions: [],
          commits: []
        };
      }

      // Upgrade change type if necessary (patch < minor < major)
      const currentType = packageChanges[fullPackageName].changeType;
      const typeHierarchy = { patch: 1, minor: 2, major: 3 };

      if (typeHierarchy[changeType] > typeHierarchy[currentType]) {
        packageChanges[fullPackageName].changeType = changeType;
      }

      packageChanges[fullPackageName].descriptions.push(description);
      packageChanges[fullPackageName].commits.push({ hash: hash.substring(0, 7), message });
    }
  });
  return packageChanges;
}

/**
 * Print help message for valid conventional commit patterns
 */
export function printValidPatterns() {
  const scopes = getValidScopes();
  const scopeExamples = scopes.map(scope => {
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
