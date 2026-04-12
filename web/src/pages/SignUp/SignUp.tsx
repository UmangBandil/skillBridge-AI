import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRoleState] = useState('student');
  const navigate = useNavigate();
  const { setIsAuthenticated, setRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }

      const signInResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!signInResponse.ok) {
        const data = await signInResponse.json();
        throw new Error(data.error || 'Something went wrong');
      }

      const data = await signInResponse.json();
      localStorage.setItem('token', data.token);
      if (data.role) {
        localStorage.setItem('role', data.role);
        setRole(data.role);
      }
      setIsAuthenticated(true);

      if (data.role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/tasks');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="w-full p-2 rounded bg-slate-200 dark:bg-slate-700"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-6 flex gap-4 items-center">
          <label className="text-sm font-bold">Role: </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="student"
              checked={role === 'student'}
              onChange={(e) => setRoleState(e.target.value)}
            />
            Student
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="recruiter"
              checked={role === 'recruiter'}
              onChange={(e) => setRoleState(e.target.value)}
            />
            Recruiter
          </label>
        </div>
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};