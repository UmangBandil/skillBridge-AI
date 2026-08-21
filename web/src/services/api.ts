
export interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  createdAt: string;
  status?: string; // Defaults to "open" on the server
  score?: number; // Optional: matching score for matched tasks
  estimatedHours?: number; // Optional: shown by some views, not persisted
  matchedSkills?: string[]; // Optional: skills matched against a resume
}

// Define a type for the data needed to create a task
export interface CreateTaskData {
  title: string;
  description: string;
  skills: string[];
  budget: number;
}

export interface UpdateTaskData {
  status: string;
}

export interface PortfolioPayload {
  skills?: string[];
  education?: string[];
  experience?: string[];
  contact?: {
    email?: string | null;
    phone?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };
  [key: string]: unknown;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    // The Content-Type header is crucial for the body to be parsed correctly
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Check if server is accessible
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch('/health');
    return res.ok;
  } catch {
    return false;
  }
}

export async function listTasks(): Promise<Task[]> {
  // Using a relative path for API calls to leverage Render's rewrite rule
  const res = await fetch(`/api/tasks`, { headers: getAuthHeaders() as HeadersInit });
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return res.json();
}

// Update the function to accept the full task data object
export async function createTask(taskData: CreateTaskData): Promise<Task> {
  console.log('Creating task with data:', taskData);
  
  try {
    const res = await fetch(`/api/tasks`, {
      method: "POST",
      headers: getAuthHeaders() as HeadersInit,
      // Send the entire taskData object as the JSON body
      body: JSON.stringify(taskData),
    });

    console.log('Response status:', res.status, res.statusText);

    if (!res.ok) {
        // Provide more specific error feedback
        const errorData = await res.json().catch(() => ({ error: 'Invalid JSON response' }));
        console.error('Error response:', errorData);
        const errorMessage = errorData.error || errorData.message || `Failed to create task (${res.status})`;
        throw new Error(errorMessage);
    }
    
    const result = await res.json();
    console.log('Task created successfully:', result);
    return result;
  } catch (error: any) {
    console.error('Network error creating task:', error);
    
    // Check if it's a network error
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
      throw new Error('Cannot connect to server. Please make sure the backend server is running on http://localhost:4000');
    }
    
    // Re-throw the original error if it's not a network error
    throw error;
  }
}

export async function updateTask(id: string, data: UpdateTaskData): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders() as HeadersInit,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to update task');
  }
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders() as HeadersInit,
  });
  if (!res.ok) {
    throw new Error('Failed to delete task');
  }
}

export async function getPortfolio(): Promise<{
  portfolio: PortfolioPayload | null;
  name?: string;
}> {
  const res = await fetch(`/api/portfolio`, {
    headers: getAuthHeaders() as HeadersInit,
  });
  if (!res.ok) {
    throw new Error('Failed to fetch portfolio');
  }
  return res.json();
}

export async function savePortfolio(portfolio: PortfolioPayload): Promise<void> {
  const res = await fetch(`/api/portfolio`, {
    method: 'PUT',
    headers: getAuthHeaders() as HeadersInit,
    body: JSON.stringify({ portfolio }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save portfolio');
  }
}

export async function matchTasks(resume: string): Promise<Task[]> {
  const res = await fetch(`/api/tasks/match`, {
    method: 'POST',
    headers: getAuthHeaders() as HeadersInit,
    body: JSON.stringify({ resume }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to match tasks' }));
    throw new Error(errorData.error || 'Failed to match tasks');
  }
  const data = await res.json();
  // Format skills as arrays
  return data.map((task: any) => ({
    ...task,
    skills: Array.isArray(task.skills) 
      ? task.skills 
      : (task.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
  }));
}