# RupeeRocket

RupeeRocket is a production-oriented personal finance web application built with a React + Vite frontend, a Flask backend, SQLite for the initial datastore, JWT authentication, Axios for API access, Recharts for analytics visualization, and Google Gemini-powered expense categorization.

## Architecture

The codebase is split into two independently deployable applications:

- `backend/` contains the Flask API, SQLAlchemy models, JWT auth, analytics services, and a dedicated AI service layer for Gemini-based categorization.
- `frontend/` contains the Vite-powered React UI, reusable components, route guards, theme management, and chart-driven dashboard pages.

The backend is organized around a service-first Flask app factory. Blueprints handle auth, categories, transactions, dashboard data, analytics, and AI integration. Database access goes through SQLAlchemy models, and the `DATABASE_URL` environment variable keeps the storage layer portable so PostgreSQL can be added later without changing app code.

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
3. Copy `backend/.env.example` to `.env` and set secure values for `SECRET_KEY`, `JWT_SECRET_KEY`, and `GEMINI_API_KEY`.
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
- `POST /api/receipts/upload`

### AI Transaction Categorization

When `POST /api/transactions` is called without a `category_id`, the backend sends the transaction title, amount, type, and notes to Gemini and stores the predicted category on the transaction record.

Required AI categories:

- Food
- Travel
- Shopping
- Bills
- Entertainment
- Health
- Education
- Salary
- Investments
- Other

Example request:

```json
{
	"title": "Swiggy order 450",
	"amount": 450,
	"type": "expense",
	"date": "2026-05-21",
	"notes": "Dinner delivery"
}
```

Example response:

```json
{
	"success": true,
	"message": "Transaction created.",
	"data": {
		"transaction": {
			"id": 101,
			"title": "Swiggy order 450",
			"category_id": 4,
			"category_name": "Food",
			"ai_category": {
				"name": "Food",
				"confidence": 0.93,
				"source": "gemini",
				"provider": "gemini-1.5-flash",
				"reason": null
			}
		},
		"ai_category": {
			"name": "Food",
			"confidence": 0.93,
			"source": "gemini",
			"provider": "gemini-1.5-flash",
			"reason": null
		}
	}
}
```

## Receipt Scanning

Receipt uploads are handled by `POST /api/receipts/upload` with `multipart/form-data`.

Accepted files:

- `.jpg`
- `.jpeg`
- `.png`

Example `curl` request:

```bash
curl -X POST "http://localhost:5000/api/receipts/upload" \
	-H "Authorization: Bearer <JWT_TOKEN>" \
	-F "file=@/path/to/receipt.jpg"
```

Example response:

```json
{
	"success": true,
	"message": "Receipt processed.",
	"data": {
		"receipt": {
			"merchant": "Dominos",
			"amount": 599,
			"date": "2026-05-22",
			"category": "Food",
			"ocr_confidence": 91.4,
			"transaction_id": 101
		},
		"transaction": {
			"id": 101,
			"title": "Dominos",
			"amount": 599,
			"type": "expense"
		}
	}
}
```

Testing examples:

- Invalid file type returns a 400 response with a validation message.
- Blurry or unreadable images return a descriptive OCR error instead of creating a transaction.
- Missing Gemini configuration falls back to OCR-based parsing and category rules.

Example pytest-style smoke test:

```python
def test_receipt_upload(client, auth_headers, sample_receipt_file):
		response = client.post(
				"/api/receipts/upload",
				headers=auth_headers,
				data={"file": sample_receipt_file},
				content_type="multipart/form-data",
		)

		assert response.status_code == 201
		payload = response.get_json()
		assert payload["success"] is True
		assert payload["data"]["receipt"]["merchant"]
```

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
- Flask-Bcrypt
- google-genai
- Pillow
- pytesseract
- Tesseract OCR installed on the host and available on PATH
- pymysql
- python-dotenv
- gunicorn

Receipt scanning can also be tuned with `MAX_RECEIPT_UPLOAD_MB` and `RECEIPT_OCR_MIN_CONFIDENCE`.
If Tesseract is installed outside PATH on Windows, set `TESSERACT_CMD` to the full path of `tesseract.exe`.

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
5. Expand the Gemini layer to support insights, receipts, and spending anomaly detection using the same reusable service pattern.

## Notes

- The backend auto-creates tables in development for a quick start, but the app is structured for migrations in production.
- The AI layer is intentionally isolated so it can be replaced later without touching the UI or core finance routes.
- If Gemini is unavailable or the key is missing, the backend falls back to deterministic keyword rules and still stores the predicted category metadata.