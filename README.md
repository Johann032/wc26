# Family Tournament Prediction Platform

A family-friendly tournament prediction app. Pick match outcomes, answer prediction questions, and compete on the leaderboard.

Supports multiple tournaments (World Cup 2026, Euro 2028, etc.) with reusable question types and automatic scoring.

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18 + Vite         |
| Backend  | Flask                   |
| ORM      | SQLAlchemy (Flask-SQLAlchemy) |
| Database | SQLite                  |
| Auth     | PIN-based (hashed) + Flask sessions |

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python seed.py                # Fresh database with sample data
python run.py                 # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

### Demo Accounts (after seed)

| User | PIN  | Role  |
|------|------|-------|
| Dad  | 1234 | Admin |
| Mom  | 5678 | User  |
| Alex | 9012 | User  |
| Sam  | 3456 | User  |

## Architecture

```
Frontend → API (Blueprints) → Services → Repositories → Models
```

Business logic lives in services. Route handlers only parse requests and return responses.

## Features

- **PIN authentication** — hashed storage, session cookies, inactive user blocking
- **Multi-tournament** — users persist across tournaments; leaderboards are per-tournament
- **Dynamic questions** — winner, exact_score, multiple_choice, yes_no, number
- **Predictions** — submit/edit before kickoff lock; one answer per user per question
- **Auto-locking** — questions lock at match kickoff (server time)
- **Scoring engine** — idempotent recalculation from admin-entered results
- **Leaderboard** — rank by points, exact predictions, correct predictions, earliest submission
- **Admin dashboard** — manage users, tournaments, matches, questions, results

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | — | Login with display_name + PIN |
| POST | `/api/auth/logout` | — | End session |
| GET | `/api/auth/me` | User | Current user |

### Tournaments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tournaments` | User | List tournaments |
| GET | `/api/tournaments/:id` | User | Get tournament |
| POST | `/api/tournaments` | Admin | Create tournament |
| PUT | `/api/tournaments/:id` | Admin | Update tournament |
| POST | `/api/tournaments/:id/archive` | Admin | Archive tournament |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List users |
| GET | `/api/users/:id` | User | Get user |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/:id` | Admin | Update user |

### Matches
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/matches/tournament/:id` | User | List matches |
| GET | `/api/matches/:id` | User | Get match |
| POST | `/api/matches` | Admin | Create match |
| PUT | `/api/matches/:id` | Admin | Update match |
| DELETE | `/api/matches/:id` | Admin | Delete match |

### Questions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/questions/match/:id` | User | List questions |
| GET | `/api/questions/:id` | User | Get question |
| POST | `/api/questions` | Admin | Create question |
| PUT | `/api/questions/:id` | Admin | Update question |
| DELETE | `/api/questions/:id` | Admin | Delete question |
| PUT | `/api/questions/:id/result` | Admin | Set correct answer + recalculate |

### Predictions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/predictions/me` | User | My predictions |
| GET | `/api/predictions/match/:id` | User | My predictions for match |
| POST | `/api/predictions` | User | Submit/update prediction |
| GET | `/api/predictions/user/:id` | Admin | User predictions |
| GET | `/api/predictions/question/:id` | Admin | Question predictions |

### Leaderboard & Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leaderboard?tournament_id=` | User | Tournament leaderboard |
| GET | `/api/admin/overview` | Admin | Dashboard stats |
| GET | `/api/admin/tournaments/:id/summary` | Admin | Tournament summary |
| POST | `/api/admin/recalculate` | Admin | Recalculate scores |

## Database Migration

On startup, `app/migrate.py` automatically:
1. Creates any missing tables
2. Adds new columns to existing databases (non-destructive)
3. Migrates legacy `pin_code` values to `pin_hash`

To reset with fresh seed data: `python seed.py`

## Testing Checklist

1. Login as Dad (admin) → browse tournaments
2. Open a match → submit predictions
3. Login as Alex → submit different predictions
4. Admin → Results tab → set correct answers
5. View leaderboard → verify points and ranking
6. Admin → change kickoff to past → verify questions lock
7. Try editing locked prediction → should fail

## License

Private / family use.
