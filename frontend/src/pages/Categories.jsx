import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx'

export default function Categories() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function loadCategories(selectFirst = false) {
    try {
      const data = await api.getCategories()
      setCategories(data)

      if (selectFirst) {
        const firstCategory = data[0]
        setEditingId(firstCategory?.id ?? null)
        setEditName(firstCategory?.name ?? '')
        setEditDescription(firstCategory?.description || '')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories(isAdmin)
  }, [isAdmin])

  if (loading) return <p className="page-message">Loading categories…</p>

  function resetAddForm() {
    setName('')
    setDescription('')
    setError('')
  }

  async function handleAddSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Category name is required')
      return
    }

    setSaving(true)
    try {
      await api.createCategory({
        name: name.trim(),
        description: description.trim(),
      })
      resetAddForm()
      await loadCategories()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function startEditing(category) {
    setEditingId(category.id)
    setEditName(category.name)
    setEditDescription(category.description || '')
    setError('')
  }

  function cancelEditing() {
    const selectedCategory = categories.find((category) => category.id === editingId)
    if (selectedCategory) startEditing(selectedCategory)
    else if (categories[0]) startEditing(categories[0])
    else {
      setEditingId(null)
      setEditName('')
      setEditDescription('')
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    setError('')

    if (!editingId) return
    if (!editName.trim()) {
      setError('Category name is required')
      return
    }

    setSaving(true)
    try {
      await api.updateCategory(editingId, {
        name: editName.trim(),
        description: editDescription.trim(),
      })
      await loadCategories()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function requestDelete(category) {
    setError('')
    setDeleteTarget(category)
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    const deletingSelectedCategory = deleteTarget.id === editingId
    setDeleting(true)
    try {
      await api.deleteCategory(deleteTarget.id)
      setDeleteTarget(null)
      await loadCategories(deletingSelectedCategory)
    } catch (err) {
      setError(err.message)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className={`page categories-page ${isAdmin ? 'is-admin' : 'is-reader'}`}>
      <header className="categories-heading">
        <h1 className="page-title">Categories</h1>
        <p>
          {isAdmin
            ? 'Manage the categories used to organise your posts.'
            : 'Browse categories used to organise posts.'}
        </p>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      {isAdmin && (
        <section className="category-add-panel">
          <h2>Add New Category</h2>
          <form className="category-add-form" onSubmit={handleAddSubmit} noValidate>
            <div className="category-add-field category-add-name">
              <label htmlFor="category-name">Name</label>
              <input
                id="category-name"
                type="text"
                placeholder="Enter category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="category-add-field category-add-description">
              <label htmlFor="category-description">Description</label>
              <input
                id="category-description"
                type="text"
                placeholder="Enter category description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
              />
            </div>

            <button type="submit" className="category-add-button" disabled={saving}>
              {saving ? 'Adding…' : 'Add Category'}
            </button>
          </form>
        </section>
      )}

      <div className={`categories-management ${isAdmin ? 'has-editor' : ''}`}>
        <section className="categories-list">
          <h2>Existing Categories</h2>
          {categories.length === 0 ? (
            <p className="categories-empty">No categories available yet.</p>
          ) : (
            <div className="category-rows">
              {categories.map((category) => (
                <article className="category-row" key={category.id}>
                  <div className="category-details">
                    <div className="category-name-count">
                      <h3>{category.name}</h3>
                      <span>
                        {category.post_count} {category.post_count === 1 ? 'post' : 'posts'}
                      </span>
                    </div>
                    {category.description && <p>{category.description}</p>}
                  </div>

                  {isAdmin && (
                    <div className="category-actions">
                      <button
                        type="button"
                        className="category-edit-button"
                        onClick={() => startEditing(category)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="category-delete-button"
                        onClick={() => requestDelete(category)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {isAdmin && (
          <section className="category-edit-panel">
            <h2>Edit Category</h2>
            <form onSubmit={handleEditSubmit} noValidate>
              <div className="category-edit-field">
                <label htmlFor="edit-category-name">Name</label>
                <input
                  id="edit-category-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={!editingId || saving}
                />
              </div>
              <div className="category-edit-field category-edit-description">
                <label htmlFor="edit-category-description">Description</label>
                <textarea
                  id="edit-category-description"
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={!editingId || saving}
                />
              </div>
              <div className="category-edit-actions">
                <button type="submit" className="category-save-button" disabled={!editingId || saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" className="category-cancel-button" onClick={cancelEditing} disabled={!editingId || saving}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </div>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        title="Delete this category?"
        description="This can’t be undone. The category will be removed for good."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        busy={deleting}
      />
    </main>
  )
}
