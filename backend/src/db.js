const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'blog.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
