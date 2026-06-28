# Requirements Document

## Introduction

A full-stack Todo Application consisting of a React multi-page frontend and a Node.js/Express REST API backend. The application allows users to create, read, update, and delete todo items, filter and search through them, and view detailed information for individual todos. All features and code are maintained in a git repository with documentation in Markdown files.

## Glossary

- **Todo**: A task item with a title, description, status, priority, and timestamps.
- **Todo_ID**: A unique identifier assigned to each Todo upon creation.
- **API**: The Express.js REST API backend that manages Todo data.
- **Frontend**: The React multi-page web application served to the user.
- **Todos_List_Page**: The frontend page that displays all Todos with filtering, searching, and CRUD controls.
- **Todo_Detail_Page**: The frontend page that displays full details of a single Todo, identified by a `todoId` query parameter.
- **Data_Store**: The persistence layer (file-based or database) used by the API to store Todos.
- **Client**: The web browser used to access the Frontend.
- **Repository**: The git repository containing all source code and documentation.

---

## Requirements

### Requirement 1: Todo Creation

**User Story:** As a user, I want to create a new todo item, so that I can track tasks I need to complete.

#### Acceptance Criteria

1. WHEN a user submits a create-todo form with a non-empty title of 1–200 characters, THE API SHALL persist a new Todo to the Data_Store with a unique Todo_ID, a `createdAt` timestamp, and a default status of `pending`.
2. WHEN a user submits a create-todo form with an empty title or a title exceeding 200 characters, THE API SHALL return an HTTP 400 response with an error message indicating the title constraint that was violated and SHALL NOT persist the Todo regardless of the values of other fields.
3. WHERE a description is provided, THE API SHALL persist the description text (up to 500 characters) alongside the Todo; IF the description exceeds 500 characters, THE API SHALL return an HTTP 400 response with a descriptive error message.
4. WHERE a priority is provided (low, medium, or high), THE API SHALL persist the priority value; IF a priority value other than low, medium, or high is provided, THEN THE API SHALL return an HTTP 400 response with an error message indicating the valid priority values; otherwise THE API SHALL default the priority to `medium`.
5. WHEN a new Todo is successfully created, THE API SHALL return an HTTP 201 response containing the full Todo object including: Todo_ID, title, description, priority, status, and `createdAt`.
6. WHEN a user submits the create-todo form on the Todos_List_Page, THE Frontend SHALL display the newly created Todo in the list without requiring a full page reload.

---

### Requirement 2: Todo Retrieval — List

**User Story:** As a user, I want to view all my todo items in a list, so that I can see everything I need to do.

#### Acceptance Criteria

1. WHEN the Todos_List_Page loads, THE Frontend SHALL request all Todos from the API and display them in a list.
2. WHILE the API request is in flight on the Todos_List_Page, THE Frontend SHALL display a loading indicator.
3. WHEN the API receives a request for all Todos, THE API SHALL return an HTTP 200 response containing an array of all Todo objects stored in the Data_Store.
4. WHEN the Data_Store contains no Todos, THE API SHALL return an HTTP 200 response containing an empty array.
5. THE Todos_List_Page SHALL display, for each Todo, at minimum: the title, status, priority, and `createdAt` timestamp.
6. IF the API request fails when loading the Todos_List_Page, THEN THE Frontend SHALL display a user-readable error message and SHALL NOT display a partial or stale list.

---

### Requirement 3: Todo Retrieval — Single Item

**User Story:** As a user, I want to view the full details of a single todo item, so that I can see all information associated with it.

#### Acceptance Criteria

1. WHEN the Todo_Detail_Page loads with a `todoId` query parameter that corresponds to an existing Todo, THE Frontend SHALL request the corresponding Todo from the API and display its full details.
2. WHEN the API receives a request for a Todo by Todo_ID and the Todo exists, THE API SHALL return an HTTP 200 response containing the full Todo object.
3. WHEN the API receives a request for a Todo by Todo_ID and the Todo does not exist, THE API SHALL return an HTTP 404 response with a descriptive error message.
4. WHEN the Todo_Detail_Page loads with a `todoId` that does not correspond to any existing Todo, THE Frontend SHALL display a user-readable "not found" message and SHALL NOT display Todo detail fields.
5. THE Todo_Detail_Page SHALL display: title, description, status, priority, `createdAt` timestamp, and `updatedAt` timestamp.
6. IF the API request fails when loading the Todo_Detail_Page, THEN THE Frontend SHALL display a user-readable error message and SHALL NOT display partial Todo detail fields.

---

### Requirement 4: Todo Update

**User Story:** As a user, I want to edit a todo item, so that I can update its details or change its status as work progresses.

#### Acceptance Criteria

1. WHEN a user submits a valid update request for an existing Todo, THE API SHALL update only the fields provided (title, description, status, and/or priority) in the Data_Store, leave unspecified fields unchanged, and set the `updatedAt` timestamp to the current time.
2. WHEN a user submits an update request with an empty title or a title exceeding 200 characters, THE API SHALL return an HTTP 400 response with an error message indicating the title constraint that was violated and SHALL NOT modify the Todo.
3. WHEN a user submits an update request for a Todo_ID that does not exist, THE API SHALL return an HTTP 404 response with a descriptive error message.
4. WHEN a Todo is successfully updated, THE API SHALL return an HTTP 200 response containing the full updated Todo object.
5. IF a status value other than `pending`, `in-progress`, or `completed` is submitted in an update request, THEN THE API SHALL return an HTTP 400 response with a descriptive error message and SHALL NOT modify the Todo.
6. WHEN a user edits a Todo on the Todos_List_Page and the API returns HTTP 200, THE Frontend SHALL update the displayed field values in the list to match the API response body without requiring a full page reload.
7. WHEN a user edits a Todo on the Todo_Detail_Page and the API returns HTTP 200, THE Frontend SHALL update the displayed field values on the page to match the API response body without requiring a full page reload.

---

### Requirement 5: Todo Deletion

**User Story:** As a user, I want to delete a todo item, so that I can remove tasks that are no longer relevant.

#### Acceptance Criteria

1. WHEN a user confirms deletion of a Todo, THE API SHALL remove the Todo from the Data_Store and return an HTTP 200 response with a JSON body containing a `message` field confirming the deletion.
2. WHEN a user requests deletion of a Todo_ID that does not exist, THE API SHALL return an HTTP 404 response with a descriptive error message.
3. WHEN a Todo is successfully deleted and the API returns HTTP 200, THE Frontend SHALL remove the Todo from the displayed list without requiring a full page reload.
4. WHEN a user initiates deletion on the Todos_List_Page, THE Frontend SHALL present a confirmation prompt containing both a confirm control and a cancel control before sending the delete request to the API.
5. WHEN a user activates the cancel control on the deletion confirmation prompt, THE Frontend SHALL dismiss the prompt and SHALL NOT send a delete request to the API.

---

### Requirement 6: Filtering and Searching

**User Story:** As a user, I want to filter and search my todo items, so that I can quickly find the tasks I'm looking for.

#### Acceptance Criteria

1. WHEN a user selects a status filter on the Todos_List_Page, THE Frontend SHALL display every Todo whose status matches the selected value and SHALL NOT display Todos whose status does not match.
2. WHEN a user selects a priority filter on the Todos_List_Page, THE Frontend SHALL display every Todo whose priority matches the selected value and SHALL NOT display Todos whose priority does not match.
3. WHEN a user types text into the search field on the Todos_List_Page, THE Frontend SHALL re-evaluate the list on each keystroke and display every Todo whose title or description contains the entered text (case-insensitive); the search field counts as an active filter participating in AND logic with other active filters.
4. WHEN any two or more filters (status, priority, or search) are active simultaneously, THE Frontend SHALL display only Todos that satisfy all active filter conditions.
5. WHEN the status filter is at its default all-inclusive value, the priority filter is at its default all-inclusive value, and the search field is empty, THE Frontend SHALL display all Todos.
6. WHEN a user activates the "clear all filters" control, THE Frontend SHALL reset the status and priority dropdowns to their default all-inclusive values and clear the search field to empty.

---

### Requirement 7: Sorting

**User Story:** As a user, I want to sort my todo items, so that I can view them in a meaningful order.

#### Acceptance Criteria

1. WHEN a user selects sort by creation date, THE Frontend SHALL offer ascending and descending options and re-order the list accordingly.
2. WHEN a user selects sort by priority, THE Frontend SHALL order Todos high > medium > low or low > medium > high based on the selected direction.
3. WHEN a user selects sort by status, THE Frontend SHALL group Todos in the order: pending → in-progress → completed.
4. WHEN a sort option is selected, THE Frontend SHALL re-order the displayed Todo list according to the selected sort criterion without requiring a full page reload, apply only the one selected sort at a time, and display a visual indicator showing the active sort option.
5. WHEN the Todos_List_Page first loads, THE Frontend SHALL display Todos sorted by `createdAt` descending (newest first) as the default sort.

---

### Requirement 8: Navigation Between Pages

**User Story:** As a user, I want to navigate between the todo list and a todo's detail page, so that I can move through the application naturally.

#### Acceptance Criteria

1. WHEN a user on the Todos_List_Page clicks on a Todo item, THE Frontend SHALL navigate the Client to the Todo_Detail_Page in the same browser tab with the corresponding `todoId` query parameter.
2. WHEN a user activates the back-navigation control on the Todo_Detail_Page, THE Frontend SHALL navigate the Client to the Todos_List_Page.
3. THE Frontend SHALL expose the Todos_List_Page at a distinct URL path and the Todo_Detail_Page at a separate distinct URL path.
4. WHEN the Client navigates directly to the Todo_Detail_Page URL with a `todoId` query parameter that corresponds to an existing Todo, THE Frontend SHALL load and display the corresponding Todo without requiring navigation from the Todos_List_Page and SHALL NOT display a "not found" error message.
5. WHEN the Todo_Detail_Page loads with a `todoId` that does not correspond to any existing Todo, THE Frontend SHALL display a user-readable "not found" message and SHALL NOT display Todo detail fields.
6. WHEN the Client navigates to the Todo_Detail_Page URL with no `todoId` query parameter, THE Frontend SHALL display a user-readable error message indicating the missing parameter and SHALL NOT attempt to fetch a Todo.

---

### Requirement 9: Data Persistence

**User Story:** As a developer, I want todos to be persisted across server restarts, so that data is not lost when the API server is restarted.

#### Acceptance Criteria

1. WHEN the API server is restarted, THE API SHALL attempt to load all previously stored Todos from the Data_Store; IF the Data_Store load fails, THEN THE API SHALL log a descriptive error message indicating the cause of failure and start with an empty Todo list rather than exiting.
2. THE Data_Store SHALL persist each Todo's Todo_ID, title, description, status, priority, `createdAt`, and `updatedAt` fields.
3. WHEN any create, update, or delete operation completes successfully, THE API SHALL write the updated Todo list to the Data_Store before returning the HTTP response.

---

### Requirement 10: API Error Handling

**User Story:** As a developer, I want the API to return consistent, descriptive error responses, so that the frontend can display meaningful messages to the user.

#### Acceptance Criteria

1. IF an unhandled exception occurs during request processing, THEN THE API SHALL return an HTTP 500 response with a generic error message and SHALL log the full error details server-side.
2. WHEN THE API returns any error response, THE API SHALL include a JSON body with at minimum an `error` field containing a human-readable description; IF JSON cannot be generated, THEN THE API SHALL return a plain text error response with an appropriate HTTP status code.
3. IF a request body contains malformed JSON, THEN THE API SHALL return an HTTP 400 response with a descriptive error message.

---

### Requirement 11: Documentation

**User Story:** As a developer or evaluator, I want all features and setup steps documented in Markdown files within the repository, so that the project is understandable and reproducible without additional guidance.

#### Acceptance Criteria

1. THE Repository SHALL contain a `README.md` file at the root level documenting: project overview, prerequisites, setup instructions, and how to run both the frontend and backend.
2. THE Repository SHALL contain a Markdown file documenting all API endpoints, including HTTP method, path, request body schema (or a note that no request body is required for endpoints such as GET), and example responses.
3. THE Repository SHALL contain a Markdown file documenting all frontend pages, their URLs, and the features available on each page.
4. WHEN a new feature is merged into the main branch, THE Repository SHALL include corresponding documentation updates in the relevant Markdown file.

---

### Requirement 12: Repository and Version Control

**User Story:** As a developer or evaluator, I want the project code maintained in a git repository, so that the history is trackable and the project can be cloned and run.

#### Acceptance Criteria

1. THE Repository SHALL be a valid git repository containing at minimum one commit that includes both a `frontend/` directory with React source files and a `backend/` directory with Node.js/Express source files.
2. THE Repository SHALL contain a `.gitignore` file that excludes at minimum `node_modules/`, `dist/`, `build/`, and `.env` files from version control.
3. THE Repository SHALL separate frontend and backend source code into distinct top-level directories.
4. THE Repository SHALL contain a `README.md` at the root level that includes sufficient instructions for a reviewer to clone the repository, install dependencies, and run both frontend and backend locally.
