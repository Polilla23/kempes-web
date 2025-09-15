# Kempes Master League

Kempes Master League is a web application for managing football leagues, clubs, players, and competitions. Built with modern web technologies, this platform provides comprehensive tools for football league management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Management**: Register, login, password recovery, and role-based access control
- **Club Management**: Create and manage football clubs with details and logos
- **Player Management**: Create and manage players with stats and attributes
- **Competition System**: Organize and manage football competitions and seasons
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend

- **React** with TypeScript
- **Tanstack Router** for routing
- **Shadcn UI** components
- **React Hook Form** with Zod for form validation
- **TanStack Table** for data tables

### Backend

- **Node.js** with Fastify
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **PostgreSQL** database
- **JWT** for authentication

## 📁 Project Structure

The project follows a clear separation between frontend and backend:

### Frontend Structure

```
frontend/
├── public/            # Static assets
├── src/
│   ├── assets/        # Application assets
│   ├── components/    # Reusable UI components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and helpers
│   ├── routes/        # Application routes
│   ├── services/      # API service integrations
│   └── types/         # TypeScript type definitions
```

### Backend Structure

```
backend/
├── src/
│   ├── config/        # Application configuration
│   ├── controllers/   # Route controllers
│   ├── errors/        # Custom error classes
│   ├── interfaces/    # TypeScript interfaces
│   ├── middleware/    # Fastify middleware
│   ├── prisma/        # Prisma schema and migrations
│   ├── repositories/  # Data access layer
│   ├── routes/        # API routes
│   ├── schemas/       # Data validation schemas
│   ├── services/      # Business logic
│   ├── templates/     # Email templates
│   └── utils/         # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/kempes-web.git
   cd kempes-web
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with your database connection and other configuration:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/kempesdb"
   JWT_SECRET="your_jwt_secret"
   EMAIL_HOST="smtp.example.com"
   EMAIL_USER="your_email@example.com"
   EMAIL_PASS="your_email_password"
   FRONTEND_URL="http://localhost:5173"
   ```

4. Run Prisma migrations:

   ```bash
   npx prisma migrate dev
   ```

5. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

6. Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=http://localhost:3000
   ```

## 💻 Usage

### Development Mode

Start both frontend and backend simultaneously from the root directory:

```bash
npm run dev
```

This will start:

- Backend server on `http://localhost:3000` (Fastify)
- Frontend development server on `http://localhost:5173` (Vite)

### Individual Services

Alternatively, you can start each service individually:

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:

   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## 📚 API Documentation

The API provides the following main endpoints:

- `/api/auth` - Authentication (login, register, forgot password)
- `/api/users` - User management
- `/api/clubs` - Club management
- `/api/players` - Player management
- `/api/competitions` - Competition management

For detailed API documentation, please refer to the API documentation files in the `backend/src/routes` directory.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2024 Kempes Master League. All rights reserved.
