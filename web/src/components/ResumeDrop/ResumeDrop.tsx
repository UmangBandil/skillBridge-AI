import { useState } from 'react';

export const ResumeDrop = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      // Handle file upload logic here
      console.log('Uploading:', file.name);
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
