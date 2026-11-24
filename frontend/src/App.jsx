import { Route, Routes, useLocation } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import NewPost from './pages/NewPost.jsx'
import Register from './pages/Register.jsx'
import PostDetail from './pages/PostDetail.jsx'
import EditPost from './pages/EditPost.jsx'
import MyPosts from './pages/MyPosts.jsx'
import Categories from './pages/Categories.jsx'

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
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/posts/:id/edit" element={<EditPost />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Routes>
    </>
  )
}
