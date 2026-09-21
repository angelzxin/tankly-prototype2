# Tankly

Tankly is a fuel-stop optimization tool that predicts fuel prices and determines whether stopping for gas is worth the time and cost.

# Run Locally

1. Clone the repository

git clone git@github.com:angelzxin/tankly-prototype2.git
cd tankly-prototype2

2. Install dependencies

npm install

3. Run the app

npm run dev

Open the local URL shown in Terminal (usually http://localhost:5173).

# Production Build

npm run build

How It Works

Trip + Fuel Data
       ↓
Fuel Price Prediction
       ↓
Decision Engine
       ↓
ADD_STOP / NO_ACTION
       ↓
Google Maps Routing

Tankly compares potential fuel savings against detour time, driver labor cost, vehicle cost, and expected future fuel prices.

# Update & Deploy

git add .
git commit -m "Update Tankly"
git push origin main

Vercel automatically redeploys the latest version from main.

# Tech Stack

React · TypeScript · Vite · Fuel Price Forecasting · Google Maps · Vercel

# Live Prototype

https://tankly-prototype.vercel.app/
