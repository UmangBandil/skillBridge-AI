import { useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import { Task } from "../../services/api";
import { TaskDetailsModal } from "../../components/TaskDetailsModal/TaskDetailsModal";

export const TaskList = () => {
  const { tasks, loading, start, complete, del } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleAcceptTask = () => {
    if (selectedTask) {
      start(selectedTask.id);
      setSelectedTask(null);
    }
  };

  const handleDenyTask = () => {
    setSelectedTask(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Tasks</h2>
      <ul className="mt-4 space-y-4">
        {tasks.map((task) => (
          <li key={task.id} onClick={() => handleTaskClick(task)} className="p-4 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
            <div className="flex justify-between">
              <h3 className="font-semibold">{task.title}</h3>
              <div className="space-x-2">
                {task.status === "in progress" &&
                  <button onClick={(e) => { e.stopPropagation(); complete(task.id); }} className="px-2 py-1 bg-green-500 text-white rounded">Complete</button>}
                <button onClick={(e) => { e.stopPropagation(); del(task.id); }} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
            <p className="text-gray-600">Budget: ${task.budget}</p>
            {task.status && <p className="text-sm text-gray-500">Status: {task.status}</p>}
          </li>
        ))}
      </ul>
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={handleCloseModal}
          onAccept={handleAcceptTask}
          onDeny={handleDenyTask}
        />
      )}
    </div>
  );
};
