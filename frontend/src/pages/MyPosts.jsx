
import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
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

export default function MyPosts() {
  const { user, canWrite } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletePostId, setDeletePostId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    api.getMyPosts()
      .then((data) => {
        if (!cancelled) setPosts(data)
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

  if (!user) return <Navigate to="/login" replace />
  if (!canWrite) return <Navigate to="/" replace />

  function requestDelete(id) {
    setError('')
    setDeletePostId(id)
  }

  async function confirmDelete() {
    if (deletePostId === null) return

    const id = deletePostId
    setDeleting(true)
    try {
      await api.deletePost(id)
      setPosts((current) => current.filter((post) => post.id !== id))
      setDeletePostId(null)
    } catch (err) {
      setError(err.message)
      setDeletePostId(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <p className="page-message">Loading your posts…</p>

  return (
    <main className="page my-posts">
      {error && <p className="form-error" role="alert">{error}</p>}

      <header className="my-posts-heading">
        <div className="my-posts-title-group">
          <h1 className="page-title">My Posts</h1>
          <p>Manage your published posts and drafts.</p>
        </div>
        <Link to="/posts/new" className="btn btn-primary my-posts-create">
          + Create New Post
        </Link>
      </header>

      {posts.length === 0 ? (
        <p className="my-posts-empty">
          You haven't written any posts yet.
        </p>
      ) : (
        <div className="my-posts-grid">
          {posts.map((post) => (
            <article key={post.id} className="my-post-card">
              <div className="my-post-details">
                <div className="my-post-meta">
                  {post.category_name ? (
                    <span className="my-post-category">{post.category_name}</span>
                  ) : <span />}
                  <span className={`my-post-status ${post.status === 'published' ? 'is-published' : 'is-draft'}`}>
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>

                <h2 className="my-post-title">
                  <Link to={`/posts/${post.id}`}>{post.title}</Link>
                </h2>

                <p className="my-post-excerpt">
                  {post.content.length > 150
                    ? post.content.slice(0, 150) + '…'
                    : post.content}
                </p>
              </div>

              <div className="my-post-footer">
                <time className="my-post-date" dateTime={post.created_at}>
                  {formatDate(post.created_at)}
                </time>
                <div className="my-post-actions">
                  <Link to={`/posts/${post.id}/edit`} className="my-post-action my-post-edit">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="my-post-action my-post-delete"
                    onClick={() => requestDelete(post.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <DeleteConfirmModal
        open={deletePostId !== null}
        title="Delete this post?"
        description="This can’t be undone. The post will be removed for good."
        onCancel={() => setDeletePostId(null)}
        onConfirm={confirmDelete}
        busy={deleting}
      />
    </main>
  )
}
