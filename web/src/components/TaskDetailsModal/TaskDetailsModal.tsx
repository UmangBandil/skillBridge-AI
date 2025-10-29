import { Task } from "../../services/api";

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onAccept: () => void;
  onDeny: () => void;
}

export const TaskDetailsModal = ({ task, onClose, onAccept, onDeny }: TaskDetailsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
        <p className="mb-4">{task.description}</p>
        <div className="mb-4">
          <h3 className="font-semibold">Skills:</h3>
          <ul className="list-disc list-inside">
            {task.skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>
        </div>
        <p className="mb-4 font-semibold">Budget: ${task.budget}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onDeny} className="px-4 py-2 bg-red-500 text-white rounded">Deny</button>
          <button onClick={onAccept} className="px-4 py-2 bg-green-500 text-white rounded">Accept</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded">Close</button>
        </div>
      </div>
    </div>
  );
};
