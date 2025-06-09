import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { jwtVerify, SignJWT } from "jose"

// This would be an environment variable in a real app
const JWT_SECRET = new TextEncoder().encode("your-secret-key")

export type UserRole = "user" | "driver" | "owner"

export interface UserSession {
  id: string
  name: string
  email: string
  role: UserRole
}

export async function createSession(user: UserSession) {
  // Create a JWT token that expires in 7 days
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const session = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expires.getTime() / 1000)
    .sign(JWT_SECRET)

  // Save the session in a cookie
  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, JWT_SECRET)
    return payload as unknown as UserSession
  } catch (error) {
    return null
  }
}

export async function updateSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) return null

  try {
    const { payload } = await jwtVerify(session, JWT_SECRET)

    // Extend the session expiration
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const newSession = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expires.getTime() / 1000)
      .sign(JWT_SECRET)

    cookieStore.set("session", newSession, {
      expires,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return payload as unknown as UserSession
  } catch (error) {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
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
    } else {
      redirect("/driver/dashboard")
    }
  }

  return session
}
