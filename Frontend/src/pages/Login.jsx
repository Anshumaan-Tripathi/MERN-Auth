import { useState } from "react";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [userLoginDetails, setUserLoginDetails] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    setLoading(true);
    setError("");

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userLoginDetails),
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (!data.success) {
          if (Array.isArray(data.error)) {
            const msg = data.error.map((err) => `${err.path}: ${err.message}`).join("\n");
            return setError(msg);
          } else {
            return setError(data.error || "Login failed");
          }
        }

        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      })
      .catch((err) => {
        setLoading(false);
        setError("Something went wrong. Please try again.");
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 via-white to-gray-200">
      <div className="bg-white shadow-lg rounded-2xl px-10 py-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Login</h2>

        <input
          onChange={(e) => setUserLoginDetails((prev) => ({ ...prev, email: e.target.value }))}
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          onChange={(e) => setUserLoginDetails((prev) => ({ ...prev, password: e.target.value }))}
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all duration-200"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Forgot your password?{" "}
          <a href="/forgot-password" className="text-blue-500 hover:underline">
            Reset here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
