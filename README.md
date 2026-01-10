# Simple User API

A basic Node.js HTTP server to manage users stored in a JSON file locally without the use of any fancy frameworks.

## What it does?

- Load and save users from `users.json`
- Endpoints:
  - `GET /users` - Get all users
  - `POST /users` - Add a new user (`name` and `email` required)
  - `GET /users/:id` - Get a user by ID
  - `DELETE /users/:id` - Delete a user by ID

## Setup

1. Clone the repository
2. npm install nodemon(if you are changing the code)
3. Start the server:

```bash
(if nodemon installed) nodemon server.js
else node server.js
```
then use api platform like postman or hoppscotch
