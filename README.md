# Blog and Community Platform

Ilia State University — Web Programming interim MVP (Team 09)

Roles: **Admin**, **Author**, **Reader**

## Stack

- Frontend: React (Vite)
- Backend: Express.js (Node.js)
- Database: SQLite (`better-sqlite3`)

## Setup

```bash
# backend
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3001  

## Test accounts

Password for all: `password123`

| Email | Role |
| --- | --- |
| admin@blog.com | admin |
| author@blog.com | author |
| reader@blog.com | reader |

## API (interim)

### Auth
- `POST /api/auth/register` — `{ name, email, password, role? }` (role: author \| reader)
- `POST /api/auth/login` — `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Posts (CRUD)
- `GET /api/posts` — published posts
- `GET /api/posts/mine` — author/admin own list (auth)
- `GET /api/posts/:id`
- `POST /api/posts` — author/admin
- `PUT /api/posts/:id` — own post or admin
- `DELETE /api/posts/:id` — own post or admin

### Categories (CRUD)
- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories` — admin only
- `PUT /api/categories/:id` — admin only
- `DELETE /api/categories/:id` — admin only

## Team

- Nikoloz Naskidashvili
- Akshay Srinivas
- Tekla Jugashvili

Figma link: _add here_
