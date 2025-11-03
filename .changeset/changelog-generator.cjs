/* eslint-disable no-undef */
const { execSync } = require('child_process');

/**
 * Extract commit hashes and messages from markdown links in changeset entries
 * @param {string} summary - Changeset summary content
 * @returns {Array} - Array of { hash, fullHash, fullMessage, prefix, description } objects
 */
function extractEntriesFromSummary(summary) {
  const entries = [];
  const lines = summary.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Match pattern: - Full commit message ([shortHash](url))
    const match = trimmed.match(/^- (.+?) \(\[([a-f0-9]+)\]\(.+?\)\)/);
    if (match) {
      const fullMessage = match[1];
      const shortHash = match[2];
      // Extract full hash from URL if available
      const urlMatch = trimmed.match(/\(\[.+\]\(.+?\/commit\/([a-f0-9]+)\)\)/);
      const fullHash = urlMatch ? urlMatch[1] : shortHash;

      // Parse prefix from commit message (e.g., "feat:", "fix(scope):", "feat!:")
      let prefix = '';
      let description = fullMessage;

      // Match conventional commit format: type(scope): description or type!: description
      const prefixMatch = fullMessage.match(
        /^(\w+)(?:\(([^)]+)\))?(!?):\s*(.+)$/
      );
      if (prefixMatch) {
        const [, type, scope, breaking, desc] = prefixMatch;
        prefix = scope ? `${type}(${scope}):` : `${type}:`;
        if (breaking) {
          prefix = `${prefix.slice(0, -1)}!:`;
        }
        description = desc;
      } else {
        // Check for BREAKING CHANGE format
        if (fullMessage.startsWith('BREAKING CHANGE')) {
          const breakingMatch = fullMessage.match(
            /^BREAKING CHANGE(?:\(([^)]+)\))?:\s*(.+)$/
          );
          if (breakingMatch) {
            const [, scope, desc] = breakingMatch;
            prefix = scope ? `BREAKING CHANGE(${scope}):` : 'BREAKING CHANGE:';
            description = desc;
          }
        }
      }

      entries.push({
        hash: shortHash,
        fullHash,
        fullMessage,
        prefix,
        description,
        originalLine: trimmed,
      });
    }
  }

  return entries;
}

/**
 * Map git author to GitHub username
 * @param {string} authorName - Author name
 * @param {string} authorEmail - Author email
 * @param {string} repo - Repository in format "owner/repo"
 * @param {Object} cache - Cache object to avoid duplicate API calls
 * @returns {Promise<{username: string, url: string}>}
 */
async function mapAuthorToGitHub(authorName, authorEmail, repo, cache = {}) {
  const cacheKey = `${authorName}<${authorEmail}>`;

  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // Try to get GitHub username from git log commit
  // First, try to find a commit by this author and extract GitHub username
  try {
    // Try using GitHub API if we have a token
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      try {
        // Search for user by email
        const response = await fetch(
          `https://api.github.com/search/users?q=${encodeURIComponent(authorEmail)}`,
          {
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const username = data.items[0].login;
            const result = {
              username,
              url: `https://github.com/${username}`,
            };
            cache[cacheKey] = result;
            return result;
          }
        }
      } catch {
        // Fallback if API call fails
      }
    }
  } catch {
    // Fallback
  }

  // Fallback: try to extract username from email or name
  let username = authorName.toLowerCase().replace(/\s+/g, '-');

  // If email contains @, try to extract username part
  if (authorEmail.includes('@')) {
    const emailUsername = authorEmail.split('@')[0];
    // Use email username if it looks more like a GitHub username
    if (emailUsername.match(/^[a-z0-9][a-z0-9-]*$/i)) {
      username = emailUsername;
    }
  }

  const result = {
    username,
    url: `https://github.com/${username}`,
  };
  cache[cacheKey] = result;
  return result;
}

/**
 * Determine change category based on prefix extracted from commit message
 * @param {string} prefix - Commit prefix (e.g., "feat:", "fix:", "perf:")
 * @param {string} type - Change type from changeset (major, minor, patch) - used as fallback
 * @returns {string} - Emoji category name
 */
function getChangeCategory(prefix, type) {
  const lowerPrefix = prefix.toLowerCase();

  // Breaking changes (major)
  if (lowerPrefix.includes('breaking') || lowerPrefix.endsWith('!:')) {
    return '⚠️ Breaking Changes';
  }

  // Features (minor)
  if (lowerPrefix.startsWith('feat')) {
    return '🎉 New Features';
  }

  // Bug fixes (patch)
  if (lowerPrefix.startsWith('fix')) {
    return '🐞 Bug Fixes';
  }

  // Minor improvements (patch - perf, refactor, etc.)
  if (lowerPrefix.startsWith('perf') || lowerPrefix.startsWith('refactor')) {
    return '🔧 Minor Improvements';
  }

  // Fallback to type-based categorization
  if (type === 'major') {
    return '⚠️ Breaking Changes';
  }
  if (type === 'minor') {
    return '🎉 New Features';
  }
  // Default patch category is bug fixes
  return '🐞 Bug Fixes';
}

/**
 * Custom changelog generator
 */
const authorCache = {}; // Shared cache across calls

async function getReleaseLine(changeset, type, options) {
  const { summary } = changeset;
  const { repo } = options;

  if (!summary) {
    return '';
  }

  // Extract entries from pre-formatted summary
  const entries = extractEntriesFromSummary(summary);

  if (entries.length === 0) {
    return '';
  }

  // Extract authors from changeset file if available
  // We need to read the changeset file to get authors
  // The changeset object doesn't directly expose file content
  // So we'll need to get authors from git commits instead
  const allAuthors = new Map();

  // Extract authors from commit hashes
  for (const entry of entries) {
    try {
      // Get author from git commit
      const authorName = execSync(
        `git log -1 --format=%an ${entry.fullHash} 2>/dev/null || echo ""`
      )
        .toString()
        .trim();
      const authorEmail = execSync(
        `git log -1 --format=%ae ${entry.fullHash} 2>/dev/null || echo ""`
      )
        .toString()
        .trim();

      if (authorName && authorEmail) {
        const key = `${authorName}<${authorEmail}>`;
        if (!allAuthors.has(key)) {
          const githubInfo = await mapAuthorToGitHub(
            authorName,
            authorEmail,
            repo,
            authorCache
          );
          allAuthors.set(key, {
            name: authorName,
            email: authorEmail,
            github: githubInfo,
          });
        }
      }
    } catch {
      // Skip if we can't get author info
    }
  }

  // Group entries by category based on prefix
  const categories = new Map();

  for (const entry of entries) {
    const category = getChangeCategory(entry.prefix, type);
    if (!categories.has(category)) {
      categories.set(category, []);
    }

    // Strip prefix from display - show only the description part
    const displayEntry = entry.description || entry.fullMessage;
    const entryLine = `- ${displayEntry} ([${entry.hash}](https://github.com/${repo}/commit/${entry.fullHash}))`;
    categories.get(category).push(entryLine);
  }

  // Build changelog entry
  const lines = [];

  // Add entries grouped by category
  const categoryOrder = [
    '⚠️ Breaking Changes',
    '🎉 New Features',
    '🐞 Bug Fixes',
    '🔧 Minor Improvements',
  ];

  for (const category of categoryOrder) {
    if (categories.has(category)) {
      lines.push(`### ${category}`);
      lines.push('');
      for (const entryLine of categories.get(category)) {
        lines.push(entryLine);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function getDependencyReleaseLine(
  changesets,
  dependenciesUpdated,
  options
) {
  const { repo } = options || {};
  const lines = [];

  // Handle both array and object formats
  const deps = Array.isArray(dependenciesUpdated)
    ? dependenciesUpdated
    : Object.entries(dependenciesUpdated).map(([name, data]) => ({
        name,
        newVersion: data.newVersion || data.version,
      }));

  let defaultCommitHash = '';
  let defaultShortHash = '';

  try {
    const headResult = execSync(`git rev-parse HEAD 2>/dev/null || echo ""`, {
      encoding: 'utf8',
    }).trim();

    if (headResult) {
      defaultCommitHash = headResult;
      defaultShortHash = headResult.substring(0, 7);
    }
  } catch {
    try {
      const fallbackResult = execSync(
        `git log -1 --format="%H|%h" 2>/dev/null || echo ""`,
        { encoding: 'utf8' }
      ).trim();

      if (fallbackResult) {
        const [fullHash, short] = fallbackResult.split('|');
        defaultCommitHash = fullHash || '';
        defaultShortHash = short || defaultCommitHash.substring(0, 7);
      }
    } catch {
      // Ignore
    }
  }

  const allAuthors = new Map();

  if (Array.isArray(changesets)) {
    for (const changeset of changesets) {
      if (changeset.summary) {
        const entries = extractEntriesFromSummary(changeset.summary);
        for (const entry of entries) {
          try {
            const authorName = execSync(
              `git log -1 --format=%an ${entry.fullHash} 2>/dev/null || echo ""`
            )
              .toString()
              .trim();
            const authorEmail = execSync(
              `git log -1 --format=%ae ${entry.fullHash} 2>/dev/null || echo ""`
            )
              .toString()
              .trim();

            if (authorName && authorEmail) {
              const key = `${authorName}<${authorEmail}>`;
              if (!allAuthors.has(key)) {
                const githubInfo = await mapAuthorToGitHub(
                  authorName,
                  authorEmail,
                  repo,
                  authorCache
                );
                allAuthors.set(key, {
                  name: authorName,
                  email: authorEmail,
                  github: githubInfo,
                });
              }
            }
          } catch {
            // Skip if we can't get author info
          }
        }
      }
    }
  }

  if (deps.length > 0) {
    lines.push('### 📦 Updated Dependencies');
    lines.push('');

    for (const dependency of deps) {
      const { name, newVersion } = dependency;

      let commitHash = defaultCommitHash;
      let shortHash = defaultShortHash;

      try {
        const commitResult = execSync(
          `git log --all --format="%H|%h" -1 -- "packages/*/package.json" 2>/dev/null || echo ""`,
          { encoding: 'utf8' }
        ).trim();

        if (commitResult) {
          const [fullHash, short] = commitResult.split('|');
          commitHash = fullHash || commitHash;
          shortHash = short || shortHash;
        }
      } catch {
        // Ignore
      }

      if (commitHash && shortHash) {
        const commitUrl = `https://github.com/${repo || 'genyus/swarm'}/commit/${commitHash}`;
        lines.push(
          `- update ${name} to ${newVersion} ([${shortHash}](${commitUrl}))`
        );
      } else {
        lines.push(`- update ${name} to ${newVersion}`);
      }

      if (commitHash) {
        try {
          const authorName = execSync(
            `git log -1 --format=%an ${commitHash} 2>/dev/null || echo ""`
          )
            .toString()
            .trim();
          const authorEmail = execSync(
            `git log -1 --format=%ae ${commitHash} 2>/dev/null || echo ""`
          )
            .toString()
            .trim();

          if (authorName && authorEmail) {
            const key = `${authorName}<${authorEmail}>`;
            if (!allAuthors.has(key)) {
              const githubInfo = await mapAuthorToGitHub(
                authorName,
                authorEmail,
                repo,
                authorCache
              );
              allAuthors.set(key, {
                name: authorName,
                email: authorEmail,
                github: githubInfo,
              });
            }
          }
        } catch {
          // Skip if we can't get author info
        }
      }
    }
  }

  return lines.join('\n');
}

module.exports = {
  getReleaseLine,
  getDependencyReleaseLine,
};
