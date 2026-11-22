import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'

function formatDate(value) {
  // SQLite stores "YYYY-MM-DD HH:MM:SS" in UTC
  const date = new Date(value.replace(' ', 'T') + 'Z')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function excerpt(text, max = 150) {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max).trimEnd() + '…' : clean
}

function Byline({ post }) {
  return (
    <div className="byline">
      <span className="avatar avatar-small">{post.author_name.charAt(0).toUpperCase()}</span>
      <span className="byline-name">{post.author_name}</span>
      <span className="byline-date">{formatDate(post.created_at)}</span>
    </div>
  )
}

export default function Home() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([api.getPosts(), api.getCategories()])
      .then(([postsData, categoriesData]) => {
        if (cancelled) return
        setPosts(postsData)
        setCategories(categoriesData)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className="page-message">Loading posts…</p>
  if (error) return <p className="page-message form-error">{error}</p>

  const featured = posts[0]
  const list = activeCategory
    ? posts.filter((p) => p.category_id === activeCategory)
    : posts.slice(1)

  return (
    <div className="page home">
      {featured && (
        <section className="featured">
          <div className="featured-body">
            <span className="pill pill-solid">Featured</span>
            <h2 className="featured-title">
              <Link to={`/posts/${featured.id}`}>{featured.title}</Link>
            </h2>
            <p className="featured-text">{excerpt(featured.content, 220)}</p>
            <Byline post={featured} />
          </div>
        </section>
      )}

      <section>
        <div className="section-head">
          <h2 className="section-title">Latest Posts</h2>
          <div className="filters" role="group" aria-label="Filter by category">
            <button
              type="button"
              className={activeCategory === null ? 'pill selected' : 'pill'}
              onClick={() => setActiveCategory(null)}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={activeCategory === c.id ? 'pill selected' : 'pill'}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {posts.length === 0 && <p className="page-message">No posts yet. Be the first to write one.</p>}
        {posts.length > 0 && list.length === 0 && (
          <p className="page-message">No posts in this category yet.</p>
        )}

        <div className="card-grid">
          {list.map((post) => (
            <article key={post.id} className="card">
              {post.category_name && <span className="card-category">{post.category_name}</span>}
              <h3 className="card-title">
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h3>
              <p className="card-text">{excerpt(post.content)}</p>
              <div className="card-foot">
                <Byline post={post} />
                <span className="card-comments">
                  {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
