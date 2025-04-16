import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const ResetPassword = () => {
  const navigate = useNavigate()

  const [newResetPassword, setNewResetPassword] = useState({
    newPassword: "",
    confirmPassword: "",
    email: "",
  })
  const [token, setToken] = useState("")

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const receivedToken = queryParams.get("token")
    const receivedEmail = queryParams.get("email")

    if (!receivedEmail || !receivedToken) {
      return alert("Missing email or token. Please request a new reset link.")
    }

    setToken(receivedToken)
    setNewResetPassword((prev) => ({
      ...prev,
      email: receivedEmail,
    }))
  }, [])

  const handelPasswordReset = () => {
    fetch("http://localhost:5000/api/auth/reset-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newResetPassword,
        token,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          if (Array.isArray(data.error)) {
            return alert(`${data.message}:${data.path}`)
          }
          alert(data.message)
          console.error(`Error in resetting the password: ${data.message}`)
          return
        }
        alert(data.message)
        navigate("/")
      })
      .catch((err) => {
        console.error("Something went wrong while resetting the password", err)
        return err.message
      })
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow-md rounded-2xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
        Reset Password
      </h2>

      <input
        onChange={(e) =>
          setNewResetPassword((prev) => ({
            ...prev,
            newPassword: e.target.value,
          }))
        }
        type="password"
        placeholder="New password"
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />

      <input
        onChange={(e) =>
          setNewResetPassword((prev) => ({
            ...prev,
            confirmPassword: e.target.value,
          }))
        }
        type="password"
        placeholder="Confirm password"
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />

      <button
        onClick={handelPasswordReset}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
      >
        Update Password
      </button>
    </div>
  )
}

export default ResetPassword
