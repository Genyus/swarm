/* eslint-disable no-undef */
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Check if there are any changesets to process
 * @returns {boolean} True if changesets exist
 */
function hasChangesets() {
  const changesetsDir = path.join(rootDir, '.changeset');

  if (!fs.existsSync(changesetsDir)) {
    return false;
  }

  const files = fs.readdirSync(changesetsDir);
  // Filter out config.json and other non-changeset files
  const changesetFiles = files.filter(
    (file) => file.endsWith('.md') && file !== 'README.md'
  );

  return changesetFiles.length > 0;
}

/**
 * Version the packages
 */
async function versionPackages() {
  try {
    // Check if there are changesets to process
    if (!hasChangesets()) {
      console.log('ℹ️  No changesets found, skipping version bump');
      process.exit(0);
    }

    console.log('🔄 Running changeset version...');
    await execAsync('npx changeset version');

    console.log('📦 Updating lockfile...');
    await execAsync('pnpm install --lockfile-only');

    console.log('✅ Version update complete');
  } catch (error) {
    console.error('❌ Error during versioning:', error);
    process.exit(1);
  }
}

versionPackages();
