# Implementation Plan: Todo Application

## Overview

The project structure and core implementation already exist. This task list completes the application by:
1. Hardening the backend with a proper `todoService` abstraction and async `fileStore`
2. Adding test infrastructure and property-based/unit/integration/component tests
3. Creating root-level scaffolding (`.gitignore`, `README.md`, `git init`)
4. Writing API and frontend documentation

All code is JavaScript (Node.js/Express backend, React + Vite frontend).

---

## Tasks

- [ ] 1. Repository scaffolding and root-level setup
  - [ ] 1.1 Initialise git repository and create root `.gitignore`
    - Run `git init` at the project root
    - Create `.gitignore` at repo root excluding `node_modules/`, `dist/`, `build/`, `.env`, `*.log`, `.DS_Store`
    - Verify `backend/.gitignore` and `frontend/.gitignore` each exclude at minimum `node_modules/` and `dist/`
    - _Requirements: 12.1, 12.2_

  - [ ] 1.2 Create initial git commit with both `frontend/` and `backend/` directories
    - Stage all source files (excluding ignored paths)
    - Commit with message "Initial commit: todo-application scaffold"
    - _Requirements: 12.1, 12.3_

- [ ] 2. Backend — refactor `store.js` into async `fileStore.js`
  - [ ] 2.1 Create `backend/src/store/fileStore.js` with async `loadTodos` and `saveTodos`
    - `loadTodos()` returns a `Promise<Todo[]>`; on missing or corrupt file logs a descriptive error and resolves `[]` (never rejects)
    - `saveTodos(todos)` writes atomically via a temp file + rename, returns `Promise<void>`, throws `Error` on write failure
    - Export `{ loadTodos, saveTodos }`
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 2.2 Write property test for `fileStore` persistence round-trip
    - Install `fast-check` as a devDependency in `backend/`
    - Create `backend/src/store/__tests__/fileStore.test.js`
    - **Property 16: Mutations survive server restart** — for any sequence of writes, re-reading the file yields the same array
    - **Validates: Requirements 9.1, 9.3**
    - Tag comment: `// Feature: todo-application, Property 16: Mutations survive server restart`
    - _Requirements: 9.1, 9.3_

- [ ] 3. Backend — create `todoService.js` with centralised validation and CRUD
  - [ ] 3.1 Create `backend/src/services/todoService.js`
    - Implement `createTodo(input)`, `getAllTodos()`, `getTodoById(id)`, `updateTodo(id, patch)`, `deleteTodo(id)`
    - Move all validation logic from `todoController.js` into this service (title 1–200 chars, description ≤500 chars, valid status enum, valid priority enum)
    - `createTodo` generates UUID v4, sets `createdAt = updatedAt = now`, defaults `status = "pending"`, `priority = "medium"`
    - `updateTodo` refreshes `updatedAt` and leaves unspecified fields unchanged
    - Each function calls `loadTodos` / `saveTodos` from `fileStore.js`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.4, 4.5, 5.1, 9.2, 9.3_

  - [ ]* 3.2 Write property tests for `todoService` — valid creation
    - Create `backend/src/services/__tests__/todoService.test.js`
    - Replace `fileStore` with an in-memory mock for all tests in this file
    - **Property 1: Valid todo creation returns a well-formed Todo** — `fc.string({ minLength: 1, maxLength: 200 })` titles produce a 201-equivalent object with all 7 fields
    - Tag: `// Feature: todo-application, Property 1: Valid todo creation returns a well-formed Todo`
    - **Validates: Requirements 1.1, 1.4, 1.5**

  - [ ]* 3.3 Write property tests for `todoService` — invalid title rejection
    - In `backend/src/services/__tests__/todoService.test.js`
    - **Property 2: Invalid title inputs are rejected** — empty string, whitespace-only, >200 chars all throw a validation error and leave the store unchanged
    - Tag: `// Feature: todo-application, Property 2: Invalid title inputs are rejected`
    - **Validates: Requirements 1.2, 4.2**

  - [ ]* 3.4 Write property tests for `todoService` — description boundary
    - **Property 3: Description length boundary is enforced** — descriptions 1–500 chars accepted, >500 chars rejected
    - Tag: `// Feature: todo-application, Property 3: Description length boundary is enforced`
    - **Validates: Requirements 1.3**

  - [ ]* 3.5 Write property tests for `todoService` — persistence round-trip
    - **Property 4: Persistence round-trip preserves all fields** — `createTodo` then `getTodoById` returns identical object
    - Tag: `// Feature: todo-application, Property 4: Persistence round-trip preserves all fields`
    - **Validates: Requirements 2.3, 3.2, 9.2**

  - [ ]* 3.6 Write property tests for `todoService` — non-existent resources
    - **Property 5: Non-existent resource requests yield appropriate errors** — `getTodoById`, `updateTodo`, `deleteTodo` with unknown IDs return `null` / `false`
    - Tag: `// Feature: todo-application, Property 5: Non-existent resource requests yield appropriate errors`
    - **Validates: Requirements 3.3, 4.3, 5.2**

  - [ ]* 3.7 Write property tests for `todoService` — partial update field preservation
    - **Property 6: Partial updates preserve unspecified fields** — any non-empty subset of updatable fields updates exactly those; `updatedAt` strictly increases
    - Tag: `// Feature: todo-application, Property 6: Partial updates preserve unspecified fields`
    - **Validates: Requirements 4.1, 4.4**

  - [ ]* 3.8 Write property tests for `todoService` — invalid status rejection
    - **Property 7: Invalid status values are rejected** — arbitrary strings other than the three valid statuses throw a validation error; todo unchanged
    - Tag: `// Feature: todo-application, Property 7: Invalid status values are rejected`
    - **Validates: Requirements 4.5**

  - [ ]* 3.9 Write property tests for `todoService` — deleted todo not retrievable
    - **Property 8: Deleted todos are no longer retrievable** — after `deleteTodo`, `getTodoById` returns `null` and `getAllTodos` does not include the item
    - Tag: `// Feature: todo-application, Property 8: Deleted todos are no longer retrievable`
    - **Validates: Requirements 5.1**

- [ ] 4. Backend — update `todoController.js` to use `todoService`
  - [ ] 4.1 Refactor `backend/src/controllers/todoController.js` to delegate to `todoService`
    - Replace inline validation and direct `store.js` calls with `todoService` function calls
    - Remove the old `require('../data/store')` import; keep only `require('../services/todoService')`
    - Map service return values / thrown errors to correct HTTP status codes (404 for null, 400 for validation errors, 500 for unexpected errors)
    - Ensure every error response body contains at minimum an `"error"` string field
    - _Requirements: 1.1–1.5, 2.3, 2.4, 3.2, 3.3, 4.1–4.5, 5.1, 5.2, 10.1, 10.2, 10.3_

- [ ] 5. Backend — add test script and install testing dependencies
  - [ ] 5.1 Add `jest` (or `vitest`) and `supertest` as devDependencies to `backend/package.json`
    - Install `jest@29.7.0`, `supertest@6.3.4`, `fast-check@3.19.0`
    - Add `"test": "jest --runInBand"` to `package.json` scripts
    - Add `jest.config.js` with `testEnvironment: "node"` and `testMatch: ["**/__tests__/**/*.test.js"]`
    - _Requirements: (testing infrastructure)_

- [ ] 6. Backend — integration tests for Express API routes
  - [ ]* 6.1 Write happy-path CRUD integration test
    - Create `backend/src/__tests__/todos.integration.test.js`
    - Use `supertest` against the Express app with a temp `todos.json` file (create before each, delete after each)
    - Test: `POST /api/todos` → 201 → `GET /api/todos/:id` → 200 → `PUT /api/todos/:id` → 200 → `DELETE /api/todos/:id` → 200 → `GET /api/todos/:id` → 404
    - _Requirements: 1.1, 1.5, 2.3, 3.2, 4.1, 4.4, 5.1_

  - [ ]* 6.2 Write error-case integration tests
    - Malformed JSON body → `POST /api/todos` returns 400 with `error` field (Req 10.3)
    - Missing title → 400 (Req 1.2)
    - Unknown ID on `GET`, `PUT`, `DELETE` → 404 (Req 3.3, 4.3, 5.2)
    - _Requirements: 3.3, 4.3, 5.2, 10.2, 10.3_

  - [ ]* 6.3 Write property test for error response shape
    - **Property 9: All error responses include an `error` field** — every 4xx/5xx response body has a non-empty `error` string
    - Tag: `// Feature: todo-application, Property 9: All error responses include an error field`
    - **Validates: Requirements 10.2**

  - [ ]* 6.4 Write server-restart persistence integration test
    - Write todos via API, re-initialise the store by re-reading from the same temp file, then verify all items are present and correct
    - _Requirements: 9.1, 9.3_

- [ ] 7. Backend — checkpoint
  - Ensure all backend tests pass with `cd backend && npm test`
  - Ask the user if any questions arise before proceeding to frontend tasks.

- [ ] 8. Frontend — add test infrastructure
  - [ ] 8.1 Install frontend test dependencies
    - Add `vitest@1.6.0`, `@vitest/ui@1.6.0`, `@testing-library/react@14.3.1`, `@testing-library/jest-dom@6.4.2`, `@testing-library/user-event@14.5.2`, `msw@2.3.0`, `fast-check@3.19.0` as devDependencies in `frontend/`
    - Update `frontend/vite.config.js` to add a `test` block: `{ globals: true, environment: 'jsdom', setupFiles: ['./src/test/setup.js'] }`
    - Create `frontend/src/test/setup.js` importing `@testing-library/jest-dom`
    - Add `"test": "vitest --run"` to `frontend/package.json` scripts
    - _Requirements: (testing infrastructure)_

  - [ ] 8.2 Create MSW request handlers for API mocking
    - Create `frontend/src/test/handlers.js` with MSW handlers for all five API endpoints
    - Create `frontend/src/test/server.js` that sets up a `setupServer` instance with those handlers
    - _Requirements: (test support)_

- [ ] 9. Frontend — filter and sort logic unit/property tests
  - [ ]* 9.1 Write property tests for combined filter AND semantics
    - Create `frontend/src/pages/__tests__/TodosListPage.filter.test.jsx`
    - Extract and test the `applyFilters` function from `TodosListPage.jsx`
    - **Property 10: Combined filters satisfy AND semantics** — for any combination of status/priority/search filters applied to any array of todos, every displayed item satisfies all active conditions simultaneously
    - Tag: `// Feature: todo-application, Property 10: Combined filters satisfy AND semantics`
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

  - [ ]* 9.2 Write property test for case-insensitive search
    - **Property 11: Search is case-insensitive and matches title or description** — for any search string and todo list, displayed set equals those where `title.toLowerCase().includes(s.toLowerCase()) || description.toLowerCase().includes(s.toLowerCase())`
    - Tag: `// Feature: todo-application, Property 11: Search is case-insensitive and matches title or description`
    - **Validates: Requirements 6.3**

  - [ ]* 9.3 Write property test for clear-filters behaviour
    - **Property 12: Clearing filters restores all-inclusive display** — any filter state → clear → all todos shown, filter state reset to defaults
    - Tag: `// Feature: todo-application, Property 12: Clearing filters restores all-inclusive display`
    - **Validates: Requirements 6.6**

  - [ ]* 9.4 Write property tests for sort by `createdAt`
    - Extract and test the `applySort` function from `TodosListPage.jsx`
    - **Property 13: Sort by createdAt produces monotonic order** — asc: each `createdAt` ≥ previous; desc: each `createdAt` ≤ previous
    - Tag: `// Feature: todo-application, Property 13: Sort by createdAt produces monotonic order`
    - **Validates: Requirements 7.1, 7.5**

  - [ ]* 9.5 Write property tests for sort by priority ranking
    - **Property 14: Sort by priority respects the defined ranking** — desc: high before medium before low; asc: inverted
    - Tag: `// Feature: todo-application, Property 14: Sort by priority respects the defined ranking`
    - **Validates: Requirements 7.2**

  - [ ]* 9.6 Write property tests for sort by status grouping
    - **Property 15: Sort by status respects the defined group order** — pending before in-progress before completed
    - Tag: `// Feature: todo-application, Property 15: Sort by status respects the defined group order`
    - **Validates: Requirements 7.3**

- [ ] 10. Frontend — component tests for `TodosListPage`
  - [ ]* 10.1 Write example test: loading indicator shown during fetch
    - Create `frontend/src/pages/__tests__/TodosListPage.test.jsx`
    - Mock `fetchTodos` to return a never-resolving promise; assert loading spinner is present
    - _Requirements: 2.2_

  - [ ]* 10.2 Write example test: error banner on list-load failure
    - Mock `fetchTodos` to reject; assert error banner is rendered and list is absent
    - _Requirements: 2.6_

  - [ ]* 10.3 Write property test: list reflects state after create
    - **Property 17: Frontend list reflects the state after create** — for any valid todo submission that returns 201, list renders a new item matching submitted title/status/priority without full reload
    - Tag: `// Feature: todo-application, Property 17: Frontend list reflects the state after create`
    - **Validates: Requirements 1.6**

  - [ ]* 10.4 Write property test: list reflects state after delete
    - **Property 19: Frontend list reflects the state after delete** — for any todo in the list, confirming deletion and receiving 200 removes it from the displayed list
    - Tag: `// Feature: todo-application, Property 19: Frontend list reflects the state after delete`
    - **Validates: Requirements 5.3**

  - [ ]* 10.5 Write example tests: confirm dialog behaviour
    - Assert dialog appears when Delete button clicked (Req 5.4)
    - Assert no API call is made when Cancel is clicked (Req 5.5)
    - _Requirements: 5.4, 5.5_

  - [ ]* 10.6 Write example test: click todo navigates to detail URL
    - Mock `useNavigate`; click a `TodoCard`; assert navigate called with `/todo?todoId=<id>`
    - _Requirements: 8.1_

- [ ] 11. Frontend — component tests for `TodoDetailPage`
  - [ ]* 11.1 Write property test: detail page renders all required fields
    - Create `frontend/src/pages/__tests__/TodoDetailPage.test.jsx`
    - **Property 20: Todo_Detail_Page renders all required fields** — for any todo object returned by the API, the page displays `title`, `description`, `status`, `priority`, `createdAt`, `updatedAt`
    - Tag: `// Feature: todo-application, Property 20: Todo_Detail_Page renders all required fields`
    - **Validates: Requirements 3.5**

  - [ ]* 11.2 Write property test: detail page reflects updated values after edit
    - **Property 18: Frontend reflects updated values after edit** — for any todo displayed and any valid update returning 200, displayed field values update to match API response body without reload
    - Tag: `// Feature: todo-application, Property 18: Frontend reflects updated values after edit`
    - **Validates: Requirements 4.6, 4.7**

  - [ ]* 11.3 Write example tests: detail page error states
    - `todoId` param missing → "Missing todo ID" message, no fetch attempted (Req 8.6)
    - API returns 404 → "not found" message, no detail fields rendered (Req 3.4)
    - API request fails → error banner, no partial fields (Req 3.6)
    - Back button click → navigate to `/` (Req 8.2)
    - _Requirements: 3.4, 3.6, 8.2, 8.6_

- [ ] 12. Frontend — checkpoint
  - Ensure all frontend tests pass with `cd frontend && npm test`
  - Ask the user if any questions arise before proceeding to documentation tasks.

- [ ] 13. Documentation
  - [ ] 13.1 Create root `README.md`
    - Sections: project overview, prerequisites (Node.js ≥ 18, npm), setup instructions (`npm install` for each workspace), how to run backend (`cd backend && npm run dev`, port 5000) and frontend (`cd frontend && npm run dev`, port 5173), how to run tests for each workspace
    - _Requirements: 11.1, 11.4, 12.4_

  - [ ] 13.2 Create `docs/api.md` — API endpoint documentation
    - Document all five endpoints: `GET /api/todos`, `POST /api/todos`, `GET /api/todos/:id`, `PUT /api/todos/:id`, `DELETE /api/todos/:id`
    - Each entry includes: HTTP method + path, description, request body schema (or "no request body"), example success response, example error responses with HTTP status codes
    - _Requirements: 11.2_

  - [ ] 13.3 Create `docs/frontend-pages.md` — frontend pages documentation
    - Document `TodosListPage` at `/` (and `/todos` redirect if applicable): URL, purpose, features (create form, filter bar, sort bar, todo card list, delete confirm dialog, edit modal, loading/error states)
    - Document `TodoDetailPage` at `/todo?todoId=<id>`: URL, query param, purpose, features (all six fields, edit modal, delete button, back navigation, error/not-found states)
    - _Requirements: 11.3_

- [ ] 14. Final checkpoint
  - Ensure all backend and frontend tests pass
  - Ensure `README.md`, `docs/api.md`, and `docs/frontend-pages.md` exist at the specified paths
  - Ask the user if any questions arise before closing out the implementation.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The design document has a Correctness Properties section with 20 properties; property tests are included for all applicable ones
- Backend property tests run with `fast-check` and `jest`; each test run must execute at minimum 100 iterations
- Frontend property tests run with `fast-check` and `vitest` + `@testing-library/react`
- Every property-based test file must include a comment in the format: `// Feature: todo-application, Property N: <property title>`
- The `todoService.js` abstraction decouples validation and business logic from the Express controller layer
- The async `fileStore.js` replaces the synchronous `store.js`; update any imports accordingly

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "4.1"] },
    { "id": 4, "tasks": ["6.1", "6.2", "6.3", "6.4", "8.1"] },
    { "id": 5, "tasks": ["8.2"] },
    { "id": 6, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "10.1", "10.2"] },
    { "id": 7, "tasks": ["10.3", "10.4", "10.5", "10.6", "11.1", "11.2", "11.3"] },
    { "id": 8, "tasks": ["13.1", "13.2", "13.3"] }
  ]
}
```
