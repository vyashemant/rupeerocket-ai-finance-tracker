# RupeeRocket

RupeeRocket is a production-oriented personal finance web application built with a React + Vite frontend, a Flask backend, SQLite for the initial datastore, JWT authentication, Axios for API access, and Recharts for analytics visualization.

## Architecture

The codebase is split into two independently deployable applications:

- `backend/` contains the Flask API, SQLAlchemy models, JWT auth, analytics services, and an isolated AI-insights seam.
- `frontend/` contains the Vite-powered React UI, reusable components, route guards, theme management, and chart-driven dashboard pages.

The backend is organized around a service-first Flask app factory. Blueprints handle auth, categories, transactions, dashboard data, analytics, and future AI integration. Database access goes through SQLAlchemy models, and the `DATABASE_URL` environment variable keeps the storage layer portable so PostgreSQL can be added later without changing app code.

The frontend is built as a route-based application with protected dashboard routes, reusable UI primitives, shared API helpers, and dark/light theme persistence. Dashboard data is fetched from the API layer with Axios and rendered through reusable chart and card components.

## Folder Structure

```text
RupeeRocket/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── run.py
│   ├── wsgi.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── contexts/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── styles/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.cjs
│   └── .env.example
└── README.md
```

## Backend Setup

1. Create and activate a Python virtual environment in `backend/`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `backend/.env.example` to `.env` and set secure values for `SECRET_KEY` and `JWT_SECRET_KEY`.
4. Run `python run.py` from the `backend/` directory.

### Backend API Surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/<id>`
- `DELETE /api/categories/<id>`
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/<id>`
- `DELETE /api/transactions/<id>`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/trend`
- `GET /api/analytics/monthly`
- `GET /api/ai/insights`

## Frontend Setup

1. Install Node.js dependencies in `frontend/` with `npm install`.
2. Copy `frontend/.env.example` to `.env` and confirm `VITE_API_BASE_URL` points to the Flask backend.
3. Run `npm run dev` from the `frontend/` directory.

## Required Dependencies

### Backend

- Flask
- Flask-Cors
- Flask-JWT-Extended
- Flask-Migrate
- Flask-SQLAlchemy
- python-dotenv
- gunicorn

### Frontend

- React
- React Router
- Axios
- Recharts
- Vite
- Tailwind CSS
- PostCSS
- Autoprefixer

## Current UI Coverage

- Landing page
- Login page
- Signup page
- Protected dashboard shell
- Add transaction page
- Analytics page
- Dark/light mode toggle
- Loading and error states

## Implementation Plan

1. Lock down the auth flow, session refresh, and form validation on the frontend and backend.
2. Add pagination, filtering, and richer CRUD operations for transactions and categories.
3. Introduce database migrations and switch the data layer from SQLite to PostgreSQL without changing the app contract.
4. Expand dashboard insights with budgets, recurring transactions, and goal tracking.
5. Integrate a real AI provider behind the existing `api/ai/insights` contract for personalized financial coaching.

## Notes

- The backend auto-creates tables in development for a quick start, but the app is structured for migrations in production.
- The AI layer is intentionally isolated so it can be replaced later without touching the UI or core finance routes.