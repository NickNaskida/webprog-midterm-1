const express = require('express');
const db = require('../db');
const { requireAuth, optionalAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const posts = db
    .prepare(
      `SELECT p.id, p.title, p.content, p.status, p.created_at, p.updated_at,
              p.author_id, u.name AS author_name,
              p.category_id, c.name AS category_name,
              (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id AND cm.is_hidden = 0) AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.status = 'published'
       ORDER BY p.created_at DESC`
    )
    .all();

  res.json(posts);
});

router.get('/mine', requireAuth, requireRole('admin', 'author'), (req, res) => {
  const posts =
    req.user.role === 'admin'
      ? db
          .prepare(
            `SELECT p.id, p.title, p.content, p.status, p.created_at, p.updated_at,
                    p.author_id, u.name AS author_name,
                    p.category_id, c.name AS category_name
             FROM posts p
             JOIN users u ON u.id = p.author_id
             LEFT JOIN categories c ON c.id = p.category_id
             ORDER BY p.created_at DESC`
          )
          .all()
      : db
          .prepare(
            `SELECT p.id, p.title, p.content, p.status, p.created_at, p.updated_at,
                    p.author_id, u.name AS author_name,
                    p.category_id, c.name AS category_name
             FROM posts p
             JOIN users u ON u.id = p.author_id
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.author_id = ?
             ORDER BY p.created_at DESC`
          )
          .all(req.user.id);

  res.json(posts);
});

router.get('/:id', optionalAuth, (req, res) => {
  const post = db
    .prepare(
      `SELECT p.id, p.title, p.content, p.status, p.created_at, p.updated_at,
              p.author_id, u.name AS author_name,
              p.category_id, c.name AS category_name,
              (SELECT COUNT(*) FROM comments cm WHERE cm.post_id = p.id AND cm.is_hidden = 0) AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`
    )
    .get(req.params.id);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (post.status === 'draft') {
    const canSee =
      req.user &&
      (req.user.role === 'admin' || req.user.id === post.author_id);
    if (!canSee) return res.status(404).json({ error: 'Post not found' });
  }

  const tags = db
    .prepare(
      `SELECT t.id, t.name FROM tags t
       JOIN post_tags pt ON pt.tag_id = t.id
       WHERE pt.post_id = ?`
    )
    .all(post.id);

  res.json({ ...post, tags });
});

router.post('/', requireAuth, requireRole('admin', 'author'), (req, res) => {
  const { title, content, status, category_id } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const postStatus = status === 'published' ? 'published' : 'draft';

  if (category_id) {
    const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!cat) return res.status(400).json({ error: 'Category not found' });
  }

  const result = db
    .prepare(
      `INSERT INTO posts (title, content, status, author_id, category_id)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(title.trim(), content.trim(), postStatus, req.user.id, category_id || null);

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(post);
});

router.put('/:id', requireAuth, requireRole('admin', 'author'), (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (req.user.role !== 'admin' && post.author_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only edit your own posts' });
  }

  const title = req.body.title !== undefined ? req.body.title.trim() : post.title;
  const content = req.body.content !== undefined ? req.body.content.trim() : post.content;
  const status =
    req.body.status === 'published' || req.body.status === 'draft'
      ? req.body.status
      : post.status;
  const category_id =
    req.body.category_id !== undefined ? req.body.category_id : post.category_id;

  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!content) return res.status(400).json({ error: 'Content is required' });

  db.prepare(
    `UPDATE posts
     SET title = ?, content = ?, status = ?, category_id = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(title, content, status, category_id, post.id);

  res.json(db.prepare('SELECT * FROM posts WHERE id = ?').get(post.id));
});

router.delete('/:id', requireAuth, requireRole('admin', 'author'), (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (req.user.role !== 'admin' && post.author_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own posts' });
  }

  db.prepare('DELETE FROM posts WHERE id = ?').run(post.id);
  res.json({ message: 'Post deleted' });
});

module.exports = router;
