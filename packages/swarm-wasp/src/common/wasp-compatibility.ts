import { Logger, findPackageJson, getVersion } from '@ingenyus/swarm';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as semver from 'semver';

let cachedSupportedRange: string | null = null;

/**
 * Gets the Wasp supported version range from package.json swarm.wasp field.
 * Throws an error if the range is not found.
 *
 * @returns The supported Wasp version range (e.g., ">=0.18.0 <0.20.0")
 * @throws Error if the supported range is not found in package.json
 */
function getWaspSupportedRange(): string {
  if (cachedSupportedRange) {
    return cachedSupportedRange;
  }

  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const result = findPackageJson(currentDir, {
    packageName: '@ingenyus/swarm-wasp',
  });

  if (!result) {
    throw new Error(
      'Unable to find package.json for @ingenyus/swarm-wasp. ' +
        'Wasp supported version range must be specified in swarm.wasp field.'
    );
  }

  const swarm = result.packageJson.swarm as { wasp?: string } | undefined;
  const waspRange = swarm?.wasp;

  if (!waspRange) {
    throw new Error(
      'Wasp supported version range not found in package.json. ' +
        'Please specify swarm.wasp field in @ingenyus/swarm-wasp package.json ' +
        `(e.g., "swarm": { "wasp": ">=0.18.0 <0.20.0" }).`
    );
  }

  cachedSupportedRange = waspRange;
  return cachedSupportedRange;
}

/**
 * Gets the installed Wasp version by executing `wasp version` command.
 * Parses the output to extract the version number from the first line.
 *
 * @returns The Wasp version string (e.g., "0.18.2")
 * @throws Error if the `wasp` command is not found or version cannot be parsed
 */
function getInstalledWaspVersion(logger: Logger): string {
  try {
    const output = execSync('wasp version', {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    // The output format is:
    // "0.18.2\n\nIf you wish to install/switch to the latest version..."
    // We need to extract just the first line
    const firstLine = output.split('\n')[0]?.trim();

    if (!firstLine) {
      logger.error(
        'Unable to parse Wasp version from command output. ' +
          'Expected version number on first line.'
      );

      throw new Error('Unable to parse Wasp version from command output');
    }

    if (!semver.valid(firstLine)) {
      logger.error(
        `Invalid Wasp version format: "${firstLine}". ` +
          'Expected a valid semver version (e.g., "0.18.2").'
      );

      throw new Error('Invalid Wasp version format');
    }

    return firstLine;
  } catch (error: any) {
    if (error.code === 'ENOENT' || error.message?.includes('wasp')) {
      logger.error(
        'Wasp CLI not found. Install using: curl -sSL https://get.wasp.sh/installer.sh | sh -s'
      );

      throw new Error('Wasp CLI not found');
    }

    throw new Error('Unable to determine installed Wasp version');
  }
}

/**
 * Checks if we're running in a test environment
 */
function isTestEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST === 'true' ||
    typeof process.env.VITEST !== 'undefined'
  );
}

/**
 * Asserts that the installed Wasp version is compatible with this package.
 * Throws an error if the version is outside the supported range.
 * Skips the check in test environments.
 *
 * @throws Error if Wasp version is incompatible or cannot be determined
 */
export function assertWaspCompatible(logger: Logger): void {
  // Skip compatibility check in test environments
  if (isTestEnvironment()) {
    return;
  }

  const version = getInstalledWaspVersion(logger);
  const supportedRange = getWaspSupportedRange();

  if (!semver.satisfies(version, supportedRange)) {
    const startDir = path.dirname(fileURLToPath(import.meta.url));
    const packageVersion = getVersion('@ingenyus/swarm-wasp', startDir);
    logger.error(
      `Incompatible Wasp version detected: ${version}. ` +
        `@ingenyus/swarm-wasp@${packageVersion} supports Wasp ` +
        `${supportedRange}.`
    );

    throw new Error('Incompatible Wasp version');
  }
}
