const BASE = "http://localhost:4000/api";

export async function listTasks() {
  const res = await fetch(`${BASE}/tasks`);
  return res.json();
}

export async function createTask(task: Omit<Task, "id" | "createdAt">) {
  const res = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

// types
export interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  createdAt: string;
}