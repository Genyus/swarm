import {
    consolidateChanges,
    createChangesetFile,
    getCommitsSinceLastRelease,
    printValidPatterns
} from './utils.js';

// Main execution
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
packageNames.forEach(packageName => {
  const change = packageChanges[packageName];
  
  // Create consolidated description
  const description = change.descriptions.length === 1 
    ? change.descriptions[0]
    : `Multiple changes:\n${change.descriptions.map(desc => `- ${desc}`).join('\n')}`;
  
  const filename = createChangesetFile(packageName, change.changeType, description, 'auto-batch');
  
  console.log(`✅ Changeset created: ${filename}`);
  console.log(`   Package: ${packageName}`);
  console.log(`   Type: ${change.changeType}`);
  console.log(`   Changes: ${change.descriptions.length}`);
  console.log(`   Commits: ${change.commits.map(c => c.hash).join(', ')}`);
  console.log('');
});

console.log(`🎉 Generated ${packageNames.length} changeset(s) for ${commits.length} commits`); 