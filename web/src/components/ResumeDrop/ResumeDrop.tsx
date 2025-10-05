import { useState } from "react";

interface Props { onSubmit: (resume: string) => void; }

export const ResumeDrop = ({ onSubmit }: Props) => {
  const [text, setText] = useState("");

  return (
    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded p-6">
      <label className="block mb-2 font-medium">Paste your résumé / bio</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="I build React apps with Tailwind CSS..."
        className="input w-full h-32"
      />
      <button onClick={() => onSubmit(text)} className="btn mt-2">Find Matches</button>
    </div>
  );
};
