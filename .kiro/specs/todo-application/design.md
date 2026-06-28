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

### Entry Point — `src/index.js`

Bootstraps the Express application in the following order:

1. `cors()` — enables cross-origin requests from any origin.
2. `express.json()` — parses JSON bodies; throws `entity.parse.failed` on malformed JSON, caught by the error handler.
3. `app.use('/api/todos', todoRoutes)` — mounts all Todo routes.
4. 404 catch-all — any unmatched route returns `{ error: 'Route not found' }`.
5. `errorHandler` — must be registered last so it catches errors from all routes.

Server listens on `process.env.PORT` or `5000`.

### Data Store — `src/data/store.js`

Provides two synchronous functions that wrap Node's `fs` module:

```
readTodos() → Todo[]
  - Reads backend/data/todos.json synchronously.
  - Returns [] if the file is missing (ENOENT) or contains invalid JSON.
  - Logs a descriptive error to console.error on failure.

writeTodos(todos: Todo[]) → void
  - Writes the full array to backend/data/todos.json synchronously (pretty-printed, 2-space indent).
  - Throws on write failure; the caller's try/catch forwards it to next(err).
```

The file path is resolved with `path.resolve(__dirname, '..', '..', 'data', 'todos.json')` so it remains correct regardless of the process working directory.

### Validation Helpers — `src/controllers/todoController.js`

Pure functions that return an error string or `null`:

| Helper | Checks |
|---|---|
| `validateTitle(title)` | Required, non-empty after trim, ≤ 200 chars |
| `validateDescription(description)` | Only when provided — ≤ 500 chars |
| `validateStatus(status)` | Must be one of `VALID_STATUSES` |
| `validatePriority(priority)` | Must be one of `VALID_PRIORITIES` |

### Global Error Middleware — `src/middleware/errorHandler.js`

Four-argument Express middleware `(err, req, res, next)`:

- `err.type === 'entity.parse.failed'` or `err.status === 400` → HTTP 400 `{ error: 'Invalid JSON in request body' }`.
- All other errors → HTTP 500 `{ error: 'Internal server error' }` + `console.error` of the full error.


---

## API Contract

Base URL: `http://localhost:5000/api`

All responses use `Content-Type: application/json`. Error bodies always take the shape `{ "error": "<message>" }`. A successful delete returns `{ "message": "Todo deleted successfully" }`.

### GET /api/todos

Returns all todos as a JSON array.

**Response 200**
```json
[
  {
    "id": "a1b2c3d4-...",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending",
    "priority": "medium",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": null
  }
]
```

Returns `[]` when no todos exist.

---

### POST /api/todos

Creates a new todo.

**Request body**
```json
{
  "title": "string (required, 1–200 chars)",
  "description": "string (optional, ≤ 500 chars)",
  "priority": "low | medium | high (optional, default: medium)"
}
```

**Response 201** — full todo object including generated `id`, `createdAt`, `status: "pending"`, and `updatedAt: null`.

**Response 400** — validation failure, e.g.:
```json
{ "error": "Title is required and cannot be empty." }
{ "error": "Title must not exceed 200 characters." }
{ "error": "Description must not exceed 500 characters." }
{ "error": "Priority must be one of: low, medium, high." }
```

---

### GET /api/todos/:id

Returns a single todo by UUID.

**Response 200** — full todo object.
**Response 404** — `{ "error": "Todo not found" }`.

---

### PUT /api/todos/:id

Partially updates an existing todo. Only fields present in the request body are modified; omitted fields retain their current values. `updatedAt` is always set to `new Date().toISOString()` on success.

**Request body** (all fields optional)
```json
{
  "title": "string (1–200 chars)",
  "description": "string (≤ 500 chars)",
  "status": "pending | in-progress | completed",
  "priority": "low | medium | high"
}
```

**Response 200** — full updated todo object.
**Response 400** — validation failure (same error shapes as POST).
**Response 404** — `{ "error": "Todo not found" }`.

---

### DELETE /api/todos/:id

Removes a todo from the data store.

**Response 200**
```json
{ "message": "Todo deleted successfully" }
```
**Response 404** — `{ "error": "Todo not found" }`.


---

## Frontend Design

### Routing — `App.jsx`

```
BrowserRouter
  Routes
    /          → TodosListPage
    /todo      → TodoDetailPage  (reads ?todoId= from query string)
    *          → <Navigate to="/" replace />   (404 fallback)
```

### API Service Module — `src/api/todos.js`

All network communication is centralised here. Each function uses the native `fetch` API, checks `res.ok`, and throws an `Error` with a `.status` property on failure so callers can distinguish 404 from other errors.

| Export | Method | Path | Returns |
|---|---|---|---|
| `fetchTodos()` | GET | `/api/todos` | `Promise<Todo[]>` |
| `fetchTodoById(id)` | GET | `/api/todos/:id` | `Promise<Todo>` |
| `createTodo(data)` | POST | `/api/todos` | `Promise<Todo>` |
| `updateTodo(id, data)` | PUT | `/api/todos/:id` | `Promise<Todo>` |
| `deleteTodo(id)` | DELETE | `/api/todos/:id` | `Promise<{message}>` |

`fetchTodoById` attaches `err.status = 404` so pages can distinguish "not found" from a network error and render accordingly.


---

## Component Breakdown

### Page: TodosListPage (`/`)

**State**

| Variable | Type | Purpose |
|---|---|---|
| `todos` | `Todo[]` | Master list fetched from the API |
| `loading` | `boolean` | True while the initial fetch is in flight |
| `fetchError` | `string` | Non-empty when the initial fetch fails |
| `filters` | `{ status, priority, search }` | Active filter values |
| `sort` | `{ sortBy, sortDir }` | Active sort criterion and direction |
| `editingTodo` | `Todo \| null` | Todo currently open in the edit modal |
| `deletingTodo` | `Todo \| null` | Todo awaiting deletion confirmation |
| `deleteError` | `string` | Error from a failed delete request |

**Derived state (useMemo)**

`displayedTodos` — result of applying `applyFilters()` then `applySort()` to the `todos` array. Recomputes whenever `todos`, `filters`, or `sort` change.

**Filter logic (`applyFilters`)**
- Status filter: skip todos where `todo.status !== filters.status` (unless `'all'`).
- Priority filter: skip todos where `todo.priority !== filters.priority` (unless `'all'`).
- Search filter: case-insensitive substring match against `todo.title` and `todo.description`; applied on every keystroke (AND logic with other filters).

**Sort logic (`applySort`)**
- `createdAt`: numeric date comparison, reversed when `sortDir === 'desc'`.
- `priority`: uses `PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }`; `asc` = low → high (inverted map), `desc` = high → low.
- `status`: uses `STATUS_ORDER = { pending: 0, 'in-progress': 1, completed: 2 }`; direction controls not shown for status sort.

**Default state**
- Filters: all `'all'`, search `''`.
- Sort: `sortBy: 'createdAt'`, `sortDir: 'desc'` (newest first).

**Data flow**
1. On mount, `useEffect` calls `fetchTodos()` and populates `todos`. A cancellation flag prevents state updates after unmount.
2. `handleCreated(newTodo)` — prepends the new todo to `todos` (no re-fetch needed).
3. `handleUpdated(updatedTodo)` — replaces the matching entry in `todos` by id and closes the edit modal.
4. `handleDeleteConfirm()` — calls `deleteTodo(id)`, then filters the deleted todo out of `todos`.

**Rendered sub-components**

```
TodosListPage
  ├── TodoForm              (create form)
  ├── FilterBar             (status/priority/search)
  ├── SortBar               (sortBy + direction)
  ├── TodoCard[]            (one per displayedTodo)
  ├── EditTodoModal         (conditionally, when editingTodo != null)
  └── ConfirmDialog         (conditionally, when deletingTodo != null)
```


---

### Page: TodoDetailPage (`/todo?todoId=<id>`)

**State**

| Variable | Type | Purpose |
|---|---|---|
| `todo` | `Todo \| null` | The loaded todo object |
| `loading` | `boolean` | True while the fetch is in flight |
| `fetchError` | `string` | Non-empty on fetch failure (non-404) |
| `notFound` | `boolean` | True when the API returned 404 |
| `showEdit` | `boolean` | Controls the edit modal |
| `showDeleteConfirm` | `boolean` | Controls the delete confirmation dialog |
| `deleteError` | `string` | Error from a failed delete request |

**Query param handling**

`todoId` is read with `useSearchParams()`. If absent, the page renders an error immediately without fetching.

**Data flow**
1. On mount (or when `todoId` changes), `useEffect` calls `fetchTodoById(todoId)`.
2. On 404 (`err.status === 404`), sets `notFound = true`.
3. On other errors, sets `fetchError`.
4. `handleUpdated(updated)` — replaces `todo` in local state and closes the edit modal.
5. `handleDeleteConfirm()` — calls `deleteTodo(todo.id)`, then navigates to `/` on success.

**Render states (exclusive, checked in order)**

| Condition | Rendered output |
|---|---|
| `!todoId` | Error: "Missing todo ID…" + back button |
| `loading` | Spinner + back button |
| `notFound` | Error: "Todo not found…" + back button |
| `fetchError` | Error: `fetchError` message + back button |
| `todo` loaded | Full detail card |

**Rendered sub-components**

```
TodoDetailPage
  ├── EditTodoModal     (conditionally, when showEdit)
  └── ConfirmDialog     (conditionally, when showDeleteConfirm)
```


---

### Component: TodoForm

**Props:** `onCreated(todo)` — called with the API response after successful creation.

**State:** `form { title, description, priority }`, `errors {}`, `submitting`, `apiError`.

**Behaviour:**
- Client-side validation runs before any API call; field errors are cleared per-field on change.
- On submit: trims title; omits `description` from the payload when empty; sends `priority`.
- On success: resets form to defaults, calls `onCreated(created)`.
- On API error: displays the error message above the form without clearing field values.

**Default values:** `title: ''`, `description: ''`, `priority: 'medium'`.

---

### Component: EditTodoModal

**Props:** `todo`, `onUpdated(todo)`, `onClose()`.

**State:** `form { title, description, status, priority }` (pre-populated from `todo`), `errors {}`, `submitting`, `apiError`.

**Behaviour:**
- Renders as a modal overlay (backdrop click or Escape key → `onClose`).
- Sends all four editable fields in the PUT payload (not a sparse update from the modal's perspective; the API handles partial application server-side).
- On success: calls `onUpdated(updatedTodo)`.

---

### Component: ConfirmDialog

**Props:** `title`, `message`, `confirmLabel`, `confirmClass`, `onConfirm()`, `onCancel()`.

**Behaviour:** Modal overlay, Escape key or backdrop click → `onCancel`. Renders a Cancel button and a configurable confirm button.

---

### Component: TodoCard

**Props:** `todo`, `onClick(todo)`, `onEdit(todo)`, `onDelete(todo)`.

**Behaviour:**
- Entire card is a keyboard/click navigable region (`role="button"`, `tabIndex=0`, Enter key support).
- Edit and Delete buttons call `e.stopPropagation()` to prevent card click from also firing.
- Displays: title, description (if present), status badge, priority badge, formatted `createdAt` date.

---

### Component: FilterBar

**Props:** `filters { status, priority, search }`, `onChange(filters)`, `onClear()`.

**Behaviour:** Controlled component — every change calls `onChange` with the merged next filters object. "Clear Filters" button only renders when at least one filter is non-default.

---

### Component: SortBar

**Props:** `sortBy`, `sortDir`, `onSortChange({ sortBy, sortDir })`.

**Behaviour:**
- Three sort buttons (Date Created, Priority, Status); active button is visually distinguished and has `aria-pressed`.
- Direction toggle (Asc / Desc) is hidden when `sortBy === 'status'` because status sort has a fixed order.
- Active sort direction is shown as an inline arrow on the active button.

