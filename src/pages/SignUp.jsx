import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../services/api";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signup({ name, email, password });
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 border-4 border-black">
        <div>
          <h2 className="text-center text-5xl font-black uppercase text-black mb-2 tracking-tight">
            Join Us
          </h2>
          <p className="text-center text-gray-600 font-medium">
            Create an account to save your favorites
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border-2 border-red-600 text-red-900 px-4 py-3 font-bold">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold uppercase text-black mb-2 tracking-wider">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-black placeholder-gray-400 text-black focus:outline-none focus:ring-4 focus:ring-gray-300 transition font-medium"
                placeholder="John Doe"
                minLength={3}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold uppercase text-black mb-2 tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-black placeholder-gray-400 text-black focus:outline-none focus:ring-4 focus:ring-gray-300 transition font-medium"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold uppercase text-black mb-2 tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-black placeholder-gray-400 text-black focus:outline-none focus:ring-4 focus:ring-gray-300 transition font-medium"
                placeholder="••••••••"
              />
              <p className="mt-2 text-xs text-gray-600 font-medium">
                Must be at least 6 characters with one number, one lowercase and one uppercase letter
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border-2 border-black text-sm font-black uppercase tracking-wider text-white bg-black hover:bg-gray-800 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-black underline hover:text-gray-700 transition"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
