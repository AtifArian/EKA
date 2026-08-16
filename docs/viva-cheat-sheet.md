# EKA Viva Cheat Sheet (1 page)

## One-line project description
A mental wellness platform where users track mood, write journals, read doctor articles, find clinics, book sessions, chat/video call, donate, and optionally use an AI chatbot.

## Architecture (say this confidently)
```
React (SPA UI)  <---JSON REST--->  Flask (API)  <---SQLAlchemy--->  SQLite/Postgres
```

## Why Flask + React
- Flask: lightweight REST API, easy Blueprints + extensions
- React: component UI + SPA routing + state management
- Separation: easier deployment + reuse APIs

## Frontend vs Backend
- React: UI, routing, forms, calling APIs
- Flask: auth, validation, DB logic, returns JSON

## REST + HTTP methods
- GET: read
- POST: create/action
- PUT: update
- DELETE: remove

## Status codes
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 404 Not Found
- 500 Server Error

## Auth (your project)
- JWT tokens (`flask-jwt-extended`)
- Password hashing with bcrypt (`flask-bcrypt`)

Login flow:
1) POST login → 2) verify hash → 3) return JWT → 4) React stores token → 5) send `Authorization: Bearer <token>`

## DB (your project)
- SQLAlchemy ORM (`flask-sqlalchemy`)
- SQLite locally; Postgres in production when `DATABASE_URL` exists
- ORM = tables ↔ Python classes

## CORS (browser rule)
Backend must allow frontend origin to call APIs.

## Typical viva Q&A
- Why Flask? “Lightweight REST APIs + extensions only as needed.”
- What is REST? “Stateless resource-based API design using HTTP methods + JSON.”
- GET vs POST? “GET reads; POST creates/changes server state.”
- What is state in React? “Component memory that triggers re-render when changed.”
- Why never store plain passwords? “Leaks are catastrophic; hashing protects users.”
