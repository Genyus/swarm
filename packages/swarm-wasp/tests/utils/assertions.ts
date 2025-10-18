import * as fs from 'node:fs';
import * as path from 'node:path';

export function readGeneratedFile(projectRoot: string, relativePath: string): string {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

export function assertImportsPresent(content: string, imports: string[]): void {
  for (const importStr of imports) {
    if (!content.includes(importStr)) {
      throw new Error(`Missing import: ${importStr}`);
    }
  }
}

export function assertConfigGroupOrder(
  content: string,
  expectedOrder: string[]
): void {
  const positions = expectedOrder.map(group => {
    const match = content.match(new RegExp(`//\\s*${group}`, 'i'));
    return match ? match.index! : -1;
  });

  for (let i = 1; i < positions.length; i++) {
    if (positions[i] !== -1 && positions[i] < positions[i - 1]) {
      throw new Error(
        `Config group order incorrect: ${expectedOrder[i]} appears before ${expectedOrder[i - 1]}`
      );
    }
  }
}

export function countOccurrences(content: string, search: string): number {
  return (content.match(new RegExp(search, 'g')) || []).length;
}
