"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Bus, Users, Building2, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, Zap, Shield } from "lucide-react"

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<"user" | "driver" | "owner">("user")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    const type = searchParams.get("type")
    if (type === "driver") {
      setUserType("driver")
    } else if (type === "owner") {
      setUserType("owner")
    } else {
      setUserType("user")
    }
    
    // Trigger entrance animation
    setTimeout(() => setAnimateIn(true), 100)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

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
        // Show success animation before redirect
        setTimeout(() => {
          // ALWAYS use the role returned from the API, never fall back to UI selection
          const userRole = data.user?.role
          
          console.log(`🎯 Redirecting user with role: ${userRole}`)
          
          // Check if there's a redirect parameter for the correct role
          const redirectTo = searchParams.get("redirect")
          
          if (redirectTo && userRole) {
            // Only redirect to the intended destination if it matches the user's role
            if (userRole === "driver" && redirectTo.startsWith("/driver")) {
              router.push(redirectTo)
              return
            } else if (userRole === "owner" && redirectTo.startsWith("/owner")) {
              router.push(redirectTo)
              return
            } else if (userRole === "user" && redirectTo.startsWith("/user")) {
              router.push(redirectTo)
              return
            }
          }
          
          // STRICT role-based redirection - drivers ONLY go to driver dashboard
          if (userRole === "driver") {
            console.log(`🚌 Redirecting driver to dashboard`)
            router.push("/driver/dashboard")
          } else if (userRole === "owner") {
            console.log(`🏢 Redirecting owner to dashboard`)
            router.push("/owner/dashboard")
          } else if (userRole === "user") {
            console.log(`👤 Redirecting user to dashboard`)
            router.push("/user/dashboard")
          } else {
            console.error(`❌ Unknown user role: ${userRole}`)
            setError("Unknown user role. Please contact support.")
            setIsLoading(false)
          }
        }, 1000)
      } else {
        // Handle error from API response
        setError(data.error || "Authentication failed. Please try again.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
      setIsLoading(false)
    }
  }

  const getIconForUserType = (type: string) => {
    switch (type) {
      case "driver":
        return <Bus className="h-8 w-8" />
      case "owner":
        return <Building2 className="h-8 w-8" />
      default:
        return <Users className="h-8 w-8" />
    }
  }

  const getColorForUserType = (type: string) => {
    switch (type) {
      case "driver":
        return "from-orange-500 to-orange-600"
      case "owner":
        return "from-green-500 to-green-600"
      default:
        return "from-blue-500 to-blue-600"
    }
  }

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case "driver":
        return "Driver"
      case "owner":
        return "Bus Owner"
      default:
        return "Passenger"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <header className="relative border-b border-white/20 backdrop-blur-sm bg-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Kenya Bus Tracker
              </span>
              <div className="text-xs text-gray-500">Real-time bus tracking</div>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 md:p-10 relative z-10">
        <Card className={`w-full max-w-md backdrop-blur-sm bg-white/80 border-white/20 shadow-2xl transition-all duration-1000 ${
          animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <CardContent className="p-8 space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className={`bg-gradient-to-r ${getColorForUserType(userType)} text-white p-4 rounded-2xl shadow-lg transform transition-all duration-500 hover:scale-110`}>
                  {getIconForUserType(userType)}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Welcome Back
                </h1>
                <p className="text-gray-600 mt-2">Sign in to your {getUserTypeLabel(userType)} account</p>
              </div>
            </div>

            {/* Current Account Type Display */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  Signing in as: <span className="font-bold text-gray-900">{getUserTypeLabel(userType)}</span>
                </span>
              </div>
              <div className="mt-2">
                <Link 
                  href="/" 
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Need a different account type? Go back
                </Link>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="email"
                    placeholder="Enter your email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 bg-white text-gray-900"
                    required
                  />
                  {username && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 bg-white text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember-me" className="text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Sign In
                  </div>
                )}
              </Button>

              {/* Demo Credentials */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Demo Credentials</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>{getUserTypeLabel(userType)} Account:</strong></div>
                  <div>Email: test@example.com</div>
                  <div>Password: password123</div>
                </div>
              </div>
            </form>

            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href={`/register?role=${userType}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="relative border-t border-white/20 backdrop-blur-sm bg-white/10 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} Kenya Bus Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
