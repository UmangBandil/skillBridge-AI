import { useState, useEffect } from "react";

interface EditableFieldProps {
  label: string;
  initialValue: string;
  onSave: (newValue: string) => void;
}

export const EditableField = ({ label, initialValue, onSave }: EditableFieldProps) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    onSave(value);
    setIsEditing(false);
  };

  return (
    <div className="mb-4">
      <label className="block font-medium text-slate-300">{label}</label>
      {isEditing ? (
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="text"
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button onClick={handleSave} className="glow-btn">
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4 mt-2">
          <p className="p-2 text-lg">{value}</p>
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600/80 rounded-md">
            Edit
          </button>
        </div>
      )}
    </div>
  );
};
