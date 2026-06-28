# Todo Application

Full-stack Todo application with a Node.js/Express backend and a React frontend.

## Features

- Create, view, update, and delete todos.
- Persist todos in a local JSON file so data survives server restarts.
- Filter todos by status and priority.
- Search todos by title or description.
- Sort todos by creation date, priority, or status.
- View a dedicated detail page for a single todo using a `todoId` query parameter.
- Edit and delete todos from both the list page and the detail page.

## Project Structure

- `backend/` - Express API and file-based persistence.
- `frontend/` - React app with page navigation and todo management UI.

## Prerequisites

- Node.js 18 or newer.
- npm 9 or newer.

## Setup

Install dependencies in each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run the Backend

```bash
cd backend
npm start
```

The API runs on `http://localhost:5000` by default.

## Run the Frontend

```bash
cd frontend
npm run dev
```

The frontend runs on the Vite dev server, usually `http://localhost:5173`.

## Frontend Pages

- `/` - Todo list page.
- `/todo?todoId=<id>` - Single todo detail page.

## API Overview

See [API.md](API.md) for the complete endpoint reference.

## Frontend Reference

See [FRONTEND.md](FRONTEND.md) for page-level feature documentation.
