# LifeLink - Blood Donation Platform (Server)

REST API backend for the LifeLink Blood Donation Platform built with Node.js, Express, and MongoDB.

## Deployment

Deploy on [Vercel](https://vercel.com). See the client README for the full step-by-step guide.

Quick server env on Vercel:

```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_long_random_secret
STRIPE_SECRET_KEY=sk_test_your_key
CLIENT_URL=https://your-client-app.vercel.app
```

After first deploy, seed admin from your computer (with production `MONGODB_URI` in `.env`):

```bash
npm run seed:admin
```

## Live URL
`https://your-server-app.vercel.app` *(add after Vercel deployment)*

## Purpose
Provides secure APIs for user authentication, donation request management, request search, funding via Stripe, and admin operations with JWT-based role access control.

## Key Features
- JWT authentication & authorization
- Role-based access (donor, volunteer, admin)
- User registration, login, profile management
- CRUD operations for blood donation requests
- Search donation requests by blood group and location
- Stripe Checkout Session funding APIs
- Admin user management (block/unblock, role changes)
- Bangladesh divisions, districts & upazilas data API
- Dashboard statistics endpoint

## Admin Credentials (for examiner)

```
Email: admin@lifelink.com
Password: Admin@123
```

Create or update the admin user:

```bash
npm run seed:admin
```

Optional env overrides in `.env`:

```
ADMIN_EMAIL=admin@lifelink.com
ADMIN_PASSWORD=Admin@123
```

## Tech Stack
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Stripe
- CORS

## Environment Variables
Create a `.env` file based on `.env.example`:

```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:5173
```

For production, set `CLIENT_URL` to your deployed frontend URL.

## Getting Started

```bash
npm install
npm run seed:admin
npm run dev
```

## NPM Packages Used
- express, mongoose, cors, dotenv
- jsonwebtoken, bcryptjs
- stripe
- nodemon (dev)

## Client Repository
`https://github.com/MdOnim/blood-donation-client`

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/users/profile | Private |
| PUT | /api/users/profile | Private |
| GET | /api/users/all | Admin |
| PATCH | /api/users/block/:id | Admin |
| PATCH | /api/users/unblock/:id | Admin |
| PATCH | /api/users/make-volunteer/:id | Admin |
| PATCH | /api/users/remove-volunteer/:id | Admin |
| PATCH | /api/users/make-admin/:id | Admin |
| PATCH | /api/users/remove-admin/:id | Admin |
| GET | /api/donations/pending | Public |
| GET | /api/donations/my | Private |
| GET | /api/donations/recent | Private |
| GET | /api/donations/all | Admin/Volunteer |
| GET | /api/donations/:id | Private |
| POST | /api/donations | Private |
| PUT | /api/donations/:id | Private (owner/admin) |
| PATCH | /api/donations/:id/status | Private |
| PATCH | /api/donations/:id/donate | Private |
| DELETE | /api/donations/:id | Private (owner/admin) |
| GET | /api/search/donors | Public |
| GET | /api/stats/dashboard | Admin/Volunteer |
| GET | /api/locations/divisions | Public |
| GET | /api/locations/districts | Public |
| GET | /api/locations/upazilas/:district | Public |
| GET | /api/funding | Private |
| GET | /api/funding/total | Private |
| POST | /api/funding/create-checkout-session | Private |
| POST | /api/funding/confirm | Private |
