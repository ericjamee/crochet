# Crochet Mail Club

Frontend:
- React + TypeScript + Vite
- Tailwind CSS

Backend:
- .NET 8 minimal API placeholder for future waitlist capture and Stripe integration

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

## Notes

- The waitlist form currently stores submissions in `localStorage` as a graceful placeholder.
- The backend includes a stub `/api/waitlist` endpoint for future hookup.
- Stripe is not connected yet; there are TODO comments in both frontend and backend where that integration should go.
