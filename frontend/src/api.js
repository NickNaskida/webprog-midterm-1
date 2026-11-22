// Thin wrapper around fetch for the Express backend.
// Vite proxies /api to http://localhost:3001 (see vite.config.js).

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.')
  }
  return data
}

export const api = {
  // auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: ({ name, email, password, role }) =>
    request('/auth/register', { method: 'POST', body: { name, email, password, role } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  // posts
  getPosts: () => request('/posts'),
  getMyPosts: () => request('/posts/mine'),
  getPost: (id) => request(`/posts/${id}`),
  createPost: ({ title, content, status, category_id }) =>
    request('/posts', { method: 'POST', body: { title, content, status, category_id } }),
  updatePost: (id, fields) => request(`/posts/${id}`, { method: 'PUT', body: fields }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),

  // categories
  getCategories: () => request('/categories'),
}
