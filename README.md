# MERN Activity Tracker

## Overview
The MERN Activity Tracker is a full-stack application built using MongoDB, Express, React, and Node.js. This application allows users to register, log in, and track their daily activities. An admin panel is also included for viewing user data.

## Features
- User registration and login functionality
- Admin panel for viewing user activity data
- Users can log daily activities with explanations
- Search functionality to retrieve activities by date

## Project Structure
```
mern-activity-tracker
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── routes
│   │   ├── utils
│   │   └── app.js
│   ├── package.json
│   └── README.md
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

## Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the React application:
   ```
   npm start
   ```

## API Endpoints
- **User Registration**: `POST /api/users/register`
- **User Login**: `POST /api/users/login`
- **Add Activity**: `POST /api/activities`
- **Get Activities by Date**: `GET /api/activities/:date`
- **Get All Activities**: `GET /api/activities`

## License
This project is licensed under the MIT License.