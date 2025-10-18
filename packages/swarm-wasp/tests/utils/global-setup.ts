import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function globalSetup() {
  const outDir = path.join(__dirname, '..', 'out');

  if (fs.existsSync(outDir)) {
    try {
      fs.rmSync(outDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors during cleanup
    }
  }

  fs.mkdirSync(outDir, { recursive: true });
}
