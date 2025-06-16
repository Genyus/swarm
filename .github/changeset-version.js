import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function versionPackages() {
  try {
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