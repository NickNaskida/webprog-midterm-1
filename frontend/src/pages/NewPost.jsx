import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

export default function NewPost() {
  const { user, canWrite } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  if (!user) return <Navigate to="/login" replace />
  if (!canWrite) return <Navigate to="/" replace />

  async function submit(status) {
    setError('')
    if (!title.trim()) return setError('Title is required')
    if (!content.trim()) return setError('Content is required')

    setSaving(true)
    try {
      await api.createPost({
        title: title.trim(),
        content: content.trim(),
        status,
        category_id: categoryId ? Number(categoryId) : null,
      })
      navigate(status === 'published' ? '/' : '/my-posts')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page new-post">
      <h1 className="page-title">Create New Post</h1>

      <form onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            rows={10}
            placeholder="Write your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="field field-narrow">
          <label htmlFor="category">Category</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => submit('draft')}>
            Save Draft
          </button>
          <button type="button" className="btn btn-primary" disabled={saving} onClick={() => submit('published')}>
            {saving ? 'Saving…' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
