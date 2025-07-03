import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { jwtVerify, SignJWT } from "jose"
import { randomBytes } from "crypto"
import { sessionService } from "./db-service"

// Use environment variable for JWT secret, fallback to a default for development
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-for-development-only"
)

export type UserRole = "user" | "driver" | "owner"

export interface UserSession {
  id: string
  name: string
  email: string
  role: UserRole
  sessionId: string
  lastActivity: number
}

export interface SessionData {
  userId: string
  sessionId: string
  userAgent: string
  ipAddress: string
  expiresAt: Date
  lastActivity: Date
}

export async function createSession(user: Omit<UserSession, 'sessionId' | 'lastActivity'>, userAgent: string, ipAddress: string): Promise<string> {
  // Generate a unique session ID
  const sessionId = randomBytes(32).toString('hex')
  const now = Date.now()
  const expires = new Date(now + 7 * 24 * 60 * 60 * 1000) // 7 days

  // Create session data for database
  const sessionData: SessionData = {
    userId: user.id,
    sessionId,
    userAgent,
    ipAddress,
    expiresAt: expires,
    lastActivity: new Date(now)
  }

      // Store session in database
    try {
      await sessionService.create({
        userId: parseInt(user.id),
        token: sessionId,
        expiresAt: expires,
        createdAt: new Date(now)
      })
    } catch (error) {
      console.error("Failed to store session in database:", error)
      // Continue with cookie-based session as fallback
      // This is normal if database tables don't exist yet
    }

  // Create JWT token with session data
  const sessionToken = await new SignJWT({ 
    ...user, 
    sessionId,
    lastActivity: now
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires.getTime() / 1000)
    .sign(JWT_SECRET)

  // Save the session in a secure cookie
  const cookieStore = await cookies()
  cookieStore.set("session", sessionToken, {
    expires,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
  })

  return sessionId
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) return null

  try {
    // Verify JWT token
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET)
    const session = payload as unknown as UserSession

    // Check if session exists in database (optional for now)
    try {
      const dbSession = await sessionService.getByToken(session.sessionId)
      if (!dbSession) {
        console.log("Session not found in database, but continuing with JWT")
        // Don't invalidate - just continue with JWT validation
      } else {
        // Check if session has expired
        if (new Date() > dbSession.expiresAt) {
          console.log("Session expired, invalidating")
          await deleteSession()
          return null
        }

        // Update last activity
        await updateSessionActivity(session.sessionId)
      }
    } catch (error) {
      console.log("Database session check failed, continuing with JWT:", error)
      // Continue with JWT validation even if database is not available
    }

    return session
  } catch (error) {
    console.error("Session verification failed:", error)
    await deleteSession()
    return null
  }
}

export async function updateSessionActivity(sessionId: string) {
  try {
    await sessionService.updateLastActivity(sessionId)
  } catch (error) {
    console.error("Failed to update session activity:", error)
  }
}

export async function updateSession() {
  const session = await getSession()
  if (!session) return null

  // Extend the session expiration
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const now = Date.now()

  try {
    // Update database session
    await sessionService.updateExpiration(session.sessionId, expires)

    // Create new JWT token
    const newSessionToken = await new SignJWT({ 
      ...session, 
      lastActivity: now
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expires.getTime() / 1000)
      .sign(JWT_SECRET)

    // Update cookie
    const cookieStore = await cookies()
    cookieStore.set("session", newSessionToken, {
      expires,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60
    })

    return { ...session, lastActivity: now }
  } catch (error) {
    console.error("Failed to update session:", error)
    return session
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (sessionToken) {
    try {
      // Get session ID from token
      const { payload } = await jwtVerify(sessionToken, JWT_SECRET)
      const session = payload as unknown as UserSession
      
      // Delete from database
      await sessionService.deleteByToken(session.sessionId)
    } catch (error) {
      console.error("Failed to delete session from database:", error)
    }
  }

  // Delete cookie
  cookieStore.delete("session")
}

export async function invalidateAllUserSessions(userId: string) {
  try {
    await sessionService.deleteByUserId(parseInt(userId))
  } catch (error) {
    console.error("Failed to invalidate user sessions:", error)
  }
}

export async function requireAuth(role?: UserRole) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  if (role && session.role !== role) {
    // Redirect to the appropriate dashboard based on role
    if (session.role === "user") {
      redirect("/user/dashboard")
    } else if (session.role === "driver") {
      redirect("/driver/dashboard")
    } else if (session.role === "owner") {
      redirect("/owner/dashboard")
    }
  }

  return session
}

export async function validateSession(sessionId: string): Promise<boolean> {
  try {
    const dbSession = await sessionService.getByToken(sessionId)
    if (!dbSession) return false

    if (new Date() > dbSession.expiresAt) {
      await sessionService.deleteByToken(sessionId)
      return false
    }

    return true
  } catch (error) {
    console.error("Session validation failed:", error)
    return false
  }
}
