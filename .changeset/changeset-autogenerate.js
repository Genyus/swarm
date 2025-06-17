import {
    createChangesetFile,
    getLatestCommitMessage,
    parseCommitMessage,
    printValidPatterns
} from './utils.js';

// Get the most recent commit message
const commitMessage = getLatestCommitMessage();

console.log(`Processing commit: ${commitMessage}`);

// Parse the commit message
const { packageName, changeType, description } = parseCommitMessage(commitMessage);

// Generate changeset if we found a valid conventional commit
if (packageName && changeType && description) {
  const fullPackageName = `@ingenyus/${packageName}`;
  const cleanDescription = description?.trim() || 'No description provided.';
  
  const filename = createChangesetFile(fullPackageName, changeType, cleanDescription, 'auto');
  
  console.log(`✅ Changeset file created: ${filename}`);
  console.log(`   Package: ${fullPackageName}`);
  console.log(`   Type: ${changeType}`);
  console.log(`   Description: ${cleanDescription}`);
} else {
  printValidPatterns();
} 