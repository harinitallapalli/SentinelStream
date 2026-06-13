# SentinelStream – Real-Time Fraud Detection Dashboard

## Overview

SentinelStream is a full-stack fraud detection and transaction monitoring platform built using FastAPI, PostgreSQL, SQLAlchemy, React, and Recharts. The system analyzes transactions in real time, classifies them into risk categories, generates fraud alerts, and visualizes analytics through an interactive dashboard.

## Features

### Backend

* User Management APIs
* Transaction Management APIs
* Fraud Alert APIs
* Statistics APIs
* Async SQLAlchemy Integration
* PostgreSQL Database

### Fraud Detection Engine

* SAFE Classification
* FRAUD Classification
* HIGH_RISK Classification
* Automatic Fraud Alert Generation

### Frontend Dashboard

* Dashboard Summary Cards
* Interactive Pie Chart
* Interactive Bar Chart
* Transaction Creation Form
* Transactions Table
* Fraud Alerts Table
* Search Functionality
* Transaction Status Filtering

## Tech Stack

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Pydantic
* Uvicorn

### Frontend

* React
* Vite
* Axios
* Recharts
* Tailwind CSS

## System Architecture

User → React Dashboard → FastAPI APIs → PostgreSQL Database

Transactions are analyzed by the Fraud Detection Engine before being stored. Suspicious transactions automatically generate fraud alerts and update dashboard analytics.

## Risk Classification Rules

SAFE:

* Transaction amount ≤ ₹10,000

FRAUD:

* Transaction amount > ₹10,000
* Suspicious location detected

HIGH_RISK:

* Transaction amount > ₹50,000

## API Endpoints

### Users

POST /users/

* Create User

GET /users/

* List Users

### Transactions

POST /transactions/

* Create Transaction

GET /transactions/

* List Transactions

### Fraud Alerts

GET /alerts/

* List Fraud Alerts

### Statistics

GET /stats/

* Dashboard Analytics

## Dashboard Features

* Total Transactions
* Safe Transactions
* Fraud Transactions
* High Risk Transactions
* Fraud Rate Calculation
* Risk Distribution Visualization
* Transaction Monitoring
* Fraud Alert Monitoring

## Installation

Clone Repository

git clone <repository-url>

Backend Setup

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

Run Backend

uvicorn app.main:app --reload

Frontend Setup

cd sentinelstream-frontend

npm install

npm run dev

## Future Enhancements

* CSV Export
* PDF Reports
* JWT Authentication
* Role-Based Access Control
* Email Notifications
* Machine Learning Fraud Detection
* Docker Deployment
* AWS Cloud Deployment

## Author

Harini Tallapalli
