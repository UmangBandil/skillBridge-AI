
import { useState } from "react";
import { createTask, CreateTaskData } from "../../services/api"; // Import the new type

interface Props { 
  open: boolean; 
  onClose: () => void; 
  onCreate: (task: any) => void; 
}

export const NewTaskModal = ({ open, onClose, onCreate }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState(5000);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSkills("");
    setBudget(5000);
    setError(null);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!title || !description || !skills || !budget) {
      setError('All fields are required.');
      return;
    }

    const taskData: CreateTaskData = {
      title,
      description,
      skills: skills.split(",").map((s) => s.trim()).filter(s => s), // Ensure no empty strings
      budget,
    };

    try {
      const createdTask = await createTask(taskData);
      onCreate(createdTask); // Pass the newly created task up to the parent component
      resetForm();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'An unknown error occurred.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass p-6 w-full max-w-md grid gap-4 rounded-xl shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold gradient-text">Post New Task</h3>
        
        {error && <div className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</div>}

        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Title" 
          className="input" 
        />
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Description" 
          className="input" 
          rows={4}
        />
        <input 
          value={skills} 
          onChange={(e) => setSkills(e.target.value)} 
          placeholder="Skills (comma-separated, e.g., React, Node.js)" 
          className="input" 
        />
        <div className="grid grid-cols-2 gap-4 items-center">
          <label htmlFor="budget" className="text-foreground/80">Budget ($)</label>
          <input 
            id="budget"
            type="number" 
            value={budget} 
            onChange={(e) => setBudget(Number(e.target.value))} 
            className="input" 
            min="0"
          />
        </div>

        <div className="flex gap-4 justify-end mt-4">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="glow-btn">Create Task</button>
        </div>
      </div>
    </div>
  );
};
