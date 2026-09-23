import { useState } from 'react';

interface ParsedResume {
  skills: string[];
  skillCount: number;
  education: string[];
  hasEducation: boolean;
  experience: string[];
  hasExperience: boolean;
  contact: {
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    github: string | null;
  };
}

interface ResumeDropProps {
  onUpload: (content: string) => void;
  onParsed?: (parsed: ParsedResume, resumeText: string) => void;
}

export const ResumeDrop = ({ onUpload, onParsed }: ResumeDropProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const isValidResumeFile = (f: File) => {
    const name = f.name.toLowerCase();
    const type = f.type;
    return (
      type === 'text/plain' ||
      type === 'application/pdf' ||
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      name.endsWith('.txt') ||
      name.endsWith('.pdf') ||
      name.endsWith('.docx')
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        if (isValidResumeFile(selectedFile)) {
          setFile(selectedFile);
          setError(null);
        } else {
          setError({ message: 'Please upload a PDF (.pdf), Word (.docx), or Text (.txt) file' });
        }
      }
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (isValidResumeFile(droppedFile)) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError({ message: 'Please drop a PDF (.pdf), Word (.docx), or Text (.txt) file' });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError({ message: 'Please select a file first' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For PDF files and text files, use FormData
      const formData = new FormData();
      formData.append('resume', file);

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/tasks/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to upload resume' }));
        setError({
          message: errorData.error || 'Failed to upload resume',
          details: errorData.details,
        });
        return;
      }

      const data = await response.json();        if (data.success && data.data) {
        setParsed(data.data);
        // Pass extracted text directly so the parent can use it without
        // relying on stale React state.
        onParsed?.(data.data, data.extractedText);
        onUpload(data.extractedText);
      }
    } catch (err: any) {
      console.error('Error uploading resume:', err);
      setError({
        message: err.message || 'Failed to upload resume',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-8 border-2 border-dashed rounded-lg transition-colors ${
          dragActive
            ? 'border-primary/50 bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="text-4xl">📄</div>
          <div className="text-center">
            <p className="font-semibold">Drag and drop your resume here</p>
            <p className="text-sm text-muted-foreground">PDF or TXT files (max 10MB)</p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Select File
            </span>
          </label>
        </div>
      </div>

      {/* File Info */}
      {file && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium">Selected: {file.name}</p>
          <p className="text-xs text-muted-foreground">Size: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg space-y-2">
          <div className="flex gap-2">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p className="text-sm text-destructive font-medium">{error.message}</p>
          </div>
          {error.details && (
            <p className="text-xs text-destructive/80 pl-7">{error.details}</p>
          )}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            Processing resume...
          </>
        ) : (
          'Upload & Parse Resume'
        )}
      </button>

      {/* Parsed Resume Data */}
      {parsed && (
        <div className="space-y-4 pt-4 border-t">
          {/* Skills */}
          {parsed.skillCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">✓</span>
                <h3 className="font-semibold">Detected Skills ({parsed.skillCount})</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsed.skills.slice(0, 15).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {parsed.skills.length > 15 && (
                  <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                    +{parsed.skills.length - 15} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Experience */}
          {parsed.hasExperience && parsed.experience.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">✓</span>
                <h3 className="font-semibold">Experience Detected</h3>
              </div>
              <ul className="space-y-1 text-sm">
                {parsed.experience.slice(0, 3).map((exp, idx) => (
                  <li key={idx} className="text-muted-foreground truncate">
                    • {exp}
                  </li>
                ))}
                {parsed.experience.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{parsed.experience.length - 3} more entries
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Education */}
          {parsed.hasEducation && parsed.education.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">✓</span>
                <h3 className="font-semibold">Education Detected</h3>
              </div>
              <ul className="space-y-1 text-sm">
                {parsed.education.slice(0, 3).map((edu, idx) => (
                  <li key={idx} className="text-muted-foreground truncate">
                    • {edu}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          {(parsed.contact.email || parsed.contact.linkedin || parsed.contact.github) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">✓</span>
                <h3 className="font-semibold">Contact Information</h3>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                {parsed.contact.email && <p>📧 {parsed.contact.email}</p>}
                {parsed.contact.phone && <p>📱 {parsed.contact.phone}</p>}
                {parsed.contact.linkedin && <p>💼 {parsed.contact.linkedin}</p>}
                {parsed.contact.github && <p>🐙 {parsed.contact.github}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
