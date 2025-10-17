import { Link } from "react-router-dom";

export const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>
        <form>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-md bg-input text-text"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md bg-input text-text"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{" "}
          <Link to="/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};