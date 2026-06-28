# Frontend Reference

The frontend is a React app with page-based navigation using React Router.

## Pages

### Todo List Page - `/`

Main features:

- Create new todos.
- Search todos by title or description.
- Filter todos by status and priority.
- Sort todos by date created, priority, or status.
- Edit a todo from the list.
- Delete a todo from the list with confirmation.
- Click a todo card to open its detail page.

What the page shows:

- Todo title.
- Status.
- Priority.
- Created timestamp.

### Todo Detail Page - `/todo?todoId=<id>`

Main features:

- Loads a single todo by the `todoId` query parameter.
- Displays the full todo record.
- Supports edit and delete actions.
- Includes a back button to return to the list page.

What the page shows:

- Title.
- Description.
- Status.
- Priority.
- Created timestamp.
- Updated timestamp.

## Shared Components

- `TodoForm` - create todo form.
- `EditTodoModal` - edit todo dialog.
- `ConfirmDialog` - delete confirmation dialog.
- `FilterBar` - status, priority, and search controls.
- `SortBar` - sort controls.
- `TodoCard` - list item presentation.
