import { useState } from "react";
import { ResumeDrop } from "../../components/ResumeDrop/ResumeDrop";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { useTasks } from "../../hooks/useTasks";

export const Match = () => {
  const [results, setResults] = useState<any[]>([]);
  const { tasks } = useTasks();

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
      <h2 className="text-2xl font-bold mb-4">Résumé Match</h2>
      <ResumeDrop onSubmit={handleMatch} />
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