# RobinHood Quant Engine

## Overview

This repository contains the backend architecture for the RobinHood Quant Engine, a zero-liability quantitative trading platform. The system is designed to serve high-volume subscriber bases without ingesting or storing sensitive broker credentials, cash balances, or open positions.

The architecture strictly separates strategy generation (Publisher) from strategy execution (Subscriber).

## Architecture

1. **Publisher (Backend)**
   The central backend (Django/Celery) executes the mathematical engine against daily market data to determine optimal portfolio targets. It generates a single, cryptographically signed JSON document and serves it via a read-only endpoint.
2. **Subscriber (Client Agent)**
   Clients run a local desktop agent that securely authenticates via token, downloads the daily signed JSON, and verifies the cryptographic signature. The agent then reads the client's local broker holdings and runs the Policy Engine to calculate executable orders locally based on the strict constraints defined by the Publisher document.

This model ensures maximum security, strict regulatory compliance, and near-infinite horizontal scalability.

## Backend Structure

The backend is built as a robust Django SaaS application, orchestrated via Celery for automated daily execution.

- **`PublisherApp/`**: Contains the core Math Engine and Rules Engine. It fetches market data, calculates regime/momentum, and generates the cryptographically signed daily target portfolio JSON.
- **`AccessApp/`**: Manages subscription plans, user accounts, and token lifecycles. Token revocation immediately denies endpoint access to the client agent (403 Forbidden).

## Core Security & Scalability

- **One-Way Data Flow:** The publisher pushes state targets out. It structurally rejects any inbound financial data from users.
- **Cryptographic Integrity:** Every JSON target file is hashed via SHA-256 and signed with Ed25519. Client agents reject tampered files before the policy engine is ever reached.
- **Stateless Distribution:** Serving a static, signed JSON payload allows the backend to scale from hundreds to millions of subscribers with minimal infrastructure overhead.

## Setup Instructions

To run the publisher backend locally:

1. Create a `.env` file from the provided `.env.example` (or configure required variables: `SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
2. Activate the virtual environment.
3. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
4. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
5. Ensure Redis is running and start the Celery worker for automated data fetching.
