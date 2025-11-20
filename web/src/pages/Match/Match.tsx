import { useState } from "react";
import { ResumeDrop } from "../../components/ResumeDrop/ResumeDrop";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { Task } from "../../services/api";

export const Match = () => {
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [results, setResults] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async (resume: string) => {
    setResumeText(resume);
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch("/api/tasks/match", {
        method: "POST",
        headers,
        body: JSON.stringify({ resume }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to match tasks' }));
        throw new Error(errorData.error || 'Failed to match tasks');
      }

      const data = await res.json();
      // Ensure skills are arrays and format the data properly
      const formattedData = data.map((task: any) => ({
        ...task,
        skills: Array.isArray(task.skills) ? task.skills : (task.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      }));
      setResults(formattedData);
    } catch (err: any) {
      console.error('Error matching tasks:', err);
      let errorMsg = err?.message || 'An error occurred while matching tasks';
      
      // Check if it's a connection error
      if (errorMsg.includes('Failed to fetch') || 
          errorMsg.includes('network') || 
          errorMsg.includes('localhost') ||
          errorMsg.includes('ECONNREFUSED')) {
        errorMsg = 'Cannot connect to server. Please make sure the backend is running on http://localhost:4000';
      }
      
      setError(errorMsg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 gradient-text">AI Task Matching</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Upload your resume to discover personalized micro-internship opportunities matched to your skills.
        </p>

        <div className="glass p-8 rounded-xl mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upload Your Resume</h2>
          <p className="text-muted-foreground mb-6">
            Upload a text file (.txt) containing your resume. Our AI will analyze your skills and match you with the best opportunities.
          </p>
          <ResumeDrop onUpload={handleMatch} />
          
          {loading && (
            <div className="mt-4 text-center">
              <p className="text-muted-foreground">Analyzing your resume and finding matches...</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive">{error}</p>
            </div>
          )}
        </div>

        {resumeText && (
          <div className="glass p-6 rounded-xl mb-8">
            <h3 className="text-xl font-semibold mb-3">Resume Preview</h3>
            <div className="bg-muted p-4 rounded-lg max-h-48 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">{resumeText.substring(0, 500)}...</pre>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6 gradient-text">Top Matched Tasks</h2>
            <p className="text-muted-foreground mb-6">
              Found {results.length} matching {results.length === 1 ? 'opportunity' : 'opportunities'} for you
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onComplete={() => {}} 
                  onDelete={() => {}} 
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && results.length === 0 && resumeText && (
          <div className="glass p-6 rounded-xl text-center">
            <p className="text-muted-foreground">No matching tasks found. Try uploading a different resume or check back later for new opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
};