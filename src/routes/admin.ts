import { Router, Request, Response } from "express"
import {
  getDetailedStatus,
  getQRCode,
  initBaileys,
  logout,
  getSocket,
  getConnectionStatus,
} from "../baileys"

const router = Router()

// GET /admin/status - Connection status and QR code
router.get("/status", (_req: Request, res: Response) => {
  const status = getDetailedStatus()
  const qr = getQRCode()

  res.json({
    ...status,
    qr,
  })
})

// POST /admin/reconnect - Reinitialize Bailey connection
router.post("/reconnect", async (_req: Request, res: Response) => {
  try {
    await initBaileys()
    res.json({ success: true, message: "Reconnecting to WhatsApp..." })
  } catch (err) {
    console.error("Reconnect error:", err)
    res.status(500).json({ error: "Failed to reconnect" })
  }
})

// POST /admin/logout - Disconnect and clear auth
router.post("/logout", async (_req: Request, res: Response) => {
  try {
    await logout()
    res.json({ success: true, message: "Logged out from WhatsApp" })
  } catch (err) {
    console.error("Logout error:", err)
    res.status(500).json({ error: "Failed to logout" })
  }
})

export default router
