# Backend Activity Tracker

This is the backend part of the MERN Activity Tracker project, which includes user registration, login functionality, and activity logging.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd mern-activity-tracker/backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Set up your MongoDB database and update the connection string in `src/utils/db.js`.

5. Start the server:
   ```
   npm start
   ```

## Usage

- **User Registration**: Users can register by sending a POST request to `/api/users/register` with their details.
- **User Login**: Users can log in by sending a POST request to `/api/users/login` with their credentials.
- **Log Activities**: Users can log their daily activities by sending a POST request to `/api/activities` with the activity details.
- **Retrieve Activities**: Users can retrieve their activities by sending a GET request to `/api/activities?date=<date>`.

## API Endpoints

- `POST /api/users/register`: Register a new user.
- `POST /api/users/login`: Log in an existing user.
- `POST /api/activities`: Log a new activity.
- `GET /api/activities`: Retrieve activities by date.

## License

This project is licensed under the MIT License.