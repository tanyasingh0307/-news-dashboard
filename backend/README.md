# News Dashboard — Backend

Express + MongoDB API that adds authentication, per-user bookmarks, and a
secure proxy for the NewsData.io API (so the API key never sits in
frontend JS anymore).

## Endpoints

| Method | Route                    | Auth? | Description                          |
|--------|--------------------------|-------|---------------------------------------|
| POST   | `/api/auth/signup`       | No    | Create an account                     |
| POST   | `/api/auth/login`        | No    | Log in, returns a JWT                 |
| GET    | `/api/auth/me`           | Yes   | Get the logged-in user's profile      |
| GET    | `/api/bookmarks`         | Yes   | List the user's saved articles        |
| POST   | `/api/bookmarks`         | Yes   | Save an article                       |
| DELETE | `/api/bookmarks/:id`     | Yes   | Remove a saved article                |
| GET    | `/api/news?q=keyword`    | No    | Proxies NewsData.io                   |

Authenticated routes expect `Authorization: Bearer <token>`.

## 1. MongoDB Atlas setup

1. Create a free cluster at https://cloud.mongodb.com
2. Database Access → add a user with a username/password.
3. Network Access → add `0.0.0.0/0` (allow from anywhere) so Render/Railway can connect.
4. Connect → Drivers → copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/newsDashboard?retryWrites=true&w=majority`

## 2. Local setup

```bash
cd backend
cp .env.example .env
# edit .env: paste your MONGO_URI, set a random JWT_SECRET, keep/replace NEWSDATA_API_KEY
npm install
npm run dev
```

Server runs at `http://localhost:5000`. Health check: `GET /api/health`.

## 3. Point the frontend at it

In `../script.js`, `API_BASE` is already set to `http://localhost:5000/api`
for local dev. Open `index.html` (e.g. with VS Code's Live Server) and it
will talk to your local backend.

## 4. Deploy to Render

1. Push this repo to GitHub.
2. On https://render.com → New → Web Service → connect the repo.
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from `.env` (MONGO_URI, JWT_SECRET, NEWSDATA_API_KEY, CLIENT_ORIGIN, PORT).
7. Once deployed, update `API_BASE` in `script.js` to your Render URL, e.g.
   `https://news-dashboard-backend.onrender.com/api`, and set `CLIENT_ORIGIN`
   on Render to your deployed frontend's URL (e.g. your Vercel domain).

Railway deployment is nearly identical — connect the repo, set the root
directory to `backend`, and add the same environment variables.

## Notes

- Passwords are hashed with bcrypt before being stored — never stored in plain text.
- JWTs expire after 7 days; the frontend clears an expired/invalid token automatically.
- Bookmarks are embedded on the `User` document (`bookmarks: []`), keyed by
  article `link` so the same article can't be saved twice.
- Auth routes are rate-limited (30 requests / 15 min) to slow down brute-force attempts.
