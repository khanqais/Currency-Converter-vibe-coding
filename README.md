# 💱 Currency Converter

A full-stack currency exchange and financial utility platform built with **React (Vite)**, **Node.js (Express)**, and **SQLite**. It offers live currency conversions with country flags, historical exchange rate trends, travel budget planning, quick-access favorites, and automated email rate alerts via background cron jobs.

---

## ✨ Features

- **⚡ Real-Time Currency Conversion**: Instant rate calculation across 160+ world currencies with national flag icons and 2-decimal precision.
- **📈 Historical Rate Trends**: Interactive chart visualizing currency exchange rate fluctuations over 7 days, 30 days, 90 days, or 1 year.
- **⭐ Favorite Currency Pairs**: Save and quickly toggle between frequently monitored currency pairs.
- **✈️ Travel Budget Planner**: Plan trip expenses in local currency and convert total estimates back to your home currency.
- **🔔 Rate Alerts & Background Cron**: Set target thresholds (e.g., *"notify me when USD/INR drops below 84"*). An hourly background cron job polls exchange rates and sends automatic email alerts via Nodemailer.
- **💾 Local SQLite Storage**: Lightweight, persistent storage for favorites, conversion history, and alert configurations.

---

## 🛠️ Tech Stack

### Frontend
- **React** (Vite)
- **Vanilla CSS** (Modern responsive design, custom glassmorphism UI)
- **Axios** (API requests)
- **Flagcdn** (Country flag assets)

### Backend
- **Node.js & Express.js** (REST API)
- **SQLite3** (Embedded database)
- **node-cron** (Scheduled background jobs)
- **Nodemailer** (Automated email alerts)
- **ExchangeRate-API** (Live forex rates)

---

## 📁 Project Structure

```
Currency Converter/
├── Backend/
│   ├── db/                 # SQLite database initialization & queries
│   ├── jobs/               # Background cron workers (alert checker)
│   ├── routes/             # Express API endpoints
│   ├── services/           # Exchange rate API & email dispatchers
│   ├── .env.example        # Environment variables template
│   ├── server.js           # Express app entry point
│   └── package.json
├── Frontend/
│   ├── public/             # Static assets & favicon
│   ├── src/
│   │   ├── components/     # CurrencyConverter, TrendChart, RateAlerts, etc.
│   │   ├── services/       # Frontend API client
│   │   ├── utils/          # Currency & flag metadata
│   │   ├── App.jsx         # Main layout & state coordinator
│   │   └── index.css       # Global styles & theme tokens
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

---

### 1. Backend Setup

1. Open a terminal and navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```env
   PORT=5000
   EXCHANGERATE_API_KEY=your_api_key_here
   
   # Optional: Email alerts setup (Gmail App Password)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM="Currency Alerts <your_email@gmail.com>"
   ```

4. Start the backend server:
   ```bash
   npm run dev
   # or
   nodemon server.js
   ```
   *The backend will run on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will typically run on `http://localhost:5173`.*

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/convert` | Convert amount between two currencies |
| `GET` | `/api/history` | Fetch historical rate trend data |
| `GET` / `POST` / `DELETE` | `/api/favorites` | Manage saved currency pairs |
| `GET` / `POST` / `DELETE` | `/api/travel-budget` | Manage trip expense items and totals |
| `GET` / `POST` / `DELETE` | `/api/alerts` | Manage email rate threshold alerts |

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
