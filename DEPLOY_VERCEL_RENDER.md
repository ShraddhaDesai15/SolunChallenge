# Deploy on Vercel + Render

## Architecture

- Frontend: Vercel
- Backend API: Render web service from `Backend`
- ML service: Render web service from `Backend/ml_service`

## 1. Deploy the ML service on Render

Create a new Blueprint on Render and point it to this repo, or create a web service manually.

If you use the included `render.yaml`, Render will create:

- `solun-backend-api`
- `solun-ml-service`

For the ML service:

- Root directory: `Backend/ml_service`
- Build command: `pip install -r requirements.txt && python train_model.py`
- Start command: `python app.py`

After deploy, copy the ML public URL.

Example:

```text
https://solun-ml-service.onrender.com
```

## 2. Deploy the backend API on Render

For the API service:

- Root directory: `Backend`
- Build command: `npm install`
- Start command: `node server.js`

Set these environment variables in Render:

```text
ML_SERVICE_URL=https://your-ml-service.onrender.com
CORS_ORIGIN=https://your-vercel-app.vercel.app
OPENWEATHER_API_KEY=...
GEMINI_API_KEY=...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

If you later add a custom frontend domain, append it to `CORS_ORIGIN` as a comma-separated list.

Example:

```text
CORS_ORIGIN=https://your-vercel-app.vercel.app,https://www.yourdomain.com
```

## 3. Deploy the frontend on Vercel

Import the repo into Vercel and configure:

- Framework preset: `Vite`
- Root directory: `Frontend/my-app`
- Build command: `npm run build`
- Output directory: `dist`

Set these environment variables in Vercel:

```text
VITE_API_BASE_URL=https://your-backend-api.onrender.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 4. Redeploy the backend after Vercel gives you the frontend URL

Once Vercel gives you the final frontend URL, update Render:

```text
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

Then redeploy the backend API service.

## 5. Health checks

After deployment, test:

- Backend health or route access from the frontend
- ML service:

```text
https://your-ml-service.onrender.com/health
```

## Notes

- Render free web services can sleep after inactivity, so the first request may be slow.
- The frontend now reads `VITE_API_BASE_URL`.
- The backend now reads `ML_SERVICE_URL`, `PORT`, and `CORS_ORIGIN`.
- The ML service now reads `PORT` and `FLASK_DEBUG`.
