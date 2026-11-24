
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx'

function formatDate(value) {
  const date = new Date(value.replace(' ', 'T') + 'Z')
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    let cancelled = false

    api.getPost(id)
      .then((data) => {
        if (!cancelled) setPost(data)
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

  const canManage = user && post &&
    (user.role === 'admin' || user.id === post.author_id)

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.deletePost(id)
      setShowDeleteModal(false)
      navigate('/')
    } catch (err) {
      setError(err.message)
      setShowDeleteModal(false)
      setDeleting(false)
    }
  }

  if (loading) return <p className="page-message">Loading post…</p>
  if (error && !post) return <p className="page-message form-error">{error}</p>
  if (!post) return <p className="page-message">Post not found.</p>

  return (
    <main className="page post-detail">
      <Link to="/" className="back-link">← Back to posts</Link>

      <article className="post-content">
        <header className="post-header">
          {post.category_name && (
            <span className="post-category">{post.category_name}</span>
          )}
          <h1 className="post-title">{post.title}</h1>

          <div className="post-byline">
            <span className="avatar post-avatar">
              {post.author_name.charAt(0).toUpperCase()}
            </span>
            <span>{post.author_name}</span>
            <time className="post-date" dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
          </div>
        </header>

        <div className="post-body">{post.content}</div>

        <footer className="post-footer">
          <div className="post-divider" />
          <div className="post-footer-row">
            <p className="post-comment-count">
              {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
            </p>

            {canManage && (
              <div className="post-actions">
                <Link to={`/posts/${post.id}/edit`} className="post-action post-action-edit">
                  Edit Post
                </Link>
                <button
                  type="button"
                  className="post-action post-action-delete"
                  onClick={() => {
                    setError('')
                    setShowDeleteModal(true)
                  }}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Delete Post'}
                </button>
              </div>
            )}
          </div>
        </footer>

        {error && <p className="form-error">{error}</p>}
      </article>

      <DeleteConfirmModal
        open={showDeleteModal}
        title="Delete this post?"
        description="This can’t be undone. The post will be removed for good."
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        busy={deleting}
      />
    </main>
  )
}
