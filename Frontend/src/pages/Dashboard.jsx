import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/check-auth`, {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false)
        if (!data.success) {
          setError(`No user found: ${data.message}`)
          setTimeout(() => navigate("/signup"), 2000)
        } else {
          setUserData(data.user)
        }
      })
      .catch((err) => {
        setLoading(false)
        setError("Something went wrong.")
        console.error(err)
      })
  }, [])

  if (loading) return <p className="text-center mt-10 text-lg font-medium">Loading...</p>
  if (error) return <p className="text-center mt-10 text-red-600 font-semibold">{error}</p>

  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded-2xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
        Welcome, {userData?.name || "User"} 🎉
      </h2>

      <div className="space-y-2">
        {Object.entries(userData || {}).map(([key, value]) => (
          key !== "password" && key !== "__v" && (
            <p key={key} className="text-gray-700">
              <span className="font-semibold capitalize">{key}:</span> {value?.toString()}
            </p>
          )
        ))}
      </div>

      <button
        onClick={() => {
          fetch("${import.meta.env.VITE_BACKEND_URL}/api/auth/logout", {
            method: "POST",
            credentials: "include"
          }).then(() => {
            setUserData(null)
            navigate("/signup")
          })
        }}
        className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
      >
        Logout
      </button>
    </div>
  )
}

export default Dashboard
