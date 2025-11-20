import { useState, useEffect, useRef } from "react";

interface EditableFieldProps {
  label: string;
  initialValue: string;
  onSave: (newValue: string) => void | Promise<void>;
  // Optional validator: return a string message for error, or null for valid
  validate?: (value: string) => string | null;
}

export const EditableField = ({ label, initialValue, onSave, validate }: EditableFieldProps) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  // Run validation when value changes if validator is provided
  useEffect(() => {
    if (validate) {
      setError(validate(value));
    }
  }, [value, validate]);

  const handleSave = async () => {
    if (validate) {
      const validationError = validate(value);
      setError(validationError);
      if (validationError) return;
    }

    try {
      setIsSaving(true);
      await Promise.resolve(onSave(value));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className="mb-4">
      <label className="block font-medium text-slate-300">{label}</label>
      {isEditing ? (
        <div className="flex items-center space-x-2 mt-2">
          <input
            ref={inputRef}
            type="text"
            className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${label}-error` : undefined}
          />
          <button
            onClick={handleSave}
            className="glow-btn"
            disabled={isSaving || Boolean(error)}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600/80 rounded-md"
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4 mt-2">
          <p className="p-2 text-lg">{value || <span className="text-slate-400">Not set</span>}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600/80 rounded-md"
          >
            Edit
          </button>
        </div>
      )}
      {error && (
        <p id={`${label}-error`} className="mt-1 text-red-400 text-sm">
          {error}
        </p>
      )}
    </div>
  );
};
