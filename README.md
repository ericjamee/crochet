# Crochet Mail Club

Frontend:
- React + TypeScript + Vite
- Tailwind CSS

Backend:
- .NET 8 minimal API prepared for Render deployment with a Docker-based service

## Run the frontend

```bash
npm install
npm run dev
```

## Build the frontend

```bash
npm run build
```

## Run the backend

```bash
cd backend/CrochetMailClub.Api
dotnet run
```

The backend runs on `http://localhost:5078` in local development.

## Connect the frontend to the backend

Create a `.env` file at the project root:

```bash
VITE_API_BASE_URL=http://localhost:5078
```

If `VITE_API_BASE_URL` is not set or the API is unavailable, the waitlist form gracefully falls back to local browser storage.

## Deploy the backend to Render

- A Render Blueprint file lives at `/render.yaml`
- The API deploys from `backend/CrochetMailClub.Api/Dockerfile`
- Set `CORS_ALLOWED_ORIGINS` in Render to your frontend domain, for example:

```bash
https://your-vercel-site.vercel.app
```

- After Render gives you a backend URL, set `VITE_API_BASE_URL` in Vercel to that API base URL
- The API health endpoint is `/health`

## Notes

- The waitlist form now posts to the backend when `VITE_API_BASE_URL` is configured and falls back to `localStorage` if it is not.
- The backend currently keeps waitlist entries in memory, which is fine for a first deployment but not durable.
- Stripe is not connected yet; there are TODO comments where checkout and launch flow should hook in later.
