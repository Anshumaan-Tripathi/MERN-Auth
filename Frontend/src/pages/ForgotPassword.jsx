import { useState } from "react"
import { useNavigate } from "react-router-dom"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [resetEmail, setResetEmail] = useState("")

  const handleForgotPasswordEmail = () => {
    if (!resetEmail) {
      return alert("Please enter your email.")
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email: resetEmail }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          if (Array.isArray(data.error)) {
            return alert(
              `${data.error[0].message} (field: ${data.error[0].path})`
            )
          }
          console.error("Failed to send reset-password-link", data.message)
          return alert(data.message)
        }

        alert(`Email sent: ${data.message}`)
        localStorage.setItem("resetPasswordEmail", resetEmail)

        setTimeout(() => {
          navigate("/")
        }, 200)
      })
      .catch((err) => {
        console.error("Error while sending reset link", err)
        alert("Something went wrong. Please try again.")
      })
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow-md rounded-2xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
        Forgot Password?
      </h2>
      <p className="text-gray-600 mb-4 text-center">
        Enter your registered email to get a password reset link.
      </p>

      <input
        onChange={(e) => setResetEmail(e.target.value)}
        type="email"
        value={resetEmail}
        placeholder="Your email ID"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        required
      />

      <button
        onClick={handleForgotPasswordEmail}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
      >
        Send Reset Link
      </button>
    </div>
  )
}

export default ForgotPassword
