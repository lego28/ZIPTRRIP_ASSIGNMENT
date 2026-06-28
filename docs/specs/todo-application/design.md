# Design Document — Todo Application

## Overview

A full-stack Todo Application with a Node.js/Express REST API backend and a React single-page frontend. The backend persists data in a local JSON file and exposes a RESTful API. The frontend is a multi-page React app (via React Router v6) that communicates with the API through a dedicated service module. No global state library is used; each page manages its own state with `useState` and `useEffect`.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Backend runtime | Node.js | LTS |
| Backend framework | Express | 4.18.2 |
| ID generation | uuid | 9.0.0 |
| CORS middleware | cors | 2.8.5 |
| Dev server (backend) | nodemon | 3.0.1 |
| Frontend bundler | Vite | 5.0.8 |
| Frontend framework | React | 18.2.0 |
| Client-side routing | React Router DOM | 6.21.1 |

---

## Project Structure

```
/
├── backend/
│   ├── data/
│   │   └── todos.json          # File-based data store
│   ├── src/
│   │   ├── controllers/
│   │   │   └── todoController.js   # Route handler logic + validation helpers
│   │   ├── data/
│   │   │   └── store.js            # readTodos() / writeTodos() helpers
│   │   ├── middleware/
│   │   │   └── errorHandler.js     # Global error-handling middleware
│   │   ├── routes/
│   │   │   └── todos.js            # Express Router — maps paths to controllers
│   │   └── index.js                # App bootstrap, middleware registration, server start
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── src/
    │   ├── api/
    │   │   └── todos.js            # Fetch-based API service module
    │   ├── components/
    │   │   ├── ConfirmDialog.jsx
    │   │   ├── EditTodoModal.jsx
    │   │   ├── FilterBar.jsx
    │   │   ├── SortBar.jsx
    │   │   ├── TodoCard.jsx
    │   │   └── TodoForm.jsx
    │   ├── pages/
    │   │   ├── TodosListPage.jsx
    │   │   └── TodoDetailPage.jsx
    │   ├── styles/
    │   │   ├── global.css
    │   │   ├── TodosListPage.css
    │   │   └── TodoDetailPage.css
    │   ├── App.jsx                 # BrowserRouter + route declarations
    │   └── main.jsx                # React DOM entry point
    └── package.json
```


---

## Data Model

### Todo Object

```json
{
  "id":          "string  — UUID v4, assigned at creation",
  "title":       "string  — 1–200 characters, trimmed",
  "description": "string  — 0–500 characters (empty string when omitted)",
  "status":      "'pending' | 'in-progress' | 'completed'",
  "priority":    "'low' | 'medium' | 'high'",
  "createdAt":   "string  — ISO 8601 timestamp, set at creation",
  "updatedAt":   "string | null  — ISO 8601 timestamp, null until first update"
}
```

### Field Constraints

| Field | Create default | Mutable | Constraint |
|---|---|---|---|
| `id` | `uuidv4()` | No | UUID v4 |
| `title` | — (required) | Yes | 1–200 chars, trimmed |
| `description` | `""` | Yes | 0–500 chars |
| `status` | `"pending"` | Yes | `pending`, `in-progress`, `completed` |
| `priority` | `"medium"` | Yes | `low`, `medium`, `high` |
| `createdAt` | `new Date().toISOString()` | No | ISO 8601 |
| `updatedAt` | `null` | Auto | Set on every successful PUT |

---

## Backend Design

... (same content as original design.md)
