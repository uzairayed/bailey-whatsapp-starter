import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
} from "@whiskeysockets/baileys"
import { Boom } from "@hapi/boom"
import pino from "pino"
import * as qrcode from "qrcode-terminal"
import path from "path"
import fs from "fs"

const AUTH_DIR = path.join(process.cwd(), "auth_info")

/** Remove contents of AUTH_DIR without deleting the directory itself. */
function clearAuthDir(): void {
  if (!fs.existsSync(AUTH_DIR)) return
  for (const entry of fs.readdirSync(AUTH_DIR)) {
    const full = path.join(AUTH_DIR, entry)
    fs.rmSync(full, { recursive: true, force: true })
  }
}

const logger = pino({ level: "silent" })

let sock: WASocket | null = null
let isConnected = false
let currentQR: string | null = null
let connectionState: "disconnected" | "connecting" | "connected" = "disconnected"
let connectedPhone: string | null = null

export function getSocket(): WASocket | null {
  return sock
}

export function getConnectionStatus(): boolean {
  return isConnected
}

export function getQRCode(): string | null {
  return currentQR
}

export function getDetailedStatus() {
  return {
    state: connectionState,
    connected: isConnected,
    hasQR: currentQR !== null,
    phone: connectedPhone,
    hasSession: fs.existsSync(path.join(AUTH_DIR, "creds.json")),
  }
}

export async function logout(): Promise<void> {
  try {
    if (sock) {
      await sock.logout()
    }
  } catch (err) {
    console.warn("sock.logout() failed (may already be disconnected):", err)
  }
  sock = null
  isConnected = false
  currentQR = null
  connectionState = "disconnected"
  connectedPhone = null
  clearAuthDir()
}

export async function initBaileys(): Promise<void> {
  connectionState = "connecting"
  currentQR = null

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: [process.env.APP_NAME || "MyApp", "Chrome", "1.0.0"],
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      currentQR = qr
      connectionState = "connecting"
      console.log("\n========================================")
      console.log("  Scan this QR code with WhatsApp:")
      console.log("========================================\n")
      qrcode.generate(qr, { small: true })
    }

    if (connection === "close") {
      isConnected = false
      currentQR = null
      connectedPhone = null
      connectionState = "disconnected"
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode

      if (statusCode === DisconnectReason.loggedOut) {
        console.log("WhatsApp session logged out. Clearing auth and generating fresh QR...")
        clearAuthDir()
        sock = null
        await initBaileys()
      } else {
        console.log(`Connection closed (code: ${statusCode}). Reconnecting...`)
        await initBaileys()
      }
    }

    if (connection === "open") {
      isConnected = true
      currentQR = null
      connectionState = "connected"

      if (sock?.user) {
        connectedPhone = sock.user.id.split(":")[0] || sock.user.id
      }

      console.log("WhatsApp connection established successfully!")
    }
  })
}
