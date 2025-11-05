
export interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  createdAt: string;
  status: string;
}

// Define a type for the data needed to create a task
export interface CreateTaskData {
  title: string;
  description: string;
  skills: string[];
  budget: number;
}

export interface UpdateTaskData {
  status: string;
}

const BASE = "http://localhost:4000/api"; // This will be proxied by Render

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    // The Content-Type header is crucial for the body to be parsed correctly
    return token 
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
        : { 'Content-Type': 'application/json' };
}

export async function listTasks(): Promise<Task[]> {
  // Using a relative path for API calls to leverage Render's rewrite rule
  const res = await fetch(`/api/tasks`, { headers: getAuthHeaders() as HeadersInit });
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return res.json();
}

// Update the function to accept the full task data object
export async function createTask(taskData: CreateTaskData): Promise<Task> {
  const res = await fetch(`/api/tasks`, {
    method: "POST",
    headers: getAuthHeaders() as HeadersInit,
    // Send the entire taskData object as the JSON body
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
      // Provide more specific error feedback
      const errorData = await res.json().catch(() => ({ error: 'Invalid JSON response' }));
      throw new Error(errorData.error || 'Failed to create task. Please ensure all fields are correct.');
  }
  
  return res.json();
}

export async function updateTask(id: string, data: UpdateTaskData): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders() as HeadersInit,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to update task');
  }
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders() as HeadersInit,
  });
  if (!res.ok) {
    throw new Error('Failed to delete task');
  }
}
