import { Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import NewPost from './pages/NewPost.jsx'
import Register from './pages/Register.jsx'

// Akshay's pages (post detail, edit, my posts, categories) plug in here.
function Placeholder({ title }) {
  return <p className="page-message">{title} is coming soon.</p>
}

export default function App() {
  const { pathname } = useLocation()
  const isAuthPage = pathname === '/login' || pathname === '/register'

  return (
    <>
      {!isAuthPage && <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts/new" element={<NewPost />} />
        <Route path="/posts/:id" element={<Placeholder title="Post detail" />} />
        <Route path="/posts/:id/edit" element={<Placeholder title="Edit post" />} />
        <Route path="/my-posts" element={<Placeholder title="My posts" />} />
        <Route path="/categories" element={<Placeholder title="Categories" />} />
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Routes>
    </>
  )
}
