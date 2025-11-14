#!/usr/bin/env node
/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');

const prNumber = process.env.PR_NUMBER;
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;

if (!prNumber || !repo || !token) {
  console.log(
    'Missing PR_NUMBER, GITHUB_REPOSITORY, or GITHUB_TOKEN. Skipping PR formatting.'
  );
  process.exit(0);
}

const packagesDir = path.join(process.cwd(), 'packages');

function extractLatestEntry(changelogPath) {
  if (!fs.existsSync(changelogPath)) return null;

  const content = fs.readFileSync(changelogPath, 'utf8');
  const lines = content.split('\n');
  const startIndex = lines.findIndex((line) => line.startsWith('## '));

  if (startIndex === -1) return null;

  const endIndex = lines.findIndex(
    (line, idx) => idx > startIndex && line.startsWith('## ')
  );

  const sectionLines =
    endIndex === -1
      ? lines.slice(startIndex)
      : lines.slice(startIndex, endIndex);

  return sectionLines.join('\n').trim();
}

function buildBody() {
  if (!fs.existsSync(packagesDir)) {
    return '';
  }

  const sections = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const changelogPath = path.join(packagesDir, entry.name, 'CHANGELOG.md');
      const latestEntry = extractLatestEntry(changelogPath);
      if (!latestEntry) return null;

      return `## ${entry.name}\n\n${latestEntry}`;
    })
    .filter(Boolean);

  return sections.join('\n\n---\n\n');
}

async function updatePullRequest(body) {
  if (!body) {
    console.log('No changelog entries found. Skipping PR update.');
    return;
  }

  const response = await fetch(
    `https://api.github.com/repos/${repo}/pulls/${prNumber}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to update PR body:', errorText);
    process.exit(1);
  }

  console.log('Release PR body updated successfully.');
}

const body = buildBody();
updatePullRequest(body).catch((error) => {
  console.error('Error updating PR body:', error);
  process.exit(1);
});
