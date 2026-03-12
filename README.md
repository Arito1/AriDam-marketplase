# AriDam Marketplace

This project was built for the midterm assignment **Create a Marketplace**.

## Stack
- **Frontend:** Next.js
- **Backend:** Pure Node.js using the `http` module
- **Database:** JSON files

## Project structure

```text
hipsage-marketplace/
  backend/
    database/
      users.json
      products.json
      purchases.json
    lib/
      auth.js
      db.js
      http.js
    server.js
  frontend/
    app/
    components/
    lib/
```

## Features
- Register and login
- Password hashing
- Create, edit, and delete products
- View all products
- View a single product
- Buy products
- Quantity decreases after purchase
- Add comments and ratings
- Average rating is calculated automatically
- View purchase history

## How to run

### 1. Start backend
Open terminal in `backend`:

```bash
npm install
npm run dev
```

Backend will run on:
```bash
http://localhost:4000
```

### 2. Start frontend
Open another terminal in `frontend`:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Frontend will run on:
```bash
http://localhost:3000
```

## API routes

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /me`

### Products
- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`

### Comments and ratings
- `POST /products/:id/comments`

### Buying
- `POST /products/:id/buy`

### Purchase history
- `GET /history`

## JSON database files

### users.json
Stores user accounts:
- id
- username
- passwordHash
- createdAt

### products.json
Stores products:
- id
- name
- description
- price
- image
- quantity
- sellerId
- sellerUsername
- createdAt
- updatedAt
- comments

### purchases.json
Stores purchases:
- id
- userId
- productId
- productName
- price
- purchaseDate

## Notes for presentation
- The backend uses only built-in Node.js modules.
- Passwords are hashed before saving.
- Authentication uses Bearer token.
- All data is persisted in JSON files.
- Product owner can edit and delete only their own products.
- When a user buys a product, quantity is reduced and purchase history is saved.
