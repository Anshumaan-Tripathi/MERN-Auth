import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  const [verificationDetails, setVerificationDetails] = useState({
    email: null,
    code: null,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("signupEmail");
    if (!email) {
      alert("Missing email. Signup again");
      return;
    }
    setVerificationDetails((prev) => ({
      ...prev,
      email: email,
    }));
  }, []);

  const handleSubmit = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(verificationDetails),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (!data.success) {
          return alert(`Failed to verify email: ${data.message}`);
        }
        alert(`Email verified: ${data.message}`);
        localStorage.removeItem("signupEmail");
        navigate("/dashboard");
      })
      .catch((err) => {
        setLoading(false);
        alert("Something went wrong.");
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 via-white to-gray-200">
      <div className="bg-white shadow-lg rounded-2xl px-8 py-6 w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          Email Verification
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the verification code sent to your email
        </p>

        <input
          onChange={(e) =>
            setVerificationDetails((prev) => ({
              ...prev,
              code: e.target.value,
            }))
          }
          type="number"
          placeholder="Verification Code"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !verificationDetails.code}
          className={`w-full py-2 rounded-lg text-white transition-all duration-200 ${
            loading || !verificationDetails.code
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Verifying..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
