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
import { MapPin, Bus, Clock, Ticket, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, Zap, Shield } from "lucide-react"

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
          // Check if there's a redirect parameter
          const redirectTo = searchParams.get("redirect")
          
          if (redirectTo) {
            // Redirect to the intended destination
            router.push(redirectTo)
          } else {
            // Redirect based on the user's role from the session
            const userRole = data.user?.role || userType
            
            if (userRole === "driver") {
              router.push("/driver/dashboard")
            } else if (userRole === "owner") {
              router.push("/owner/dashboard")
            } else {
              router.push("/user/dashboard")
            }
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
        return <Bus className="h-6 w-6" />
      case "owner":
        return <Shield className="h-6 w-6" />
      default:
        return <MapPin className="h-6 w-6" />
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

      <main className="flex-1 grid md:grid-cols-2 relative z-10">
        <div className="flex items-center justify-center p-6 md:p-10">
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
                  <p className="text-gray-600 mt-2">Sign in to your {userType} account to continue</p>
                </div>
              </div>

              {/* User Type Selection */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700 text-center">Select your account type:</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: "user" as const, label: "User", icon: MapPin, color: "blue" },
                    { type: "driver" as const, label: "Driver", icon: Bus, color: "orange" },
                    { type: "owner" as const, label: "Owner", icon: Shield, color: "green" }
                  ].map(({ type, label, icon: Icon, color }) => (
                    <Button
                      key={type}
                      type="button"
                      variant={userType === type ? "default" : "outline"}
                      className={`h-16 cursor-pointer transition-all duration-300 ${
                        userType === type 
                          ? `bg-${color}-600 hover:bg-${color}-700 text-white shadow-lg scale-105 border-0` 
                          : "hover:bg-gray-50 hover:scale-105 bg-white/50 backdrop-blur-sm"
                      }`}
                      onClick={() => {
                        console.log(`${label} button clicked`);
                        setUserType(type);
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Selected: <span className="font-medium capitalize">{userType}</span>
                  </span>
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
              <form onSubmit={handleSubmit} className="space-y-6 border-2 border-dashed border-blue-200 p-4 rounded-lg bg-blue-50/50">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Login Form</h3>
                  <p className="text-sm text-gray-600">Enter your credentials below</p>
                </div>
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
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
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
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 px-4 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 bg-white text-gray-900"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-gray-300"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
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
                      Sign in
                    </div>
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="font-medium text-sm mb-3 text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  Demo Credentials
                </h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="font-medium text-gray-800 mb-1">Driver Account:</p>
                    <p className="text-gray-600 font-mono text-xs">ryanotieno@gmail.com / password1</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="font-medium text-gray-800 mb-1">Owner Account:</p>
                    <p className="text-gray-600 font-mono text-xs">otieno.charles@gmail.com / owner123</p>
                  </div>
                </div>
              </div>

              {/* Social Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 hover:bg-gray-50 transition-colors">
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
                <Button variant="outline" className="h-12 hover:bg-gray-50 transition-colors">
                  <svg className="mr-2 h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
                  </svg>
                  Facebook
                </Button>
              </div>

              <div className="text-center text-sm">
                <span className="text-gray-500">Don&apos;t have an account? </span>
                <Link href="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                  Register now
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white flex items-center justify-center p-10 hidden md:flex relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-pulse animation-delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="max-w-md space-y-8 relative z-10">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold leading-tight">
                Track Kenya&apos;s Buses in{" "}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Real-Time
                </span>
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Get real-time information about bus schedules, routes, and availability. 
                No more waiting at stations!
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="bg-white/20 p-3 rounded-xl group-hover:bg-white/30 transition-colors">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Smart Location</h3>
                  <p className="text-blue-100">Find the nearest bus station based on your location</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <div className="bg-white/20 p-3 rounded-xl group-hover:bg-white/30 transition-colors">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Live Updates</h3>
                  <p className="text-blue-100">View upcoming buses with route and fare information</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <div className="bg-white/20 p-3 rounded-xl group-hover:bg-white/30 transition-colors">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Easy Booking</h3>
                  <p className="text-blue-100">Book tickets in advance or purchase them on the go</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
