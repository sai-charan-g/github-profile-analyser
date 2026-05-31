# GitHub Profile Analyzer API

Backend service that fetches a GitHub user's public profile, computes useful insights, and stores them in MySQL.

**Live API:** `https://<your-deployed-url>`
**GitHub Repo:** `https://github.com/<your-username>/<your-repo>`

---

## Tech Stack

- Node.js + Express.js
- MySQL (mysql2)
- GitHub REST API v3
- Axios, Helmet, Morgan, express-rate-limit

---

## Setup

### 1. Clone

```bash
git clone <your-repo-url>
cd github-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=github_analyzer

GITHUB_TOKEN=ghp_your_token_here
```

> GitHub token is optional but raises the rate limit from 60 to 5000 req/hr.

### 4. Run

```bash
npm run dev     # development
npm start       # production
```

On startup the app will automatically create the database and table if they don't exist.

---

## API Endpoints

### Analyze a profile

```
POST /api/profiles/analyze/:username
```

Fetches the user from GitHub, computes insights, stores in MySQL. Returns cached data if analyzed within the last hour.

**Example:** `POST /api/profiles/analyze/torvalds`

```json
{
  "success": true,
  "cached": false,
  "repos_analyzed": 7,
  "data": {
    "username": "torvalds",
    "name": "Linus Torvalds",
    "followers": 240000,
    "public_repos": 7,
    "total_stars": 185000,
    "total_forks": 34000,
    "most_used_language": "C",
    "top_repo": "torvalds/linux",
    "profile_score": 89,
    "account_age": 5200
  }
}
```

---

### Get all stored profiles

```
GET /api/profiles
```

| Query param | Default | Options |
|---|---|---|
| `page` | 1 | any integer |
| `limit` | 10 | 1–100 |
| `sort` | `created_at` | `profile_score`, `followers`, `total_stars`, `public_repos`, `created_at` |
| `order` | `desc` | `asc`, `desc` |

---

### Get a single profile

```
GET /api/profiles/:username
```

Returns stored data. Returns 404 if not yet analyzed.

---

### Refresh a profile

```
GET /api/profiles/:username/refresh
```

Force re-fetches from GitHub and updates stored data.

---

### Delete a profile

```
DELETE /api/profiles/:username
```

---

### Health check

```
GET /health
```

---

## Database Schema

See [`schema.sql`](./schema.sql) for the full schema.

```sql
CREATE TABLE profiles (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  github_id           BIGINT,
  username            VARCHAR(255) UNIQUE,
  name                VARCHAR(255),
  bio                 TEXT,
  followers           INT,
  following           INT,
  public_repos        INT,
  account_age         INT,
  most_used_language  VARCHAR(100),
  total_stars         INT,
  total_forks         INT,
  top_repo            VARCHAR(255),
  profile_score       INT,
  profile_url         VARCHAR(500),
  avatar_url          VARCHAR(500),
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

To set up manually:

```bash
mysql -u root -p < schema.sql
```

---

## Profile Score

Computed on a 0–100 scale:

| Signal | Max pts |
|---|---|
| Followers | 30 |
| Total stars | 25 |
| Public repos | 20 |
| Account age | 15 |
| Follow ratio | 10 |

---

## Postman Collection

Import [`postman_collection.json`](./postman_collection.json) to test all endpoints.

Set `base_url` variable to your deployed URL for production testing.

---

## Deployment

Recommended: [Railway](https://railway.app)

1. Push repo to GitHub
2. New project → Deploy from GitHub
3. Add MySQL plugin
4. Set env variables in dashboard
5. Deploy

Or use [Render](https://render.com) with [PlanetScale](https://planetscale.com) for hosted MySQL.
