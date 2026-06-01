# SentinelStream

## Overview

SentinelStream is a small FastAPI service for managing users and transactions with a basic fraud check.

## Features

- Create and list users
- Create and list transactions
- Simple fraud detection based on transaction amount
- Async SQLAlchemy database access

## Requirements

- Python 3.11 or later
- A supported async database driver such as `asyncpg`
- Database configured using `DATABASE_URL`

## Setup

1. Create and activate a virtual environment:

```bash
python -m venv venv
venv\Scripts\Activate.ps1
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the project root with the database URL:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/sentinelstream
```

4. Create database tables:

```bash
python -m app.database.create_tables
```

## Run the application

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## API Endpoints

### Users

- `POST /users/`
  - Request body: `{ "name": "Alice", "email": "alice@example.com" }`
  - Creates a new user.

- `GET /users/`
  - Returns a list of users.

### Transactions

- `POST /transactions/`
  - Request body: `{ "user_id": 1, "amount": 12000.0, "location": "New York" }`
  - Creates a transaction and checks fraud status.

- `GET /transactions/`
  - Returns a list of transactions.

## Notes

- `app/api/transaction.py` uses a simple fraud rule: amounts above 10,000 are marked as `FRAUD`.
- The app currently returns simple response messages for creation endpoints.
- For production, ensure your database URL and credentials are secured.

