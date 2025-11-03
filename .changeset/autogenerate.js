/* eslint-disable no-undef */
import {
  consolidateChanges,
  createChangesetFile,
  getCommitsSinceLastRelease,
  printValidPatterns,
} from './utils.js';

const commits = getCommitsSinceLastRelease();

if (commits.length === 0) {
  process.exit(0);
}

console.log(`\n📝 Processing ${commits.length} commits...`);

const packageChanges = consolidateChanges(commits);
const packageNames = Object.keys(packageChanges);

if (packageNames.length === 0) {
  printValidPatterns();
  process.exit(0);
}

// Generate changesets for each package
packageNames.forEach((packageName) => {
  const change = packageChanges[packageName];

  // Pass individual commits array - no aggregation
  const filename = createChangesetFile(
    packageName,
    change.changeType,
    change.commits,
    'auto'
  );

  console.log(`✅ Changeset created: ${filename}`);
  console.log(`   Package: ${packageName}`);
  console.log(`   Type: ${change.changeType}`);
  console.log(`   Commits: ${change.commits.length}`);
  console.log(`   Hash: ${change.commits.map((c) => c.hash).join(', ')}`);
  console.log('');
});

console.log(
  `🎉 Generated ${packageNames.length} changeset(s) for ${commits.length} commits`
);
