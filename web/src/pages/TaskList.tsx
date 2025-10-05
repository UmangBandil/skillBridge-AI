import React from "react";
import { useTasks } from "../hooks/useTasks";
import { TaskCard } from "../components/TaskCard"; // Verify that the file exists at this path or rename the file to match this path

export const TaskList = () => {
  const { tasks, loading } = useTasks();
  if (loading) return <p className="p-4">Loading…</p>;
  return (
    <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
    </div>
  );
};