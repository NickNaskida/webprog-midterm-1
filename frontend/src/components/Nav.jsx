import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function Nav() {
  const { user, canWrite, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="nav">
      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        {canWrite && <NavLink to="/my-posts">My Posts</NavLink>}
        <NavLink to="/categories">Categories</NavLink>
      </nav>

      <div className="nav-right">
        {canWrite && (
          <Link to="/posts/new" className="btn btn-primary btn-small">Write</Link>
        )}
        {user ? (
          <>
            <span className="avatar" title={`${user.name} (${user.role})`}>
              {user.name.charAt(0).toUpperCase()}
            </span>
            <button type="button" className="link-button" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-plain">Sign in</Link>
            <Link to="/register" className="btn btn-secondary btn-small">Create account</Link>
          </>
        )}
      </div>
    </header>
  )
}
