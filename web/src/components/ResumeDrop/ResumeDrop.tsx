import { useState } from 'react';

interface ResumeDropProps {
  onUpload: (content: string) => void;
}

export const ResumeDrop = ({ onUpload }: ResumeDropProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onUpload(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed rounded-md">
      <input type="file" onChange={handleFileChange} />
      <button
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleUpload}
        disabled={!file}
      >
        Upload Resume
      </button>
    </div>
  );
};
