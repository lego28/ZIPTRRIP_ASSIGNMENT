# API Reference

Base URL: `http://localhost:5000/api/todos`

All responses are JSON.

## Data Model

Each todo has the following fields:

- `id` - UUID string
- `title` - required string, 1 to 200 characters
- `description` - optional string, up to 500 characters
- `status` - one of `pending`, `in-progress`, or `completed`
- `priority` - one of `low`, `medium`, or `high`
- `createdAt` - ISO timestamp
- `updatedAt` - ISO timestamp or `null`

## Endpoints

### GET /api/todos

Returns all todos.

Request body: none.

Example response:

```json
[]
```

### GET /api/todos/:id

Returns a single todo by ID.

Request body: none.

Success response example:

```json
{
  "id": "8b6b7d9b-2e2d-4ce6-9a1d-7f3f08d4f2b0",
  "title": "Finish project",
  "description": "Wrap up the todo app and write docs.",
  "status": "pending",
  "priority": "medium",
  "createdAt": "2026-06-28T10:00:00.000Z",
  "updatedAt": null
}
```

### POST /api/todos

Creates a new todo.

Request body:

```json
{
  "title": "Write documentation",
  "description": "Document the app features and setup steps.",
  "priority": "high"
}
```

Fields:

- `title` - required
- `description` - optional
- `priority` - optional, defaults to `medium`

Success response: `201 Created` with the full todo object.

### PUT /api/todos/:id

Partially updates an existing todo.

Request body can include any of these fields:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "priority": "low"
}
```

Success response: `200 OK` with the updated todo object.

### DELETE /api/todos/:id

Deletes a todo.

Request body: none.

Success response:

```json
{
  "message": "Todo deleted successfully"
}
```

## Error Responses

All error responses include a JSON body with an `error` field.

- `400 Bad Request` - validation or malformed JSON.
- `404 Not Found` - todo not found or route not found.
- `500 Internal Server Error` - unexpected server error.
