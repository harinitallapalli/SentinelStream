# SentinelStream

## Overview

SentinelStream is a fraud detection and transaction monitoring platform built using FastAPI, PostgreSQL, and SQLAlchemy. The system allows users to create and manage transactions, automatically detects suspicious activities using fraud detection rules, generates fraud alerts, and provides dashboard analytics for monitoring system activity.

The project demonstrates backend development concepts including REST APIs, asynchronous database operations, fraud detection workflows, analytics endpoints, and PostgreSQL integration.

---

## Features

### User Management

* Create users
* View all users

### Transaction Management

* Create transactions
* View all transactions
* Store transaction amount, location, and fraud status

### Fraud Detection Engine

Transactions are automatically analyzed based on predefined fraud rules:

* Transactions above a threshold amount are flagged
* Suspicious locations are flagged
* Transactions are categorized as:

  * SAFE
  * FRAUD
  * HIGH_RISK

### Fraud Alerts

* Automatically generates alerts for suspicious transactions
* View all fraud alerts through API

### Analytics & Dashboard

* Total transactions
* Fraud transactions
* Safe transactions
* Fraud rate percentage
* Total amount processed
* Dashboard summary metrics

---

## Tech Stack

### Backend

* FastAPI
* Python 3.13

### Database

* PostgreSQL
* SQLAlchemy (Async ORM)
* AsyncPG

### Tools

* Swagger UI
* Uvicorn
* Git & GitHub
* dotenv

---

## Project Structure

```text
app/
├── api/
│   ├── user.py
│   ├── transaction.py
│   ├── alert.py
│   ├── stats.py
│   └── dashboard.py
│
├── database/
│   ├── db.py
│   └── create_tables.py
│
├── models/
│   ├── user.py
│   ├── transaction.py
│   └── fraud_alert.py
│
├── schemas/
│   ├── user.py
│   └── transaction.py
│
├── services/
│   └── fraud_service.py
│
└── main.py
```

---

## Requirements

* Python 3.11+
* PostgreSQL
* Git

---

## Installation

### Clone Repository

```bash
git clone https://github.com/harinitallapalli/SentinelStream.git
cd SentinelStream
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

Windows:

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/SentinelStream
```

---

## Database Setup

Create database tables:

```bash
python -m app.database.create_tables
```

---

## Running the Application

```bash
uvicorn app.main:app --reload
```

Application URL:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

## API Endpoints

### Users

#### Create User

```http
POST /users/
```

Example:

```json
{
  "name": "Harini",
  "email": "harini@gmail.com"
}
```

#### Get Users

```http
GET /users/
```

---

### Transactions

#### Create Transaction

```http
POST /transactions/
```

Example:

```json
{
  "user_id": 1,
  "amount": 50000,
  "location": "Hyderabad"
}
```

#### Get Transactions

```http
GET /transactions/
```

---

### Fraud Alerts

#### Get Fraud Alerts

```http
GET /alerts/
```

---

### Statistics

#### Get System Statistics

```http
GET /stats/
```

Example Response:

```json
{
  "total_transactions": 10,
  "fraud_transactions": 3,
  "safe_transactions": 7,
  "fraud_rate": "30.0%",
  "total_amount_processed": 125000
}
```

---

### Dashboard

#### Get Dashboard Summary

```http
GET /dashboard/
```

Example Response:

```json
{
  "total_users": 5,
  "total_transactions": 20,
  "fraud_alerts": 4,
  "fraud_rate": "20.0%"
}
```

---

## Fraud Detection Logic

Current fraud rules:

* Amount greater than 10,000 → FRAUD
* Amount greater than 50,000 → HIGH_RISK
* Suspicious locations:

  * Unknown
  * Foreign
  * DarkWeb

Example:

```python
def check_fraud(amount, location):
    ...
```

---

## Future Enhancements

* Frontend Dashboard (React)
* Data Visualization Charts
* User Authentication
* Redis Integration
* Celery Background Jobs
* Email Notifications
* Machine Learning Fraud Detection
* Real-time Monitoring

---

## Author

Harini Tallapalli

Built as a learning project for fraud detection, backend development, and financial transaction monitoring using FastAPI and PostgreSQL