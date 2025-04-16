import { useState } from "react";
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleSignup = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      alert("All fields are required");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          if (Array.isArray(data.error)) {
            data.error.forEach((err) => {
              alert(`${err.path}: ${err.message}`);
            });
          } else {
            alert(data.error);
          }
          console.log("Failed to signup", data.error?.message, data.message);
        } else {
          alert("Signed up successfully");
          localStorage.setItem("signupEmail", formData.email);
          navigate("/email-verify");
        }
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 via-white to-gray-200">
      <div className="bg-white shadow-lg rounded-2xl px-10 py-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Signup</h2>

        <input
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          type="text"
          placeholder="John Doe"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          type="email"
          placeholder="johndoe@email.com"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          type="password"
          placeholder="Confirm Password"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          onClick={handleSignup}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all duration-200"
        >
          Signup
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
