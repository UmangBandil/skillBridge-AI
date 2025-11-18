import { useEffect, useState } from "react";
import { listTasks, createTask, updateTask, deleteTask, Task } from "../services/api";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await listTasks();
    setTasks(data);
    setLoading(false);
  };

  const add = async (task: Omit<Task, "id" | "createdAt">) => {
    const created = await createTask(task);
    setTasks((prev) => [created, ...prev]);
  };

  const start = async (id: string) => {
    const updated = await updateTask(id, { status: "in progress" });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const complete = async (id: string) => {
    const updated = await updateTask(id, { status: "completed" });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const del = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));

    // Reload tasks after deletion
    await load();
  };

  useEffect(() => { load(); }, []);

  return { tasks, loading, add, start, complete, del, load };
}
