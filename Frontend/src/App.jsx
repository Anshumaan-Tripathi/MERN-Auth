import { Route, Routes } from "react-router-dom"
import Signup from './pages/Signup'
import Login from './pages/Login'
import EmailVerify from "./pages/EmailVerify"
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Logout from "./pages/Logout"
import ForgotPassword from "./pages/ForgotPassword"
import ProtectedRoute from "./components/ProtectedRoute"
import ResetPassword from "./pages/ResetPassword"

function App() {

  return (
     <div>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element = {<ResetPassword />} />
      </Routes>
     </div>
  )
}

export default App
