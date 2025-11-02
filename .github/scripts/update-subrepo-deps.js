#!/usr/bin/env node
/* eslint-disable no-undef */
/**
 * Updates swarm-wasp-starter subrepo dependencies based on published packages
 * - Patch versions: Skipped (handled by caret ^ constraint)
 * - Minor versions: Direct push to subrepo main
 * - Major versions: Create PR in subrepo
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const SUBREPO_OWNER = 'Genyus';
const SUBREPO_REPO = 'swarm-wasp-starter';
const SUBREPO_BRANCH = 'main';
const PACKAGES_TO_UPDATE = ['@ingenyus/swarm', '@ingenyus/swarm-wasp'];

/**
 * Parse version string and return major, minor, patch
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    full: version,
  };
}

/**
 * Determine version bump type by comparing old and new versions
 */
function getBumpType(oldVersion, newVersion) {
  const old = parseVersion(oldVersion);
  const newV = parseVersion(newVersion);

  if (newV.major > old.major) return 'major';
  if (newV.minor > old.minor) return 'minor';
  if (newV.patch > old.patch) return 'patch';
  return 'none';
}

/**
 * Extract current version from package.json dependency
 */
function getCurrentVersion(packageJson, packageName) {
  const deps = packageJson.dependencies || {};
  const version = deps[packageName];
  if (!version) return null;
  // Extract version number from caret/tilde constraint like "^1.2.3"
  const match = version.match(/[\d.]+/);
  return match ? match[0] : null;
}

/**
 * Analyze updates and determine which need processing
 */
function analyzeUpdates(oldPackageJson, updates) {
  const relevant = [];

  updates.forEach(({ name, version }) => {
    const currentVersion = getCurrentVersion(oldPackageJson, name);
    if (!currentVersion) {
      console.log(`  ⚠️  ${name} not found in dependencies, skipping`);
      return;
    }

    const bumpType = getBumpType(currentVersion, version);
    console.log(`  ${name}: ${currentVersion} -> ${version} (${bumpType})`);

    if (bumpType === 'none') {
      console.log(`  ⏭️  Skipping ${name} (no version change)`);
      return;
    }

    if (bumpType === 'patch') {
      console.log(`  ⏭️  Skipping ${name} (patch update handled by caret ^)`);
      return;
    }

    relevant.push({ name, version, bumpType });
  });

  return relevant;
}

/**
 * Update package.json with new versions
 */
function updatePackageJson(packageJsonPath, updates) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  updates.forEach(({ name, version }) => {
    if (packageJson.dependencies && packageJson.dependencies[name]) {
      packageJson.dependencies[name] = `^${version}`;
      console.log(`  ✓ Updated ${name} to ^${version}`);
    }
  });

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n'
  );
}

/**
 * Get subrepo remote URL with authentication token
 */
function getSubrepoRemote(token) {
  return `https://${token}@github.com/${SUBREPO_OWNER}/${SUBREPO_REPO}.git`;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Get published packages from environment variable
    const publishedPackagesJson = process.env.PUBLISHED_PACKAGES || '[]';
    const publishedPackages = JSON.parse(publishedPackagesJson);

    if (!publishedPackages || publishedPackages.length === 0) {
      console.log('ℹ️  No packages were published, skipping subrepo update');
      process.exit(0);
    }

    // Filter to only packages we care about
    const updates = publishedPackages
      .filter((pkg) => PACKAGES_TO_UPDATE.includes(pkg.name))
      .map((pkg) => ({
        name: pkg.name,
        version: pkg.version,
      }));

    if (updates.length === 0) {
      console.log(
        'ℹ️  No relevant packages published, skipping subrepo update'
      );
      process.exit(0);
    }

    console.log(
      `\n📦 Updating subrepo with ${updates.length} package update(s):`
    );
    updates.forEach(({ name, version }) => {
      console.log(`  - ${name}@${version}`);
    });

    // Get GitHub token
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    // Clone subrepo to temporary directory
    const tmpDir = path.join(process.cwd(), 'tmp-subrepo');
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }

    console.log('\n📥 Cloning subrepo...');
    const subrepoRemote = getSubrepoRemote(githubToken);
    await execAsync(`git clone ${subrepoRemote} ${tmpDir}`, {
      env: { ...process.env },
    });

    const packageJsonPath = path.join(tmpDir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found in subrepo');
    }

    // Read current package.json (before updates)
    const oldPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Analyze which updates are relevant (skip patch and none)
    console.log('\n📝 Analyzing version bumps...');
    const relevantUpdates = analyzeUpdates(oldPackageJson, updates);

    if (relevantUpdates.length === 0) {
      console.log(
        '\n✅ No updates needed (all were patch updates or no changes)'
      );
      fs.rmSync(tmpDir, { recursive: true, force: true });
      process.exit(0);
    }

    // Separate major and minor bumps
    const majorBumps = relevantUpdates.filter((u) => u.bumpType === 'major');
    const minorBumps = relevantUpdates.filter((u) => u.bumpType === 'minor');
    const hasMajorBump = majorBumps.length > 0;

    // Update package.json
    console.log('\n📝 Updating package.json...');
    updatePackageJson(packageJsonPath, relevantUpdates);

    // Setup git in subrepo
    await execAsync('git config user.name "github-actions[bot]"', {
      cwd: tmpDir,
    });
    await execAsync(
      'git config user.email "41898282+github-actions[bot]@users.noreply.github.com"',
      { cwd: tmpDir }
    );
    // Configure git to use the token for authentication
    await execAsync(`git remote set-url origin ${subrepoRemote}`, {
      cwd: tmpDir,
    });

    if (hasMajorBump) {
      // Create PR for major bumps
      console.log(
        `\n🔔 Major version bump(s) detected: ${majorBumps.map((b) => b.name).join(', ')}`
      );
      console.log('📋 Creating PR in subrepo...');

      const branchName = `chore/update-deps-${Date.now()}`;
      await execAsync(`git checkout -b ${branchName}`, { cwd: tmpDir });
      await execAsync('git add package.json', { cwd: tmpDir });

      // Build commit message with all updates
      let commitLines = ['chore: update dependencies to major versions', ''];
      if (majorBumps.length > 0) {
        commitLines.push('Major:');
        majorBumps.forEach((b) => commitLines.push(`- ${b.name}@${b.version}`));
      }
      if (minorBumps.length > 0) {
        commitLines.push('');
        commitLines.push('Minor:');
        minorBumps.forEach((b) => commitLines.push(`- ${b.name}@${b.version}`));
      }

      // Write commit message to temp file for proper multi-line handling
      const commitMsgFile = path.join(tmpDir, '.commit-msg');
      fs.writeFileSync(commitMsgFile, commitLines.join('\n'));
      await execAsync('git commit -F .commit-msg', { cwd: tmpDir });
      fs.unlinkSync(commitMsgFile);
      await execAsync(`git push -u origin ${branchName}`, {
        cwd: tmpDir,
        env: { ...process.env },
      });

      // Create PR using GitHub API
      if (githubToken) {
        const prBody = `## Dependency Updates\n\nMajor version updates:\n${majorBumps.map((b) => `- \`${b.name}\`: ${getCurrentVersion(oldPackageJson, b.name)} → ${b.version}`).join('\n')}\n\n${minorBumps.length > 0 ? `\nMinor version updates (included in this PR):\n${minorBumps.map((b) => `- \`${b.name}\`: ${getCurrentVersion(oldPackageJson, b.name)} → ${b.version}`).join('\n')}` : ''}\n\n---\n\n⚠️ **Breaking changes may be present** - please review before merging.`;

        const prPayload = JSON.stringify({
          title: `chore: update dependencies to major versions`,
          body: prBody,
          head: branchName,
          base: SUBREPO_BRANCH,
        });

        try {
          const { stdout: prResponse } = await execAsync(
            `curl -s -X POST -H "Authorization: token ${githubToken}" -H "Accept: application/vnd.github.v3+json" -H "Content-Type: application/json" https://api.github.com/repos/${SUBREPO_OWNER}/${SUBREPO_REPO}/pulls -d '${prPayload}'`
          );
          const pr = JSON.parse(prResponse);
          if (pr.html_url) {
            console.log(`\n✅ Created PR: ${pr.html_url}`);
          } else {
            throw new Error('PR creation failed: ' + JSON.stringify(pr));
          }
        } catch (error) {
          console.error(`\n⚠️  Failed to create PR via API: ${error.message}`);
          console.log(`\n✅ Created branch ${branchName} in subrepo`);
          console.log(
            `📝 Please create a PR manually at: https://github.com/${SUBREPO_OWNER}/${SUBREPO_REPO}/compare/${branchName}`
          );
        }
      } else {
        console.log(`\n✅ Created branch ${branchName} in subrepo`);
        console.log(
          `📝 Please create a PR manually at: https://github.com/Genyus/swarm-wasp-starter/compare/${branchName}`
        );
      }
    } else {
      // Direct push for minor bumps only
      console.log('\n📤 Pushing minor version updates directly to subrepo...');

      await execAsync('git add package.json', { cwd: tmpDir });

      // Build commit message
      const commitLines = [
        'chore: update dependencies',
        '',
        ...relevantUpdates.map((b) => `- ${b.name}@${b.version}`),
      ];

      // Write commit message to temp file
      const commitMsgFile = path.join(tmpDir, '.commit-msg');
      fs.writeFileSync(commitMsgFile, commitLines.join('\n'));
      await execAsync('git commit -F .commit-msg', { cwd: tmpDir });
      fs.unlinkSync(commitMsgFile);

      await execAsync(`git push origin ${SUBREPO_BRANCH}`, {
        cwd: tmpDir,
        env: { ...process.env },
      });

      console.log('\n✅ Successfully updated subrepo dependencies');
    }

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (error) {
    console.error('\n❌ Error updating subrepo:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
