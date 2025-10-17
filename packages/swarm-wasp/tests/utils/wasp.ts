import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TestProjectPaths {
  root: string;
  src: string;
  features: string;
  schema: string;
  mainWasp: string;
  swarmConfig: string;
}

let testCounter = 0;

export function createTestWaspProject(): TestProjectPaths {
  const outDir = getOutDirectory();

  const projectName = `test-project-${Date.now()}-${testCounter++}`;
  const root = path.join(outDir, projectName);

  // Create root directory first
  fs.mkdirSync(root, { recursive: true });

  const src = path.join(root, 'src');
  const features = path.join(src, 'features');
  fs.mkdirSync(features, { recursive: true });

  fs.writeFileSync(path.join(root, '.wasproot'), 'wasp');

  const mainWasp = path.join(root, 'main.wasp.ts');
  fs.writeFileSync(mainWasp, `
import { app } from '@wasp/config';

export default app('TestApp', {
  wasp: { version: '^0.15.0' },
  title: 'Test Application',
});
`);

  const schema = path.join(root, 'schema.prisma');
  fs.writeFileSync(schema, `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  username  String   @unique
  posts     Post[]
  comments  Comment[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  content   String?
  published Boolean   @default(false)
  metadata  Json      @default("{}")
  author    User      @relation(fields: [authorId], references: [id])
  authorId  Int
  comments  Comment[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  post      Post     @relation(fields: [postId], references: [id])
  postId    Int
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}
`);

  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    name: 'test-wasp-app',
    version: '0.0.1',
    private: true,
    dependencies: {
      '@wasp/entities': 'workspace:*',
      'wasp': '^0.15.0'
    }
  }, null, 2));

  fs.writeFileSync(path.join(root, 'tsconfig.json'), JSON.stringify({
    extends: './tsconfig.wasp.json',
    compilerOptions: {
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true
    }
  }, null, 2));

  const swarmConfig = path.join(root, 'swarm.config.json');
  fs.writeFileSync(swarmConfig, JSON.stringify({
    plugins: {
      '@ingenyus/swarm-wasp': {
        plugin: 'wasp',
        enabled: true
      }
    }
  }, null, 2));

  return { root, src, features, schema, mainWasp, swarmConfig };
}

function getOutDirectory(): string {
  return path.join(__dirname, '..', 'out');
}
