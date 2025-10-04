import { App } from 'wasp-config';

const app = new App('entityApp', {
  title: 'Entity App',
  wasp: { version: '^0.17.0' },
});

app.entity('User', {
  fields: [
    { name: 'id', type: 'Int', isId: true, default: 'autoincrement' },
    { name: 'email', type: 'String', isUnique: true },
    { name: 'name', type: 'String' },
  ],
});

app.entity('Post', {
  fields: [
    { name: 'id', type: 'Int', isId: true, default: 'autoincrement' },
    { name: 'title', type: 'String' },
    { name: 'content', type: 'String' },
    { name: 'authorId', type: 'Int' },
  ],
  relations: [
    { name: 'author', type: 'User', fields: ['authorId'], references: ['id'] },
  ],
});

export default app;
