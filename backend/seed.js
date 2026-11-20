const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'blog.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

const hash = bcrypt.hashSync('password123', 10);

const insertUser = db.prepare(
  'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
);

insertUser.run('Admin User', 'admin@blog.com', hash, 'admin');
insertUser.run('Anna Author', 'author@blog.com', hash, 'author');
insertUser.run('Rick Reader', 'reader@blog.com', hash, 'reader');

const insertCat = db.prepare(
  'INSERT INTO categories (name, description) VALUES (?, ?)'
);
insertCat.run('Technology', 'Posts about tech and programming');
insertCat.run('Lifestyle', 'Everyday life and habits');
insertCat.run('Travel', 'Trips and destinations');

const insertPost = db.prepare(
  `INSERT INTO posts (title, content, status, author_id, category_id)
   VALUES (?, ?, ?, ?, ?)`
);
insertPost.run(
  'Getting started with React',
  'React is a library for building UIs. Components make it easy to reuse code.',
  'published',
  2,
  1
);
insertPost.run(
  'My weekend trip',
  'Went hiking near the lake. Weather was perfect.',
  'published',
  2,
  3
);
insertPost.run(
  'Draft: unfinished notes',
  'Still writing this one...',
  'draft',
  2,
  1
);

const insertTag = db.prepare('INSERT INTO tags (name) VALUES (?)');
insertTag.run('react');
insertTag.run('tutorial');
insertTag.run('outdoors');

db.prepare('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)').run(1, 1);
db.prepare('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)').run(1, 2);
db.prepare('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)').run(2, 3);

db.prepare(
  'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)'
).run(1, 3, 'Really helpful, thanks!');

console.log('Database seeded.');
console.log('Test accounts (password: password123):');
console.log('  admin@blog.com  (admin)');
console.log('  author@blog.com (author)');
console.log('  reader@blog.com (reader)');

db.close();
