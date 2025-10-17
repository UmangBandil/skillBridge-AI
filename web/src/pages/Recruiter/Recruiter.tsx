import { useState } from "react";

export const Recruiter = () => {
  const [task, setTask] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/tasks/recruiter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });
      if (response.ok) {
        setTask("");
        alert("Task created successfully!");
      } else {
        alert("Failed to create task.");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("An error occurred while creating the task.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Create a Task</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="Enter task description or required skills..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        ></textarea>
        <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Submit
        </button>
      </form>
    </div>
  );
};
