import { useState } from "react";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { NewTaskModal } from "../../components/NewTaskModal/NewTaskModal";
import { useTasks } from "../../hooks/useTasks";

export const Tasks = () => {
  const { tasks, loading, add } = useTasks();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <button onClick={() => setOpen(true)} className="btn">Post Task</button>
      </div>
      {loading ? <p>Loading…</p> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{tasks.map((t) => <TaskCard key={t.id} task={t} />)}</div>}
      <NewTaskModal open={open} onClose={() => setOpen(false)} onCreate={add} />
    </div>
  );
};