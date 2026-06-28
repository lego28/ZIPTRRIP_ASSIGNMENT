const BASE_URL = 'http://localhost:5000/api'

/**
 * Fetch all todos
 * @returns {Promise<Array>} array of todo objects
 */
export async function fetchTodos() {
  const res = await fetch(`${BASE_URL}/todos`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Failed to fetch todos (${res.status})`)
  }
  return res.json()
}

/**
 * Fetch a single todo by ID
 * @param {string} id
 * @returns {Promise<Object>} todo object
 */
export async function fetchTodoById(id) {
  const res = await fetch(`${BASE_URL}/todos/${id}`)
  if (res.status === 404) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || 'Todo not found')
    err.status = 404
    throw err
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || `Failed to fetch todo (${res.status})`)
    err.status = res.status
    throw err
  }
  return res.json()
}

/**
 * Create a new todo
 * @param {{ title: string, description?: string, priority?: string }} data
 * @returns {Promise<Object>} created todo object
 */
export async function createTodo(data) {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(body.error || `Failed to create todo (${res.status})`)
    err.status = res.status
    err.data = body
    throw err
  }
  return body
}

/**
 * Update an existing todo
 * @param {string} id
 * @param {{ title?: string, description?: string, status?: string, priority?: string }} data
 * @returns {Promise<Object>} updated todo object
 */
export async function updateTodo(id, data) {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(body.error || `Failed to update todo (${res.status})`)
    err.status = res.status
    err.data = body
    throw err
  }
  return body
}

/**
 * Delete a todo by ID
 * @param {string} id
 * @returns {Promise<Object>} response body
 */
export async function deleteTodo(id) {
  const res = await fetch(`${BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(body.error || `Failed to delete todo (${res.status})`)
    err.status = res.status
    throw err
  }
  return body
}
