# 🚀 Smart Supply Chains – Frontend

## 📌 Project Overview

This project is part of the **GDG Solution Challenge**.
It is a smart logistics platform that monitors shipments, predicts delays using AI, and provides real-time updates using Firebase.

---

## 🧠 Tech Stack

* ⚛️ React.js (Vite)
* 🎨 Tailwind CSS
* 🔥 Firebase Firestore
* 🌍 Google Maps API
* 📊 Recharts

---

## 📂 Project Structure

```
solution-challenge/
│
├── frontend/
│   └── my-app/
│       │
│       ├── public/
│       │
│       ├── src/
│       │   ├── api/
│       │   │   └── shipments.js
│       │   │
│       │   ├── firebase/
│       │   │   └── firebaseConfig.js
│       │   │
│       │   ├── components/
│       │   │   ├── Navbar.jsx
│       │   │   ├── ShipmentMap.jsx
│       │   │   ├── ShipmentTable.jsx
│       │   │   ├── RiskBadge.jsx
│       │   │   ├── AlertBanner.jsx
│       │   │   ├── StatCard.jsx
│       │   │   ├── HeatmapOverlay.jsx
│       │   │   ├── SimulationPanel.jsx
│       │   │   └── LoadingSpinner.jsx
│       │   │
│       │   ├── pages/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── ShipmentDetail.jsx
│       │   │   ├── CreateShipment.jsx
│       │   │   ├── Simulation.jsx
│       │   │   └── Analytics.jsx
│       │   │
│       │   ├── hooks/
│       │   │   └── useShipments.js
│       │   │
│       │   ├── utils/
│       │   │   └── riskColor.js
│       │   │
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css
│       │
│       ├── .env
│       ├── package.json
│       └── tailwind.config.js
│
└── backend/ (to be implemented)
```

---

## 👩‍💻 Frontend Responsibilities (Shraddha)

* Dashboard Page (Map + Table + Stats + Alerts)
* Shipment Detail Page
* Core UI Components:

  * Navbar
  * StatCard
  * RiskBadge
  * AlertBanner
  * ShipmentTable
  * ShipmentMap
* Firebase real-time integration

---

## ⚙️ Setup Instructions

### 1. Install dependencies

```
npm install
```

### 2. Run the project

```
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file:

```
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_MAPS_KEY=your_key
VITE_FIREBASE_API_KEY=your_key
```

---

## 🔄 Data Flow

```
Backend → Firebase Firestore → React UI (Real-time updates)
```

---

## 🎯 Features

* 📍 Real-time shipment tracking
* ⚠️ Risk detection (Low / Medium / High)
* 🗺️ Map visualization with markers
* 📊 Analytics dashboard
* 🔄 Simulation of delays

---

## 🚀 Status

Frontend development in progress 🚧
