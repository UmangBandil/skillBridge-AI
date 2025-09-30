import React from "react";
import { Task } from "../services/api";

export const TaskCard = ({ task }: { task: Task }) => (
  <div className="border rounded p-4 shadow hover:shadow-lg transition">
    <h3 className="text-lg font-semibold">{task.title}</h3>
    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
    <div className="mt-2 flex flex-wrap gap-1">
      {task.skills.map((s) => (
        <span key={s} className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded">
          {s}
        </span>
      ))}
    </div>
    <p className="text-sm font-medium mt-2">₹{task.budget}</p>
  </div>
);