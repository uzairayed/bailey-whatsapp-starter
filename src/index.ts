import express from "express"
import { initBaileys, getConnectionStatus } from "./baileys"
import adminRoutes from "./routes/admin"
import messageRoutes from "./routes/messages"

const app = express()
const PORT = parseInt(process.env.PORT || "3001", 10)
const API_SECRET = process.env.API_SECRET || ""

// Middleware
app.use(express.json())

// Auth middleware - protect routes with API_SECRET if configured
function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!API_SECRET) {
    next()
    return
  }

  const authHeader = req.headers.authorization
  if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }

  next()
}

app.use("/admin", authMiddleware)
app.use("/messages", authMiddleware)

// Routes
app.use("/admin", adminRoutes)
app.use("/messages", messageRoutes)

// Health check (public)
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    whatsapp: getConnectionStatus() ? "connected" : "disconnected",
    uptime: process.uptime(),
  })
})

// Start server
async function main() {
  console.log("Starting Bailey WhatsApp Service...")
  console.log(`API_SECRET configured: ${API_SECRET ? "yes" : "no"}`)

  await initBaileys()

  app.listen(PORT, () => {
    console.log(`WhatsApp service running on port ${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/health`)
  })
}

main().catch((err) => {
  console.error("Fatal error:", err)
  process.exit(1)
})
