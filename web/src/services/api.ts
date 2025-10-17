export interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  createdAt: string;
}

const BASE = "http://localhost:4000/api";

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function listTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE}/tasks`, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return res.json();
}

export async function createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(task),
  });
  if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create task');
  }
  return res.json();
}
