# Studio21 Booking System

## About

Studio21 Booking System is a web-based booking management platform designed for photography studios and creative service businesses. The system allows clients to conveniently schedule appointments online while enabling administrators to manage bookings, schedules, and service offerings efficiently.

The project was developed as part of the CMSC 186 – SOA and Web Services course and focuses on implementing RESTful APIs, authentication, database integration, and modern web technologies.

---

# Features

## Client Features

* User registration and login
* Book photography sessions online
* Select services such as:

  * Photoshoot Packages
  * Makeup Services
  * Studio Rental
* View booking confirmations
* Track bookings through dashboard
* Secure authentication using Supabase Auth

## Admin Features

* Admin dashboard access
* Manage bookings and schedules
* Block unavailable dates
* Monitor payments and booking records
* Manage services and package variations

---

# Technology Stack

| Category       | Technology            |
| -------------- | --------------------- |
| Frontend       | Next.js / React       |
| Backend        | Node.js               |
| Database       | Supabase (PostgreSQL) |
| Authentication | Supabase Auth         |
| Deployment     | Vercel                |
| Styling        | Tailwind CSS          |

---

# System Architecture

```text
User → Frontend (Next.js) → Node.js API → Supabase Database
```

The system uses a RESTful API architecture where the frontend communicates with backend API routes responsible for processing bookings, validating requests, and storing data in Supabase.

---

# API Features

The project implements RESTful APIs for:

* Creating bookings
* Fetching booking records
* Updating booking information
* Authentication and authorization
* Payment validation
* Availability checking
* Google Maps integration for location and navigation support
* Google Calendar integration for admin scheduling and booking management

External APIs Used:

* Google Maps API
* Google Calendar API
* Supabase API

Example Endpoints:

```http
GET /api/bookings
POST /api/bookings/create
PUT /api/bookings/:id
DELETE /api/bookings/:id
```

---

# Authentication & Authorization

The system uses Supabase Authentication for secure login and registration.

Roles:

* Client
* Admin

Protected routes are implemented to ensure that only authorized users can access administrative functionalities.

---

# Database Design

Main Tables:

* users
* bookings
* services
* packages
* package_variations
* makeup_services
* studio_rental_options
* payments
* admin_blocked_dates

---

# API Testing

API testing was conducted through integrated frontend-backend workflows and validation of Supabase database operations.

The system was tested for:

* Successful booking creation
* Authentication validation
* Error handling
* Database insertion and retrieval
* API response validation

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/studio21-booking-system.git
```

## Install Dependencies

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

---

# Environment Variables

Create a `.env.local` file and configure the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

# Deployment

The system is deployed using Vercel.
Access here: https://studio21-photoshoot-booking-system-tau.vercel.app/

---

# Future Improvements

* Payment gateway integration
* Email notifications
* Calendar synchronization
* AI-based scheduling recommendations
* SMS notifications

---

# Developers
##### Jodell Adlaon
##### Angela Kim Masong
##### Chello Serion
##### Erika Gwynne Torreon




