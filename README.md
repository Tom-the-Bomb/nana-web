
# NANA Web

Web dashboard for **Nurse Assistant for Neurological Assessment** devices

## Frontend

- **Framework:** React.js + TypeScript + Vite
- **Styling:** TailwindCSS 4
- **Auth:** JWT with localStorage

### Frontend Testing

rename `example.env` to `.env` and fill in required variables

```ps
cd frontend && npm run dev
```

## Backend

- **Webserver:** Flask
- **Data Storage:** MongoDB
- **File Storage:** Cloudflare R2
- **Auth:** bcrypt hashing + salting

### Backend Testing

rename `example.env` to `.env` and fill in required variables

```ps
py -m backend
```
