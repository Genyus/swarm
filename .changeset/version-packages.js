/* eslint-disable no-undef */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = process.argv[2] || 'genyus/swarm';

const authorCache = {};

async function mapAuthorToGitHub(authorName, authorEmail) {
  const cacheKey = `${authorName}<${authorEmail}>`;
  if (authorCache[cacheKey]) {
    return authorCache[cacheKey];
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      const response = await fetch(
        `https://api.github.com/search/users?q=${encodeURIComponent(authorEmail)}+in:email`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const user = data.items[0];
          const result = {
            username: user.login,
            url: user.html_url,
          };
          authorCache[cacheKey] = result;
          return result;
        }
      }
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: try to extract username from email or name
  let username = authorName.toLowerCase().replace(/\s+/g, '-');

  if (authorEmail.includes('@')) {
    const emailUsername = authorEmail.split('@')[0];
    if (emailUsername.match(/^[a-z0-9][a-z0-9-]*$/i)) {
      username = emailUsername;
    }
  }

  const result = {
    username,
    url: `https://github.com/${username}`,
  };
  authorCache[cacheKey] = result;
  return result;
}

async function getContributorsForCommits(commitHashes) {
  const allAuthors = new Map();

  for (const commitHash of commitHashes) {
    try {
      const authorName = execSync(
        `git log -1 --format=%an ${commitHash} 2>/dev/null || echo ""`,
        { encoding: 'utf8' }
      ).trim();
      const authorEmail = execSync(
        `git log -1 --format=%ae ${commitHash} 2>/dev/null || echo ""`,
        { encoding: 'utf8' }
      ).trim();

      if (authorName && authorEmail) {
        const key = `${authorName}<${authorEmail}>`;
        if (!allAuthors.has(key)) {
          const githubInfo = await mapAuthorToGitHub(authorName, authorEmail);
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

  if (allAuthors.size === 0) {
    return null;
  }

  const contributors = Array.from(allAuthors.values())
    .filter(
      (author) =>
        author.github && author.github.username !== 'github-actions[bot]'
    )
    .map((author) => `[${author.github.username}](${author.github.url})`)
    .sort()
    .join(', ');

  return contributors.length > 0 ? contributors : null;
}

// First, run changeset version to generate changelogs
try {
  execSync('npx changeset version', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running changeset version:', error.message);
  process.exit(1);
}

// Find all CHANGELOG.md files
const packagesDir = path.join(__dirname, '../packages');
if (!fs.existsSync(packagesDir)) {
  process.exit(0);
}

const packages = fs
  .readdirSync(packagesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

(async () => {
  for (const pkg of packages) {
    const changelogPath = path.join(packagesDir, pkg, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) continue;

    let content = fs.readFileSync(changelogPath, 'utf8');

    await processChangelog(changelogPath, content, repo);
  }
})();

async function processChangelog(changelogPath, content, repo) {
  content = content.replace(/^### Patch Changes\s*\n\s*/gm, '');
  content = content.replace(
    /\n\n(\[[\d.]+\]: https:\/\/github\.com\/[^\s]+(?:\n\[[\d.]+\]: https:\/\/github\.com\/[^\s]+)*)\n*$/g,
    ''
  );

  content = content.replace(
    /^## (\[?)(\d+\.\d+\.\d+)(\]?)(.*)$/gm,
    (m, open, version, close, rest) => {
      if (open === '[' && close === ']') {
        return m;
      }

      let date = new Date().toISOString().split('T')[0];
      try {
        const tagDate = execSync(
          `git log -1 --format=%ai v${version} 2>/dev/null || git log -1 --format=%ai 2>/dev/null`,
          { encoding: 'utf8' }
        ).trim();
        if (tagDate) date = new Date(tagDate).toISOString().split('T')[0];
      } catch {
        // Ignore
      }

      return `## [${version}][${version}] - ${date}${rest}`;
    }
  );

  const lines = content.split('\n');
  const newLines = [];
  let i = 0;
  let isFirstRelease = true;

  while (i < lines.length) {
    const line = lines[i];

    const versionMatch = line.match(/^## \[([\d.]+)\]\[([\d.]+)\] -/);
    if (versionMatch) {
      const version = versionMatch[1];
      let foundReference = false;
      let foundContributors = false;
      let sectionEnd = i + 1;

      while (sectionEnd < lines.length) {
        const nextLine = lines[sectionEnd];

        if (nextLine.match(/^## \[?[\d.]+/)) {
          break;
        }

        if (nextLine.match(new RegExp(`^\\[${version}\\]:`))) {
          foundReference = true;
        }

        if (nextLine.match(/^Contributors:/)) {
          foundContributors = true;
        }

        sectionEnd++;
      }

      newLines.push(line);
      i++;

      const commitHashes = new Set();
      let contributorsInsertIndex = -1;

      while (i < sectionEnd) {
        const currentLine = lines[i];

        // Track where the reference link is (before adding it) so Contributors can go before it
        if (currentLine.match(new RegExp(`^\\[${version}\\]:`))) {
          contributorsInsertIndex = newLines.length;
        }

        newLines.push(currentLine);

        const commitMatch = currentLine.match(
          /\(\[([a-f0-9]+)\]\(.+?\/commit\/([a-f0-9]+)\)\)/
        );
        if (commitMatch) {
          commitHashes.add(commitMatch[2]);
        }

        i++;
      }

      // Only add Contributors for the first (newest) release if it doesn't already have them
      if (isFirstRelease && !foundContributors && commitHashes.size > 0) {
        const contributors = await getContributorsForCommits(
          Array.from(commitHashes)
        );
        if (contributors) {
          // Insert Contributors before the reference link if it exists, otherwise at the end
          if (contributorsInsertIndex >= 0) {
            // Check if there's already a blank line before the reference link
            const hasBlankLineBefore =
              contributorsInsertIndex > 0 &&
              newLines[contributorsInsertIndex - 1].trim() === '';
            if (hasBlankLineBefore) {
              newLines.splice(
                contributorsInsertIndex,
                0,
                `Contributors: ${contributors}`
              );
            } else {
              newLines.splice(
                contributorsInsertIndex,
                0,
                '',
                `Contributors: ${contributors}`
              );
            }
          } else {
            // Check if last line is blank before adding Contributors at the end
            const hasBlankLineAtEnd =
              newLines.length > 0 &&
              newLines[newLines.length - 1].trim() === '';
            if (!hasBlankLineAtEnd) {
              newLines.push('');
            }
            newLines.push(`Contributors: ${contributors}`);
          }
        }
      }

      if (!foundReference) {
        const referenceLink = `[${version}]: https://github.com/${repo}/releases/tag/v${version}`;
        newLines.push('');
        newLines.push(referenceLink);
        newLines.push('');
      }

      isFirstRelease = false;
      continue;
    }

    newLines.push(line);
    i++;
  }

  content = newLines.join('\n');
  if (!content.endsWith('\n')) {
    content += '\n';
  }

  fs.writeFileSync(changelogPath, content);
}
