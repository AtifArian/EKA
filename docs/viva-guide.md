# EKA Viva Guide (Full)

Date context: Jan 2026  
Stack: Flask (Python) + React (JS) + SQL (SQLite locally, Postgres in production) + REST JSON APIs

---

## What else is used in this project (quick inventory)

**Backend** (see [backend/requirements.txt](../backend/requirements.txt))
- Flask extensions: SQLAlchemy (`flask-sqlalchemy`), CORS (`flask-cors`), JWT (`flask-jwt-extended`), bcrypt (`flask-bcrypt`)
- Config: `python-dotenv`
- AI: `google-generativeai` (Gemini)
- Google login verification: `google-auth`
- Sentiment/risk utilities: `textblob`, `numpy`
- Production server: `gunicorn` (see [backend/Procfile](../backend/Procfile))
- Postgres driver: `psycopg2-binary`

**Frontend** (see [frontend/package.json](../frontend/package.json))
- API calls: `axios`
- Routing: `react-router-dom`
- Google OAuth UI: `@react-oauth/google`
- Maps: `leaflet`, `react-leaflet`
- Icons: `react-icons`

**Deployment/config**
- Vercel static frontend build configuration: [vercel.json](../vercel.json)
- Backend supports env-based config and switches SQLite → Postgres when `DATABASE_URL` exists (see [backend/app/__init__.py](../backend/app/__init__.py))

> Note: the README says “Ease, Kindness, Affection”, while the chatbot prompt says “Ease, Kindness, Awareness”. If asked in viva, answer with what your README states, and mention the chatbot prompt wording differs.

---

# 1️⃣ PROJECT OVERVIEW

## What problem this project solves
This project is a **mental wellness platform** that combines self-help tools with professional support:
- **Mood tracking** (daily mood entries)
- **Journaling** (private/public), with emotion/sentiment analysis
- **Educational content** (doctor-written articles, likes, comments)
- **Clinics/doctors discovery** (with map support)
- **Bookings + chat + video call** to connect users with professionals
- **Donations** to support awareness/services
- **AI chatbot** for guidance and platform navigation

**Real-world analogy**:  
Think of it like a *digital mental health clinic + diary + community board* in one place.

## Why Flask + React is a good choice
- **Flask**: lightweight, flexible, ideal for JSON REST APIs; easy to extend with JWT/ORM/CORS.
- **React**: great for interactive UI (SPA routing, chat-like flows, live updates);
  components help reuse UI for articles, clinics, journals, etc.
- **Separation of concerns**: UI can change without breaking API; API can be reused by other clients.

## Role of frontend vs backend
- **Frontend (React)**: UI + navigation + forms + calling APIs + showing data.
- **Backend (Flask)**: authentication, authorization, validation, business logic, DB access, returns JSON.

**Analogy**:
- Frontend = *shopfront* (what the user sees)
- Backend = *kitchen + cashier + inventory system* (rules, cooking, billing)

## What happens when a user opens the website

```
Browser requests the frontend
  -> downloads React build (HTML/CSS/JS)
  -> React Router renders a page (Home/Login/Articles/...)
  -> user interacts
  -> React calls Flask API
  -> Flask reads/writes DB
  -> Flask returns JSON
  -> React updates UI
```

---

# 2️⃣ FLASK BACKEND FUNDAMENTALS

## What Flask is and why it is lightweight
Flask is a **Python web framework** that provides:
- routing (URL → function)
- request parsing
- response creation

It is called “lightweight” because it doesn’t force big structure; you add only what you need via extensions.

## App structure (app.py, routes, models)
Your backend follows an **app factory** pattern.

Main entry:
- [backend/run.py](../backend/run.py) creates app and runs it.

Factory:
- [backend/app/__init__.py](../backend/app/__init__.py) defines `create_app()` and registers blueprints.

Models/DB:
- [backend/app/models.py](../backend/app/models.py) defines SQLAlchemy models and relationships.

Routes:
- [backend/app/routes](../backend/app/routes) contains blueprints (auth/users/articles/etc).

**ASCII structure diagram**

```
backend/
  run.py
  app/
    __init__.py        # create_app, init extensions, register routes
    config.py          # Config class
    models.py          # SQLAlchemy models
    routes/            # blueprints
    utils/             # sentiment + risk + helpers
```

## `@app.route()` explained (and Blueprints)
A route connects:
- URL path
- HTTP method
- Python function handler

Your code mostly uses blueprints:

```py
from flask import Blueprint

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    ...
```

Blueprint analogy: *departments*.
- Auth department handles `/api/auth/...`
- Users department handles `/api/users/...`

## HTTP methods
- **GET**: read data (should not change server state)
- **POST**: create resource / submit action
- **PUT**: update resource
- **DELETE**: remove resource

## Request vs Response
- **Request**: method + URL + headers + body (JSON)
- **Response**: status code + headers + JSON body

**Analogy**:
- Request = order form
- Response = delivered item + receipt

## JSON handling in Flask
- Read JSON: `request.get_json()`
- Return JSON: `jsonify(...)`

Example pattern (from auth):

```py
data = request.get_json()
return jsonify({'access_token': token, 'user': user.to_dict()}), 201
```

## Status codes you must know
- **200 OK**: success
- **201 Created**: created new resource (e.g., signup)
- **400 Bad Request**: invalid input
- **401 Unauthorized**: not logged in / wrong credentials
- **404 Not Found**: resource missing
- **500 Server Error**: unexpected backend error

### Common viva questions + ideal answers

**Q: Why did you choose Flask?**  
A: “Flask is lightweight and flexible for REST APIs. I can add extensions like SQLAlchemy, JWT, CORS only when needed and keep the backend modular with Blueprints.”

**Q: What is REST?**  
A: “REST is an API design style: resources identified by URLs, standard HTTP methods, stateless requests, and JSON representations.”

**Q: Difference between GET and POST?**  
A: “GET retrieves data and shouldn’t change server state; POST sends data to create something or perform an action, and it usually changes server state.”

---

# 3️⃣ REACT FRONTEND FUNDAMENTALS

## What React is
React is a JavaScript library to build UIs using reusable **components**.

## SPA (Single Page Application)
SPA loads one main page, then switches screens client-side.
Your app uses React Router (see [frontend/src/App.jsx](../frontend/src/App.jsx)).

```
/           -> Home
/login      -> Login
/articles   -> Articles
/clinics    -> Clinics
```

## Components
Components are reusable UI blocks:
- Navbar, MoodTracker, Chatbot, ArticleTile, etc.

## JSX
JSX is HTML-like syntax inside JavaScript that compiles to React elements.

## Props vs State
- **Props**: data passed into a component (like function parameters)
- **State**: internal component memory (changes trigger re-render)

In [frontend/src/App.jsx](../frontend/src/App.jsx), `user` is stored in state:

```jsx
const [user, setUser] = useState(null);
```

## `useState` and `useEffect`
- `useState`: stores changing data (user, loading, form inputs)
- `useEffect`: runs side-effects (fetching, timers)

In [frontend/src/App.jsx](../frontend/src/App.jsx) you load token from localStorage in an effect.

## Controlled forms
Controlled input means React state is the single source of truth.
Example pattern:

```jsx
const [email, setEmail] = useState('');
<input value={email} onChange={e => setEmail(e.target.value)} />
```

## Why React is fast (Virtual DOM)
React builds a virtual UI tree, diffs changes, and updates only the needed DOM parts.

**Analogy**: like editing only the changed lines in a document instead of reprinting the whole book.

### Common viva questions + ideal answers

**Q: What is state?**  
A: “State is component data that can change over time. When it changes, React re-renders to reflect the new UI.”

**Q: Why React instead of plain HTML?**  
A: “Because the UI is dynamic (auth state, routing, data lists, chat). React manages state cleanly and updates efficiently.”

---

# 4️⃣ FRONTEND ↔ BACKEND INTERACTION

## What is an API
An API is a contract: “send request X, receive response Y”.

## REST API concept
Resources are exposed by endpoints:
- `/api/auth/login`
- `/api/mood`
- `/api/articles`
- etc.

## How React calls Flask APIs (axios workflow)
Your frontend centralizes requests in [frontend/src/services/api.js](../frontend/src/services/api.js):
- sets `baseURL`
- adds JWT automatically in an interceptor:
  - `Authorization: Bearer <token>`

## Step-by-step (required chain)

```
User -> React UI -> Axios -> Flask route -> SQLAlchemy -> DB
                                   <- JSON response <-
React updates state -> UI updates
```

## Sample API call (React)

```js
export const createMoodEntry = (data) =>
  api.post('/mood', data).then(res => res.data);
```

## Sample Flask route
(from [backend/app/routes/mood.py](../backend/app/routes/mood.py))

```py
@mood_bp.route('', methods=['POST'])
@jwt_required()
def create_mood_entry():
    data = request.get_json()
    ...
    return jsonify({'message': 'Mood entry saved', 'mood': mood.to_dict()}), 201
```

## Sample JSON response

```json
{
  "message": "Mood entry saved",
  "mood": {
    "id": 12,
    "user_id": 5,
    "mood_level": 3,
    "date": "2026-01-05",
    "notes": "..."
  }
}
```

---

# 5️⃣ DATABASE CONNECTION

## Why a database is needed
To persist users, moods, journals, articles, bookings, chats, etc.

## SQL vs NoSQL
- **SQL**: tables, fixed schema, relations (your project)
- **NoSQL**: documents/collections, flexible schema

## Tables and primary key
A **primary key** uniquely identifies each row. Example in [backend/app/models.py](../backend/app/models.py):

```py
id = db.Column(db.Integer, primary_key=True)
```

## CRUD operations
SQL meanings:
- CREATE → `INSERT`
- READ → `SELECT`
- UPDATE → `UPDATE`
- DELETE → `DELETE`

## How Flask connects to DB (your project)
You use SQLAlchemy ORM:
- Initialize: `db.init_app(app)` in [backend/app/__init__.py](../backend/app/__init__.py)
- Local DB: SQLite URI in [backend/app/config.py](../backend/app/config.py)
- Production DB: uses `DATABASE_URL` (Postgres), also in [backend/app/__init__.py](../backend/app/__init__.py)

## ORM vs Raw SQL
- **Raw SQL**: manually write SQL queries
- **ORM**: interact using objects; ORM generates SQL

Example ORM query:

```py
user = User.query.filter_by(email=data['email']).first()
```

### Common viva questions + ideal answers

**Q: What is ORM?**  
A: “ORM maps tables to classes so we can query using objects. It improves productivity and reduces repetitive SQL.”

**Q: How is data stored?**  
A: “In relational tables. Records are linked using primary keys and foreign keys, e.g., mood entries store `user_id` referencing a user.”

---

# 6️⃣ AUTHENTICATION & SECURITY (used in your project)

Your project uses:
- JWT auth (`flask-jwt-extended`)
- bcrypt password hashing (`flask-bcrypt`)
- Google login token verification (`google-auth`)
- CORS configuration (`flask-cors`)

## Login flow (JWT)

```
1) User submits email+password
2) Flask checks password hash
3) Flask returns access_token (JWT)
4) React stores token (localStorage)
5) React sends Bearer token on future requests
6) Flask validates token on protected routes
```

## Password hashing
In [backend/app/models.py](../backend/app/models.py):
- `set_password()` hashes password
- `check_password()` verifies password against hash

Key concept:
- Hashing is one-way; you never store plaintext passwords.

## JWT vs Sessions (simple viva answer)
- **Sessions**: server stores session state; browser holds session cookie
- **JWT**: browser holds token; server verifies signature and reads identity

## CORS
CORS is a browser security rule for cross-origin requests.
Your backend explicitly allows certain origins / headers (see [backend/app/__init__.py](../backend/app/__init__.py)).

**Viva trap**: Postman doesn’t enforce CORS; browsers do.

---

# 7️⃣ ERROR HANDLING & VALIDATION

## Backend validation
Example in mood route (see [backend/app/routes/mood.py](../backend/app/routes/mood.py)):
- rejects invalid mood values with 400
- uses try/except for unexpected errors
- rollbacks DB session on failure

## Frontend validation
Frontend does quick UX checks (example donation form checks amount before API call in [frontend/src/pages/Home.jsx](../frontend/src/pages/Home.jsx)).

## try/except in Flask
Used to avoid crashing the server and to return proper JSON errors.

## Handling API errors in React
Your axios response interceptor logs out users when 401 indicates expired/invalid JWT (see [frontend/src/services/api.js](../frontend/src/services/api.js)).

---

# 8️⃣ DEPLOYMENT & CONFIGURATION

## Development vs Production
- **Dev**: React dev server + Flask dev server
- **Prod**: React built static files + Flask behind Gunicorn

## Environment variables
Why: keep secrets/config out of code.

Backend examples:
- `DATABASE_URL` (switch to Postgres)
- `JWT_SECRET_KEY`, `SECRET_KEY`
- `FRONTEND_URL` (CORS)
- `GEMINI_API_KEY`

Frontend examples:
- `REACT_APP_API_URL`
- `REACT_APP_GOOGLE_CLIENT_ID`

## Why `.env` is used
For local development convenience without committing secrets.

## Backend & frontend deployment flow

```
Frontend (Vercel): build React -> serve static files
Backend (Gunicorn): run Flask app -> connect to Postgres/SQLite
```

---

# 9️⃣ PERFORMANCE & BEST PRACTICES

## Why separate frontend and backend
- cleaner architecture
- deploy and scale independently
- API can be reused for other clients

## Reusability of APIs
Once `/api/articles` exists, any client can consume it (web, mobile, admin tool).

## Scalability
- JWT supports stateless auth
- Postgres in production is more robust than SQLite under concurrency

## Maintainability
- Blueprints keep routes modular
- Centralized axios service prevents duplicated request logic

---

# Extra: rapid-fire viva Q&A (short answers)

- **What is JWT?**
  A signed token used to prove identity. Client sends it in `Authorization: Bearer ...`; server verifies signature and extracts identity.

- **How do you protect routes?**
  Use `@jwt_required()` on endpoints and validate identity with `get_jwt_identity()`.

- **Where should validation happen?**
  Both. Frontend for UX; backend for security and correctness.

- **Why bcrypt?**
  It’s a slow hashing algorithm designed for passwords, making brute-force attacks harder.

- **What is CORS?**
  Browser cross-origin security policy; server must allow your frontend origin to call your backend.
