import changelogGithub from '@changesets/changelog-github';

/**
 * Removes all commit message body content, keeping only commit headers
 *
 * Example:
 *   - [#19](...) - feat: simplify plugin API
 *     - Replace lazy-loading function...
 *     - Fix enum value...
 * Becomes:
 *   - [#19](...) - feat: simplify plugin API
 */
function keepOnlyFirstLine(text) {
  if (!text) return text;

  const lines = text.split('\n');
  const result = [];
  let skipUntilNextHeader = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Keep empty lines
    if (!trimmed) {
      result.push(line);
      skipUntilNextHeader = false;
      continue;
    }

    // Keep non-bullet lines (section headers, etc.)
    if (!trimmed.startsWith('- ')) {
      result.push(line);
      skipUntilNextHeader = false;
      continue;
    }

    // If this is a main header (starts with '- [' containing PR link)
    if (trimmed.startsWith('- [') && line.includes('[#')) {
      result.push(line);
      skipUntilNextHeader = true; // Skip all subsequent lines until next header
      continue;
    }

    // Skip nested bullet points and body content
    if (skipUntilNextHeader) {
      continue;
    }

    // Fallback: keep the line if we're not skipping
    result.push(line);
  }

  return result.join('\n');
}

/**
 * Custom changelog generator that keeps only the first line of commit messages
 * Wraps @changesets/changelog-github and removes body content
 */
async function getReleaseLine(changeset, type, options) {
  // Get the changelog entry from the GitHub changelog generator
  const changelogEntry = await changelogGithub.getReleaseLine(
    changeset,
    type,
    options
  );

  // Keep only the first line of each commit message
  return keepOnlyFirstLine(changelogEntry);
}

/**
 * Get dependency release line (for "Updated dependencies" section)
 */
async function getDependencyReleaseLine(
  changesets,
  dependenciesUpdated,
  options
) {
  // Get the dependency release line from the GitHub changelog generator
  const dependencyLine = await changelogGithub.getDependencyReleaseLine(
    changesets,
    dependenciesUpdated,
    options
  );

  // Keep only the first line of each commit message
  return keepOnlyFirstLine(dependencyLine);
}

export default {
  getReleaseLine,
  getDependencyReleaseLine,
};
