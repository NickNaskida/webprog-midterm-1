const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const categories = db
    .prepare(
      `SELECT c.id, c.name, c.description,
              (SELECT COUNT(*) FROM posts p WHERE p.category_id = c.id) AS post_count
       FROM categories c
       ORDER BY c.name`
    )
    .all();
  res.json(categories);
});

router.get('/:id', (req, res) => {
  const category = db
    .prepare('SELECT * FROM categories WHERE id = ?')
    .get(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json(category);
});

router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const exists = db.prepare('SELECT id FROM categories WHERE name = ?').get(name.trim());
  if (exists) {
    return res.status(400).json({ error: 'Category already exists' });
  }

  const result = db
    .prepare('INSERT INTO categories (name, description) VALUES (?, ?)')
    .run(name.trim(), description || null);

  res.status(201).json(
    db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid)
  );
});

router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  const name = req.body.name !== undefined ? req.body.name.trim() : category.name;
  const description =
    req.body.description !== undefined ? req.body.description : category.description;

  if (!name) return res.status(400).json({ error: 'Name is required' });

  const clash = db
    .prepare('SELECT id FROM categories WHERE name = ? AND id != ?')
    .get(name, category.id);
  if (clash) return res.status(400).json({ error: 'Category already exists' });

  db.prepare('UPDATE categories SET name = ?, description = ? WHERE id = ?').run(
    name,
    description,
    category.id
  );

  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(category.id));
});

router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  db.prepare('DELETE FROM categories WHERE id = ?').run(category.id);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
