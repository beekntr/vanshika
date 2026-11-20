# Backend Practical – Library Book API & Student Portal

**Register No:** `RegisterNo` &nbsp;|&nbsp; **Name:** `Name`

Two REST APIs built with **Node.js, Express and MongoDB (Mongoose)**:

| File | Task | What it does |
|------|------|--------------|
| `file/A1.js` | Task 1 – Library Book Management API | Starts the book CRUD API on **http://localhost:3000** |
| `file/A2.js` | Task 2 – Student Portal with Login | Starts the JWT login portal on **http://localhost:4000** |
| `file/A3.js` | Both tasks | Calls every endpoint and prints the status code received vs expected |

---

## Folder structure

```
backend_Practical_RegisterNo_Name/
├── file/
│   ├── A1.js                     # Task 1 entry point
│   ├── A2.js                     # Task 2 entry point
│   ├── A3.js                     # automatic test run of all endpoints
│   ├── task1-library-api/
│   │   ├── server.js             # express app, MongoDB connection, port 3000
│   │   ├── models/Book.js
│   │   ├── routes/bookRoutes.js
│   │   ├── controllers/bookController.js
│   │   └── middleware/
│   │       ├── logger.js         # prints method + URL of each request
│   │       ├── validateObjectId.js
│   │       └── errorHandler.js   # 404 + error-handling middleware
│   ├── task2-student-portal/
│   │   ├── server.js             # helmet, cors, rate limit, routes
│   │   ├── models/User.js        # bcrypt hashing in pre('save')
│   │   ├── validators/authValidator.js   # Joi rules
│   │   ├── routes/authRoutes.js  # /register, /login
│   │   ├── routes/userRoutes.js  # /profile, /students
│   │   ├── controllers/authController.js
│   │   ├── controllers/userController.js
│   │   └── middleware/
│   │       ├── authMiddleware.js # JWT check -> 401
│   │       ├── roleMiddleware.js # admin only -> 403
│   │       ├── validate.js
│   │       ├── logger.js
│   │       └── errorHandler.js
│   ├── postman_collection.json   # import into Postman for the screenshots
│   ├── package.json
│   └── .env.example
├── outputs/
│   ├── A1.png
│   ├── A2.png
│   └── A3.png
└── README.md
```

---

## Setup

**Requirements:** Node.js 18 or newer, MongoDB running locally (MongoDB Community Server) or a MongoDB Atlas URL, MongoDB Compass, Postman or Thunder Client.

```bash
cd file
npm install                 # installs express, mongoose, dotenv, bcryptjs, jsonwebtoken, joi, helmet, cors, express-rate-limit
copy .env.example .env      # Windows   (macOS/Linux: cp .env.example .env)
```

`.env` (the MongoDB URLs are kept here, not in the code):

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/library_db

PORTAL_PORT=4000
PORTAL_MONGO_URI=mongodb://127.0.0.1:27017/student_portal
JWT_SECRET=replace_with_a_long_random_string
```

> Using MongoDB Atlas? Replace both URLs with your `mongodb+srv://...` connection string (change the database name at the end).

## Run

Open three terminals inside `file/`:

```bash
node A1.js      # Task 1 -> http://localhost:3000
node A2.js      # Task 2 -> http://localhost:4000
node A3.js      # runs every request against both servers and prints PASS/FAIL
```

(`npm run task1`, `npm run task2` and `npm run test:api` do the same.)

---

## Task 1 – Library Book Management API

**Book model:** `title` (String, required), `author` (String, required), `price` (Number, min 1), `category` (String), `isAvailable` (Boolean, default `true`).

| Method | Endpoint | Description | Success | Errors |
|--------|----------|-------------|---------|--------|
| POST | `/books` | Add a book | 201 | 400 invalid input |
| GET | `/books` | List all books | 200 | – |
| GET | `/books/:id` | Get one book | 200 | 400 bad id, 404 not found |
| PUT | `/books/:id` | Update a book | 200 | 400 invalid input / bad id, 404 not found |
| DELETE | `/books/:id` | Delete a book | 200 | 400 bad id, 404 not found |

Example – `POST /books`

```json
{ "title": "Clean Code", "author": "Robert C. Martin", "price": 650, "category": "Software Engineering" }
```

Response `201`:

```json
{
  "success": true,
  "message": "Book added successfully",
  "data": { "_id": "…", "title": "Clean Code", "author": "Robert C. Martin", "price": 650,
            "category": "Software Engineering", "isAvailable": true, "createdAt": "…", "updatedAt": "…" }
}
```

- **Logger middleware** prints every request: `[2026-11-20T15:30:12.345Z] POST /books -> 201 (12 ms)`
- **Error-handling middleware** turns Mongoose validation errors, wrong data types and broken JSON into `400`, unknown routes into `404`, and anything unexpected into `500`.

## Task 2 – Student Portal

| Method | Endpoint | Access | Success | Errors |
|--------|----------|--------|---------|--------|
| POST | `/register` | Public | 201 | 400 invalid input, 409 duplicate email |
| POST | `/login` | Public | 200 + JWT (1 hour) | 400 invalid input, 401 wrong email/password |
| GET | `/profile` | Any logged-in user | 200 (no password) | 401 missing/invalid token |
| GET | `/students` | Admin only | 200 (no passwords) | 401 no token, 403 not an admin |

- **Validation (Joi):** valid email format, password at least 6 characters, `role` must be `student` or `admin` (default `student`).
- **Password hashing:** bcrypt (`bcryptjs`, 10 salt rounds) in the User model's `pre('save')` hook. The password field has `select: false` and is removed from every JSON response.
- **JWT:** `POST /login` returns a token signed with `JWT_SECRET`, `expiresIn: '1h'`. Send it as
  `Authorization: Bearer <token>`.
- **authMiddleware:** no token / wrong format / bad signature / expired → `401`.
- **authorizeRoles('admin'):** logged-in but not admin → `403`.
- **Security:** `helmet()` (secure headers), `cors()`, `express-rate-limit` (100 requests per 15 minutes per IP → `429`), JSON body limit 10 kb.

Example – `POST /login`

```json
{ "email": "rahul@college.edu", "password": "student123" }
```

Response `200`:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…",
  "expiresIn": "1h",
  "data": { "_id": "…", "name": "Rahul Sharma", "email": "rahul@college.edu", "role": "student" }
}
```

---

## Output screenshots

| Screenshot | Shows |
|------------|-------|
| `outputs/A1.png` | Task 1 – `node A1.js` running (MongoDB connected, server on 3000, logger lines) |
| `outputs/A2.png` | Task 2 – `node A2.js` running (MongoDB connected, server on 4000, logger lines) |
| `outputs/A3.png` | `node A3.js` – every endpoint of both tasks with received vs expected status codes |

![A1 – Task 1 output](outputs/A1.png)
![A2 – Task 2 output](outputs/A2.png)
![A3 – API test run](outputs/A3.png)

**Postman screenshots asked for in the tasks:** import `file/postman_collection.json` into Postman (*Import → File*), then run the requests top to bottom – the book id and both tokens are saved automatically. (Running the collection a second time? Register returns 409 for the same emails – that is the duplicate check working. Change the emails, or drop the `student_portal` database in Compass, to get 201 again.) Save extra screenshots in `outputs/` as well:

- Task 1: each of the 5 CRUD requests + the `library_db.books` collection in **MongoDB Compass**
- Task 2: register, login, `/profile` without token (401) and with token (200), `/students` as admin (200) and as student (403)

---

## Upload to GitHub

1. Rename the folders, replacing `RegisterNo` and `Name` with your own details.
2. Create a new **Public** repository on GitHub.
3. From inside `backend_Practical_RegisterNo_Name/`:

```bash
git init
git add .
git commit -m "Backend practical: library API and student portal"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

`node_modules/` and `.env` are excluded by `.gitignore` – the repo carries `.env.example` instead. If you upload through the GitHub website, delete `node_modules/` first.
