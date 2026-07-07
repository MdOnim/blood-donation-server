# LifeLink - Blood Donation Platform (Server)

REST API backend for the LifeLink Blood Donation Platform built with Node.js, Express, and MongoDB.

## Live URL
`https://your-server-url.onrender.com` *(update after deployment)*

## Purpose
Provides secure APIs for user authentication, donation request management, donor search, funding via Stripe, and admin operations with JWT-based role access control.

## Key Features
- JWT authentication & authorization
- Role-based access (donor, volunteer, admin)
- User registration, login, profile management
- CRUD operations for blood donation requests
- Donor search by blood group and location
- Stripe payment intent for funding
- Admin user management (block/unblock, role changes)
- Bangladesh districts & upazilas data API
- Dashboard statistics endpoint

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

## Getting Started

```bash
npm install
npm run dev
```

## Make a User Admin
After registering, update the user role to `admin` directly in MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
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
| GET | /api/donations/pending | Public |
| GET | /api/donations/my | Private |
| POST | /api/donations | Private |
| GET | /api/search/donors | Public |
| GET | /api/locations/districts | Public |
| GET | /api/funding | Private |
| POST | /api/funding/create-payment-intent | Private |
