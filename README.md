# Tankly

B2B fleet fuel-stop prototype.

## Run

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## Data source

`VITE_DATA_SOURCE=mock` uses the built-in stations in `src/data/mockStations.ts`.

`VITE_DATA_SOURCE=live` fetches nearby stations and prices from the fuel API in `.env`:

- `VITE_FUEL_PRICE_API_KEY`
- `VITE_FUEL_PRICE_API_BASE_URL`

Dev requests go through `/api/fuel-live` so the browser does not hit CORS. Detour miles/minutes are estimated from straight-line distance until a routing API is wired.
