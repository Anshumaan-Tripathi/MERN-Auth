import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import { connectDB } from './DB/connectDB.js'
import authRoutes from './routes/auth.route.js'

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())

app.use(cors({
  origin: [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
}))

app.use('/api/auth', authRoutes)

app.get('/', (req, res) => {
  res.status(200).send("API working fine")
})

app.listen(port, () => {
  connectDB()
  console.log(`Server is up at port ${port}`)
})
