import { useState, useEffect } from "react";
import { ResumeDrop } from "../../components/ResumeDrop/ResumeDrop";
import { TaskCard } from "../../components/TaskCard/TaskCard";
import { PortfolioDisplay } from "../../components/PortfolioDisplay/PortfolioDisplay";
import { PortfolioInfo } from "../../components/PortfolioInfo/PortfolioInfo";

export const Portfolio = () => {
  const [name, setName] = useState("Your Name");
  const [address, setAddress] = useState("Your Address");
  const [skills, setSkills] = useState("Your Skills");
  const [hobbies, setHobbies] = useState("Your Hobbies");
  const [results, setResults] = useState<any[]>([]);
  const [resumeText, setResumeText] = useState<string | null>(null);

  useEffect(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData.displayName) {
          setName(userData.displayName);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Continue with default name if there's an error
    }
  }, []);

  const handleMatch = async (resume: string) => {
    setResumeText(resume);
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
      // Format skills as arrays
      const formattedData = data.map((task: any) => ({
        ...task,
        skills: Array.isArray(task.skills) 
          ? task.skills 
          : (task.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      }));
      setResults(formattedData);
    } catch (err: any) {
      console.error('Error matching tasks:', err);
      setResults([]);
    }
  };

  return (
    <div className="min-h-screen dark:bg-slate-900 text-white p-8">
      <h2 className="text-5xl font-bold text-center mb-12 gradient-text">{name}</h2>
      
      <PortfolioInfo 
        name={name} setName={setName} 
        address={address} setAddress={setAddress} 
        skills={skills} setSkills={setSkills} 
        hobbies={hobbies} setHobbies={setHobbies} 
      />

      <div className="mt-12 p-8 border rounded-md">
        <h3 className="text-2xl font-semibold mb-6">Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <p><strong>Address:</strong> {address}</p>
            <p><strong>Skills:</strong> {skills}</p>
            <p><strong>Hobbies:</strong> {hobbies}</p>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-slate-400 text-lg">
          Upload your resume to see your matched skills and tasks.
        </p>
        <div className="mt-4">
            <ResumeDrop onUpload={handleMatch} />
        </div>
      </div>
      
      {resumeText && <PortfolioDisplay resumeText={resumeText} />}
      
      {results.length > 0 && (
        <div className="mt-12">
          <h3 className="text-3xl font-semibold mb-8 text-center gradient-text">Top Matches</h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {results.map((t) => (
              <TaskCard key={t.id} task={t} onComplete={() => {}} onDelete={() => {}} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
