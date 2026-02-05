# My Custom Blog - CRUD Blog Web Application

A full-stack blogging platform built with PostgreSQL, Express, Node.js, and EJS templating.

## Features

- **Article Creation**: Users can create new blog articles with subject, title, and content fields
- **Article Viewing**: Homepage displays all published articles with automatic timestamps
- **Article Editing**: Full edit functionality allows users to modify existing articles
- **Article Deletion**: Remove articles with confirmation dialog for safety
- **PostgreSQL Database**: Robust data persistence with relational database
- **Responsive Design**: Mobile-friendly interface that works across all devices
- **Email Contact Form**: Integrated contact system using Nodemailer
- **Published Date Tracking**: Automatic timestamp for when articles are published
- **Health Check Endpoint**: `/health` route for monitoring application status
- **RESTful API Structure**: Clean route organization following REST principles

## Recent Additions

- ✅ Renamed blog routes from `/posts` to `/articles` for better semantic clarity
- ✅ Added `published_at` timestamp field to track article publication dates
- ✅ Implemented `/health` endpoint for application health monitoring
- ✅ Updated branding to "My Custom Blog" throughout the application

## Technologies Used

- **Node.js**: JavaScript runtime for server-side execution
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database for data storage
- **EJS**: Templating engine for dynamic HTML generation
- **Nodemailer**: Email functionality for contact form
- **Bootstrap**: Responsive CSS framework
- **Lodash**: Utility library for data manipulation

## Installation Guide

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your PostgreSQL credentials:
```
   DB_USER=your_username
   DB_HOST=localhost
   DB_DATABASE=blog_db
   DB_PASSWORD=your_password
   DB_PORT=5432
```
4. Run the SQL schema from `queries.sql` to set up the database
5. Start the server: `npm start`
6. Access the application at `http://localhost:3000`

## API Endpoints

- `GET /` - Homepage with all articles
- `GET /articles/:articleName` - View single article
- `GET /compose` - Create new article form
- `POST /compose` - Submit new article
- `GET /edit/:articleName` - Edit article form
- `POST /edit/:articleName` - Update article
- `GET /delete/:articleName` - Delete article
- `GET /about` - About page
- `GET /contact` - Contact page
- `POST /contact` - Submit contact form
- `GET /health` - Health check endpoint
