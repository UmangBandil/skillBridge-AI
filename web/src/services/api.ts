export type ApplicationStatus =
  | 'APPLIED'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'ACCEPTED'
  | 'WITHDRAWN';

export interface ScoreBreakdown {
  semantic: number | null;
  skills: number;
  keywords: number;
  experience: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  createdAt: string;
  status?: string;
  score?: number;
  matchScore?: number;
  estimatedHours?: number;
  breakdown?: ScoreBreakdown;
  matchedSkills?: string[];
  missingSkills?: string[];
  isDegraded?: boolean;
  degradedReason?: string;
  authorId?: string;
  author?: {
    id: string;
    name?: string;
    email: string;
  };
  _count?: {
    applications: number;
  };
}

export interface TaskListResponse {
  items: Task[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TaskQueryParams {
  q?: string;
  skill?: string;
  status?: string;
  minBudget?: number;
  maxBudget?: number;
  sort?: 'newest' | 'oldest' | 'budget_high' | 'budget_low';
  page?: number;
  limit?: number;
}
export function normalizeTaskSkills(skills?: string | string[] | null): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills.map((s) => s.trim()).filter(Boolean);
  }
  if (typeof skills === 'string') {
    return skills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export interface CreateTaskData {
  title: string;
  description: string;
  skills: string[];
  budget: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  skills?: string[];
  budget?: number;
  status?: string;
}

export interface Application {
  id: string;
  taskId: string;
  userId: string;
  status: ApplicationStatus;
  coverLetter?: string | null;
  appliedAt: string;
  updatedAt: string;
  task?: Task;
  user?: {
    id: string;
    name: string | null;
    email: string;
    portfolio?: any;
    resumes?: Array<{
      id: string;
      filename: string;
      skills: string[];
    }>;
  };
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
  lastResumeUpdatedAt?: string;
  [key: string]: unknown;
}

export interface ParsedResumeResponse {
  resumeId?: string;
  filename: string;
  fileSize: string;
  extractedTextLength: number;
  extractedText: string;
  data: {
    personal?: {
      name?: string | null;
      email?: string | null;
      phone?: string | null;
    };
    skills: string[];
    education: string[];
    experience: string[];
    projects?: string[];
    certifications?: string[];
    links?: {
      linkedin?: string | null;
      github?: string | null;
      portfolio?: string | null;
    };
    summary?: string;
  };
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Check if server is running
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/health');
    if (res.ok) return true;
    const fallback = await fetch('/health');
    return fallback.ok;
  } catch {
    return false;
  }
}

// Check database readiness
export async function checkServerReady(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/ready');
    return res.ok;
  } catch {
    return false;
  }
}

// Fetch tasks with search and filtering
export async function listTasks(params: TaskQueryParams = {}): Promise<TaskListResponse> {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set('q', params.q);
  if (params.skill) searchParams.set('skill', params.skill);
  if (params.status) searchParams.set('status', params.status);
  if (params.minBudget != null) searchParams.set('minBudget', String(params.minBudget));
  if (params.maxBudget != null) searchParams.set('maxBudget', String(params.maxBudget));
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));

  const url = `/api/v1/tasks?${searchParams.toString()}`;
  const res = await fetch(url, { headers: getAuthHeaders() });

  if (!res.ok) {
    // Attempt fallback to legacy
    const legacyRes = await fetch(`/api/tasks`, { headers: getAuthHeaders() });
    if (!legacyRes.ok) {
      throw new Error('Failed to fetch tasks');
    }
    const legacyItems = await legacyRes.json();
    return {
      items: legacyItems,
      page: 1,
      limit: legacyItems.length,
      total: legacyItems.length,
      totalPages: 1
    };
  }

  const json = await res.json();
  if (json.data && json.data.items) {
    return json.data;
  }
  if (Array.isArray(json)) {
    return {
      items: json,
      page: 1,
      limit: json.length,
      total: json.length,
      totalPages: 1
    };
  }
  return json;
}

export async function getTask(id: string): Promise<Task> {
  const res = await fetch(`/api/v1/tasks/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) {
    const legacy = await fetch(`/api/tasks/${id}`, { headers: getAuthHeaders() });
    if (!legacy.ok) throw new Error('Task not found');
    return legacy.json();
  }
  const json = await res.json();
  return json.data || json;
}

export async function createTask(taskData: CreateTaskData): Promise<Task> {
  const res = await fetch('/api/v1/tasks', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData?.error?.message || errorData?.error || 'Failed to create task';
    throw new Error(message);
  }

  const json = await res.json();
  return json.data || json;
}

export async function updateTask(id: string, data: UpdateTaskData): Promise<Task> {
  const res = await fetch(`/api/v1/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.error || 'Failed to update task');
  }
  const json = await res.json();
  return json.data || json;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/v1/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to delete task');
  }
}

// AI Matching
export async function matchTasks(resume: string): Promise<Task[]> {
  const res = await fetch('/api/v1/tasks/match', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ resume }),
  });

  if (!res.ok) {
    // Fallback to legacy
    const legacy = await fetch('/api/tasks/match', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resume }),
    });
    if (!legacy.ok) {
      const err = await legacy.json().catch(() => ({}));
      throw new Error(err?.error?.message || err?.error || 'Failed to match tasks');
    }
    const legacyData = await legacy.json();
    return legacyData.map((t: any) => ({
      ...t,
      skills: Array.isArray(t.skills) ? t.skills : (t.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    }));
  }

  const json = await res.json();
  const rawMatches = json.data?.matches || json;
  return rawMatches.map((t: any) => ({
    ...t,
    skills: Array.isArray(t.skills) ? t.skills : (t.skills || '').split(',').map((s: string) => s.trim()).filter(Boolean),
  }));
}

// Application Workflow
export async function applyToTask(taskId: string, coverLetter?: string): Promise<Application> {
  const res = await fetch('/api/v1/applications', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ taskId, coverLetter }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.message || 'Failed to submit application');
  }

  const json = await res.json();
  return json.data || json;
}

export async function getMyApplications(): Promise<Application[]> {
  const res = await fetch('/api/v1/applications/my', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch your applications');
  }
  const json = await res.json();
  return json.data || json;
}

export async function withdrawApplication(id: string): Promise<void> {
  const res = await fetch(`/api/v1/applications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to withdraw application');
  }
}

export async function getRecruiterApplications(): Promise<Application[]> {
  const res = await fetch('/api/v1/applications/recruiter', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch recruiter applications');
  }
  const json = await res.json();
  return json.data || json;
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application> {
  const res = await fetch(`/api/v1/applications/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to update application status');
  }
  const json = await res.json();
  return json.data || json;
}

// Resume upload with FormData
export async function uploadResumeFile(file: File): Promise<ParsedResumeResponse> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('resume', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/v1/resumes/upload', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    // Fallback to /api/tasks/upload
    const legacy = await fetch('/api/tasks/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!legacy.ok) {
      const err = await legacy.json().catch(() => ({}));
      throw new Error(err?.error?.message || err?.error || 'Resume upload failed');
    }
    return legacy.json();
  }

  const json = await res.json();
  return json.data || json;
}

// Portfolio
export async function getPortfolio(): Promise<{ portfolio: PortfolioPayload | null; name?: string }> {
  const res = await fetch('/api/v1/portfolio', { headers: getAuthHeaders() });
  if (!res.ok) {
    const legacy = await fetch('/api/portfolio', { headers: getAuthHeaders() });
    if (!legacy.ok) throw new Error('Failed to fetch portfolio');
    return legacy.json();
  }
  return res.json();
}

export async function savePortfolio(portfolio: PortfolioPayload): Promise<void> {
  const res = await fetch('/api/v1/portfolio', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ portfolio }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || err?.error || 'Failed to save portfolio');
  }
}