import { Router, Request, Response } from "express"
import { getSocket, getConnectionStatus } from "../baileys"

const router = Router()

interface SendMessageBody {
  phone: string
  message: string
}

interface SendGroupMessageBody {
  groupId: string
  message: string
}

function toJid(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "")
  return `${cleaned}@s.whatsapp.net`
}

// POST /messages/send - Send message to a phone number
router.post("/send", async (req: Request, res: Response) => {
  try {
    const { phone, message } = req.body as SendMessageBody

    if (!phone || !message) {
      res.status(400).json({ error: "phone and message are required" })
      return
    }

    const sock = getSocket()
    if (!sock || !getConnectionStatus()) {
      res.status(503).json({ error: "WhatsApp not connected" })
      return
    }

    const jid = toJid(phone)
    await sock.sendMessage(jid, { text: message })

    res.json({
      success: true,
      message: `Message sent to ${phone}`,
    })
  } catch (err) {
    console.error("Send message error:", err)
    res.status(500).json({ error: "Failed to send message" })
  }
})

// POST /messages/send-group - Send message to a group
router.post("/send-group", async (req: Request, res: Response) => {
  try {
    const { groupId, message } = req.body as SendGroupMessageBody

    if (!groupId || !message) {
      res.status(400).json({ error: "groupId and message are required" })
      return
    }

    // Validate group ID format (WhatsApp group JID ends with @g.us)
    if (!groupId.endsWith("@g.us")) {
      res.status(400).json({ error: "Invalid group ID (must end with @g.us)" })
      return
    }

    const sock = getSocket()
    if (!sock || !getConnectionStatus()) {
      res.status(503).json({ error: "WhatsApp not connected" })
      return
    }

    await sock.sendMessage(groupId, { text: message })

    res.json({
      success: true,
      message: "Message sent to group",
    })
  } catch (err) {
    console.error("Send group message error:", err)
    res.status(500).json({ error: "Failed to send group message" })
  }
})

// GET /messages/fetch-groups - List all groups bot is member of
router.get("/fetch-groups", async (_req: Request, res: Response) => {
  try {
    const sock = getSocket()
    if (!sock || !getConnectionStatus()) {
      res.status(503).json({ error: "WhatsApp not connected" })
      return
    }

    const timeoutMs = 10000
    const groupsPromise = sock.groupFetchAllParticipating()
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Group fetch timed out")), timeoutMs)
    )

    const groups = await Promise.race([groupsPromise, timeoutPromise])
    const list = Object.values(groups).map((g) => ({
      id: g.id,
      subject: g.subject,
      participantCount: g.participants.length,
    }))

    list.sort((a, b) => a.subject.localeCompare(b.subject))

    res.json({ groups: list })
  } catch (err) {
    console.error("Fetch groups error:", err)
    res.status(500).json({
      error: "Failed to fetch groups",
      groups: [],
    })
  }
})

export default router
