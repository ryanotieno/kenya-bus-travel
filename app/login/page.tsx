"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Bus, Clock, Ticket } from "lucide-react"

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<"user" | "driver" | "owner">("user")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "driver") {
      setUserType("driver")
    } else if (type === "owner") {
      setUserType("owner")
    } else {
      setUserType("user")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // Use the actual entered credentials
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: username, 
          password: password 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect based on the userType
        if (userType === "driver") {
          router.push("/driver/dashboard")
        } else if (userType === "owner") {
          router.push("/owner/dashboard")
        } else {
          router.push("/user/dashboard")
        }
      } else {
        // Handle error from API response
        setError(data.error || "Authentication failed. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-500 text-white p-2 rounded-full">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Kenya Bus Tracker</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 grid md:grid-cols-2">
        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md space-y-6">
            <div className="flex justify-center">
              <div className="bg-orange-500 text-white p-4 rounded-full">
                {userType === "driver" ? <Bus className="h-8 w-8" /> : userType === "owner" ? <MapPin className="h-8 w-8" /> : <MapPin className="h-8 w-8" />}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
            <p className="text-center text-gray-500">Sign in to your {userType} account to continue</p>

            <div className="flex gap-4 mb-6">
              <Button
                variant={userType === "user" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setUserType("user")}
              >
                User
              </Button>
              <Button
                variant={userType === "driver" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setUserType("driver")}
              >
                Driver
              </Button>
              <Button
                variant={userType === "owner" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setUserType("owner")}
              >
                Owner
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-orange-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                Sign in
              </Button>
            </form>

            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium text-sm mb-2">Demo Credentials</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">User:</p>
                  <p>
                    Username: <span className="font-mono">user@demo.com</span>
                  </p>
                  <p>
                    Password: <span className="font-mono">user123</span>
                  </p>
                </div>
                <div>
                  <p className="font-medium">Driver:</p>
                  <p>
                    Username: <span className="font-mono">driver@demo.com</span>
                  </p>
                  <p>
                    Password: <span className="font-mono">driver123</span>
                  </p>
                </div>
                <div>
                  <p className="font-medium">Owner:</p>
                  <p>
                    Username: <span className="font-mono">owner@demo.com</span>
                  </p>
                  <p>
                    Password: <span className="font-mono">owner123</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                </svg>
                Facebook
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-500">Don&apos;t have an account? </span>
              <Link href="/register" className="text-orange-500 hover:underline">
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white flex items-center justify-center p-10 hidden md:flex">
          <div className="max-w-md space-y-8">
            <h2 className="text-4xl font-bold">Track Kenya&apos;s Buses in Real-Time</h2>
            <p className="text-xl">
              Get real-time information about bus schedules, routes, and availability. No more waiting at stations!
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-6 w-6 shrink-0 mt-0.5" />
                <span>Find the nearest bus station based on your location</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-6 w-6 shrink-0 mt-0.5" />
                <span>View upcoming buses with route and fare information</span>
              </li>
              <li className="flex items-start gap-3">
                <Ticket className="h-6 w-6 shrink-0 mt-0.5" />
                <span>Book tickets in advance or purchase them on the go</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-500">
          © {new Date().getFullYear()} Kenya Bus Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
