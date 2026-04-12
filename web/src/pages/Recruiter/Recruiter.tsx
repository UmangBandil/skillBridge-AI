import React, { useState } from "react";

export const Recruiter = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token 
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
        : { 'Content-Type': 'application/json' };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!title || !description || !skills || !budget) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const skillsArray = skills.split(",").map((s) => s.trim()).filter(s => s);
      if (skillsArray.length === 0) {
        alert("Please provide at least one skill.");
        return;
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: getAuthHeaders() as HeadersInit,
        body: JSON.stringify({ 
          title, 
          description, 
          skills: skillsArray, 
          budget: parseFloat(budget) 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTitle("");
        setDescription("");
        setSkills("");
        setBudget("");
        alert("Task created successfully!");
        // Optionally reload the page or redirect
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create task' }));
        alert(errorData.error || "Failed to create task. Please check the console for details.");
      }
    } catch (error: any) {
      console.error("Error creating task:", error);
      let errorMsg = "An error occurred while creating the task.";
      if (error?.message) {
        errorMsg = error.message;
      }
      alert(errorMsg);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Create a Task</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium">Title</label>
          <input
            type="text"
            id="title"
            className="w-full p-2 border rounded"
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description" className="block font-medium">Description</label>
          <textarea
            id="description"
            className="w-full p-2 border rounded"
            rows={4}
            placeholder="Enter task description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label htmlFor="skills" className="block font-medium">Skills (comma-separated)</label>
          <input
            type="text"
            id="skills"
            className="w-full p-2 border rounded"
            placeholder="e.g., React, Node.js, Python"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="budget" className="block font-medium">Budget ($)</label>
          <input
            type="number"
            id="budget"
            className="w-full p-2 border rounded"
            placeholder="e.g., 500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Submit
        </button>
      </form>
    </div>
  );
};
