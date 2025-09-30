import { useEffect, useState } from "react";
import { listTasks, createTask, Task } from "../services/api";

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

  useEffect(() => {
    load();
  }, []);

  return { tasks, loading, add };
}