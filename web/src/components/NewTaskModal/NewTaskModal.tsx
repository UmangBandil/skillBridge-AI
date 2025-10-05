import { useState } from "react";
import { createTask } from "../../services/api";

interface Props { open: boolean; onClose: () => void; onCreate: (task: any) => void; }

export const NewTaskModal = ({ open, onClose, onCreate }: Props) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState(5000);

  const submit = async () => {
    const created = await createTask({ title, description: desc, skills: skills.split(",").map((s) => s.trim()), budget });
    onCreate(created);
    onClose();
    setTitle(""); setDesc(""); setSkills(""); setBudget(5000);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded p-6 w-full max-w-md grid gap-4">
        <h3 className="text-lg font-semibold">Post New Task</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="input" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="input" />
        <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma)" className="input" />
        <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="input" />
        <div className="flex gap-2">
          <button onClick={submit} className="btn">Create</button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
};
