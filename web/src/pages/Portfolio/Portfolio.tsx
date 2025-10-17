import { useState } from "react";
import { ResumeDrop } from "../../components/ResumeDrop/ResumeDrop";
import { TaskCard } from "../../components/TaskCard/TaskCard";

export const Portfolio = () => {
  const [results, setResults] = useState<any[]>([]);

  const handleMatch = async (resume: string) => {
    const res = await fetch("http://localhost:4000/api/tasks/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume }),
    });
    const data = await res.json();
    setResults(data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">My Portfolio</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Upload your resume to see your matched skills and tasks.
      </p>
      <ResumeDrop onUpload={handleMatch} />
      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Top Matches</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
