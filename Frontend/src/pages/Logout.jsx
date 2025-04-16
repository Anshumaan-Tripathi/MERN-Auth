import { useNavigate } from "react-router-dom"

const Logout = () => {
  const navigate = useNavigate()

  function handleLogout() {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // include cookies if needed
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.log("Logout failed")
        } else {
          console.log("Logged out successfully")
          localStorage.removeItem("token")
          navigate("/")
        }
      })
      .catch((err) => {
        console.error("Error during logout:", err)
      })
  }

  return (
    <div className="flex justify-center items-center mt-20">
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition shadow"
      >
        Log out
      </button>
    </div>
  )
}

export default Logout
