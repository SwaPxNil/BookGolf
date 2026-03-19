# Golf Booking & Management System Backend

This is a production-ready backend for a Golf Booking & Management System, built with Node.js, Express.js, and MongoDB (Mongoose ODM). It includes JWT authentication, role-based access control, and a clean MVC + service architecture.

## Features

- User authentication (register, login, 2FA, refresh token)
- Role-based access control (USER, COURSE_ADMIN, SUPER_ADMIN)
- CRUD operations for Courses, Coaches, Caddies
- Tee Time booking with atomic operations to prevent double booking
- Coach lesson booking and cancellation
- Caddie booking and cancellation
- Game history tracking
- Handicap calculation
- Admin functionalities for managing coaches, caddies, and approving/rejecting courses
- Super Admin functionalities for managing course admins and viewing system logs
- Central error handling
- Input validation using Joi
- Environment variable management with `dotenv`

## Technologies Used

- Node.js (Latest LTS)
- Express.js
- MongoDB Atlas (Mongoose ODM)
- JSON Web Token (JWT)
- bcrypt (for password hashing)
- speakeasy (for 2FA secret generation)
- Nodemailer (for mock 2FA email service)
- Joi (for input validation)
- uuid (for UUID generation)
- dotenv (for environment variables)

## Project Structure

```
.
├── controllers
├── middlewares
├── models
├── routes
├── services
├── utils
│   ├── config
│   ├── validators
│   ├── auth.js
│   └── twoFactorAuth.js
├── .env.example
├── index.js
├── package.json
└── README.md
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository_url>
cd FYPBackend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory of the project, based on the `.env.example` file.

```ini
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/golf_booking_db?retryWrites=true&w=majority

JWT_SECRET=supersecretjwtkey
JWT_ACCESS_TOKEN_EXPIRATION=1h
JWT_REFRESH_TOKEN_EXPIRATION=7d

EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

TWO_FACTOR_SECRET=verylongrandomsecretfor2fa
TWO_FACTOR_EXPIRATION_MINUTES=10
TWO_FACTOR_LENGTH=6
```

-   **`PORT`**: The port your server will run on.
-   **`NODE_ENV`**: Set to `development` or `production`.
-   **`MONGODB_URI`**: Your MongoDB Atlas connection string. Make sure to replace `<username>`, `<password>`, and `<cluster0.abcde.mongodb.net>` with your actual database credentials and cluster details.
-   **`JWT_SECRET`**: A strong, random string for signing JWT tokens.
-   **`JWT_ACCESS_TOKEN_EXPIRATION`**: Expiration time for access tokens (e.g., `1h`, `15m`).
-   **`JWT_REFRESH_TOKEN_EXPIRATION`**: Expiration time for refresh tokens (e.g., `7d`, `30d`).
-   **`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`**: SMTP settings for sending 2FA emails. During development, you can use Ethereal Email for testing.
-   **`TWO_FACTOR_SECRET`**: A strong, random string for 2FA secrets.

### 4. Running the Application

To run the application in development mode with `nodemon`:

```bash
npm run start:dev
```

To run the application in production mode:

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

(This section will be populated with a Postman collection export)

## Roles

-   **USER**: Standard user, can book tee times, coaches, caddies, view their rounds and payments, calculate handicap.
-   **COURSE_ADMIN**: Can manage (CRUD) coaches and caddies.
-   **SUPER_ADMIN**: Can manage course admins, approve/reject courses, and view admin logs.

## Important Notes

-   UUIDs are used for all IDs.
-   2FA email is currently mocked using Nodemailer with Ethereal Email for testing purposes.
-   Tee Time booking uses MongoDB transactions to prevent double booking.
-   Handicap calculation logic is a simplified example.
