
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

export default function EditPost() {
  const { id } = useParams()
  const { user, canWrite } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('draft')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([api.getPost(id), api.getCategories()])
      .then(([post, categoryData]) => {
        if (cancelled) return

        setTitle(post.title)
        setContent(post.content)
        setCategoryId(post.category_id ? String(post.category_id) : '')
        setStatus(post.status)
        setCategories(categoryData)
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
  }, [id])

  if (!user) return <Navigate to="/login" replace />
  if (!canWrite) return <Navigate to="/" replace />

  async function submit(newStatus) {
    setError('')

    if (!title.trim()) return setError('Title is required')
    if (!content.trim()) return setError('Content is required')

    setSaving(true)

    try {
      await api.updatePost(id, {
        title: title.trim(),
        content: content.trim(),
        status: newStatus,
        category_id: categoryId ? Number(categoryId) : null,
      })

      navigate(`/posts/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="page-message">Loading post…</p>

  return (
    <div className="page edit-post">
      <h1 className="page-title">Edit Post</h1>

      <form className="edit-post-form" onSubmit={(e) => e.preventDefault()} noValidate>
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
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={saving}
            onClick={() => submit('draft')}
          >
            Save Draft
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={() => submit('published')}
          >
            {saving ? 'Saving…' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
