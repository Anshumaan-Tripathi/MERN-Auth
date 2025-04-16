import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]
  console.log("Token received:", token)

  if (!token) {
    return res.status(403).json({
      success: false,
      message: "Session timeout. Please login again",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    console.error("Error in token verification", error)
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    })
  }
}
