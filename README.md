# RobinHood Quant Engine

Welcome to the RobinHood Quant Engine! This project is a highly scalable, zero-liability quantitative trading platform designed to serve millions of subscribers without holding any of their sensitive broker data.

## How It Works

The core philosophy of this project is **Zero-Liability Edge Execution**. Instead of executing trades on a central server, we split the work into two parts:

1. **The Publisher (Backend):** 
   Our centralized system calculates the optimal portfolio targets based on daily market data. It generates a single, cryptographically signed JSON file and pushes it to a CDN. We do not store any client cash balances, broker API keys, or open positions here.

2. **The Subscriber (Desktop Agent):** 
   Clients download and run a local desktop agent. This agent securely authenticates with our backend using a token, downloads the daily signed JSON file, and verifies its integrity. The agent then reads the user's local broker holdings and runs the `Policy Engine` to calculate exactly what to buy or sell. 

By keeping all execution and API keys on the user's local machine, we ensure maximum security and strict regulatory compliance.

## Project Structure

We are currently building out the platform, which upgrades our backend into a robust Django SaaS application.

- **`PublisherApp/`**: Handles the math. It stores market data, calculates technical features, and generates the daily target portfolio.
- **`SubscriberApp/`**: Handles the business. It manages our subscription plans, user accounts, and token generation/revocation. If an admin disables a token here, the client's desktop app instantly receives a 403 Forbidden error.

## Core Features

- **One-Way Communication:** The publisher only pushes data out. It never accepts inbound financial data from users.
- **Cryptographic Security:** Every JSON target file is signed with Ed25519 and hashed with SHA256. If a file is tampered with, the client agent will reject it instantly.
- **Horizontal Scalability:** Because the publisher only serves a static file via CDN, the system can effortlessly scale from 100 to over 5,000,000 subscribers with near-zero server load.

## Getting Started

To run the publisher backend locally:

1. Activate your virtual environment.
2. Navigate to the `publisher_agent` directory.
3. Run migrations to set up your local database:
   ```bash
   python manage.py migrate
   ```
4. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
