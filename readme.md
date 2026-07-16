# Dockerized News Dashboard — Full Stack

A responsive news app that fetches and displays real-time articles from the
NewsData.io API, with a full Express + MongoDB backend for user accounts and
saved bookmarks. Started as a static frontend project and was extended with
authentication, a database, and a secure API proxy.

---

## Live Demo

🔗 Frontend: https://news-dashboard-three-pi.vercel.app/

🔗 Backend API: https://dockerized-news-dashboard.onrender.com

> Both frontend and backend are deployed and connected. Login, signup, and
> bookmarks work directly on the live demo — no local setup required to try it out.
>
> Note: the backend runs on Render's free tier, which spins down after 15
> minutes of inactivity. The first request after a period of no traffic can
> take 30-50 seconds while it wakes back up — that's expected, not a bug.

---

## Features

- Search news articles by keyword, powered by the NewsData.io API
- User signup / login with JWT authentication
- Passwords hashed with bcrypt — never stored in plain text
- Per-user bookmarks: save and unsave articles, view them in a dedicated tab
- News API key kept server-side via a backend proxy, not exposed in frontend JS
- Responsive, modern UI with error handling for failed requests
- Dockerized frontend (Nginx) and backend, for portable deployment

---

## Tech Stack

**Frontend:** HTML5, CSS3, JavaScript (ES6+), Fetch API

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt

**Infra:** Docker, Nginx, MongoDB Atlas, Render, Vercel

**External API:** NewsData.io

---

## Project Structure

```text
news-dashboard/
├── index.html
├── style.css
├── script.js
├── Dockerfile              # frontend (nginx) container
├── dashboard.png
├── readme.md
└── backend/
    ├── server.js
    ├── app.js
    ├── package.json
    ├── .env.example
    ├── Dockerfile           # backend (node) container
    ├── config/
    │   └── db.js
    ├── models/
    │   └── User.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── bookmarkRoutes.js
    │   └── newsRoutes.js
    └── README.md            # backend setup & deployment details
```

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/news-dashboard.git
cd news-dashboard
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Fill in `.env` with your own values:
- `MONGO_URI` — connection string from a free MongoDB Atlas cluster
- `JWT_SECRET` — any long random string
- `NEWSDATA_API_KEY` — your NewsData.io key (a working demo key is included by default)

```bash
npm install
npm run dev
```

Server runs at `http://localhost:5000`. Full walkthrough (Atlas cluster
creation, IP whitelisting, deployment to Render) is in `backend/README.md`.

### 3. Run the frontend

Open `index.html` directly, or serve it with VS Code's Live Server. It talks
to `http://localhost:5000/api` by default (configurable via `API_BASE` at
the top of `script.js`).

---

## Docker Setup (frontend only)

```bash
docker build -t news-dashboard .
docker run -d -p 8080:80 --name news-portal news-dashboard
```

Visit `http://localhost:8080`. Stop with `docker stop news-portal`.

The backend also ships with its own `backend/Dockerfile` for containerized
deployment — see `backend/README.md`.

---

## Usage

1. Sign up or log in (top right).
2. Enter a keyword and click **Fetch News**.
3. Click **☆ Save** on any article to bookmark it.
4. Switch to the **My Bookmarks** tab to view everything you've saved.
5. Open articles directly with **Read More**.

---

## Screenshots

![Dashboard](dashboard.png)

---

## API Endpoints (backend)

| Method | Route                 | Auth? | Description                     |
|--------|------------------------|-------|----------------------------------|
| POST   | `/api/auth/signup`     | No    | Create an account                |
| POST   | `/api/auth/login`      | No    | Log in, returns a JWT            |
| GET    | `/api/auth/me`         | Yes   | Get the logged-in user's profile |
| GET    | `/api/bookmarks`       | Yes   | List saved articles              |
| POST   | `/api/bookmarks`       | Yes   | Save an article                  |
| DELETE | `/api/bookmarks/:id`   | Yes   | Remove a saved article           |
| GET    | `/api/news?q=keyword`  | No    | Proxies NewsData.io              |
| GET    | `/api/health`          | No    | Health check                     |

---

## Challenges Solved

- Moving a hardcoded, client-exposed API key to a secure backend proxy
- Designing a JWT-based auth flow with protected routes and token expiry
- Modeling per-user bookmarks in MongoDB and preventing duplicate saves
- Handling CORS between a separately-hosted frontend and backend
- Deploying frontend and backend to separate platforms (Vercel + Render)
  and correctly configuring cross-origin requests between them
- Async/await API integration, empty-response handling, and error states
- Containerizing both a static frontend and a Node backend independently

---

## What I Learned

- Building a REST API with Express, including auth middleware and rate limiting
- Password security with bcrypt and stateless auth with JWT
- Schema design in MongoDB/Mongoose, including embedded subdocuments
- Connecting a frontend to a self-hosted backend instead of calling a third-party API directly
- Docker image creation for both static and Node.js services
- Debugging real-world CORS and environment-variable configuration issues
- Deploying a multi-service app across two different hosting platforms

---

## Future Enhancements

- Category-based news filtering
- Dark mode support
- Pagination and infinite scrolling
- Email verification and password reset flow
- Refresh tokens / httpOnly cookie-based auth (more XSS-resistant than localStorage)
- Multi-language support

---

## Resume Impact

- Built a full-stack news application with JWT authentication, bcrypt password
  hashing, and MongoDB-backed user data, extending an existing frontend into a
  complete client-server system.
- Designed and implemented a REST API (Express/Node.js) with protected routes,
  rate limiting, and a secure server-side proxy to eliminate client-exposed API keys.
- Modeled per-user relational data (bookmarks) in MongoDB using embedded documents,
  and implemented full CRUD operations.
- Deployed a multi-service application across separate platforms (Vercel for
  frontend, Render for backend, MongoDB Atlas for the database).
- Containerized both frontend (Nginx) and backend (Node.js) services with Docker
  for portable, consistent deployment.

---

## Author

**Tanya Singh**

B.Tech Computer Science & Engineering

- GitHub: https://github.com/your-github-username
- LinkedIn: https://linkedin.com/in/your-linkedin-id
