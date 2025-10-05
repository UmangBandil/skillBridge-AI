import React, { useState } from "react";
import { useTasks } from "../hooks/useTasks";

export const NewTaskForm = () => {
  const { add } = useTasks();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState<number>(5000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await add({
      title,
      description: desc,
      skills: skills.split(",").map((s) => s.trim()),
      budget,
    });
    setTitle(""); setDesc(""); setSkills(""); setBudget(5000);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto grid gap-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="input" />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" required className="input" />
      <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills (comma separated)" required className="input" />
      <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="input" />
      <button className="btn">Create Task</button>
    </form>
  );
};