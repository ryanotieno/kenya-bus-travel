"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Building2, 
  Bus,
  MapPin, 
  CheckCircle, 
  LogIn
} from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setAnimateIn(true), 100)
  }, [])

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
          <div className="flex items-center gap-3 group">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Kenya Bus Tracker
              </span>
              <div className="text-xs text-gray-500">Real-time bus tracking</div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 md:p-10 relative z-10">
        <Card className={`w-full max-w-4xl backdrop-blur-sm bg-white/80 border-white/20 shadow-2xl transition-all duration-1000 ${
          animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg">
                <LogIn className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Welcome to Kenya Bus Tracker
            </CardTitle>
            <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* User Login */}
              <Link href="/login?type=user">
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500 transform hover:scale-105 bg-white/50 backdrop-blur-sm h-full">
                  <CardContent className="p-8 text-center">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg mx-auto mb-6 w-16 h-16 flex items-center justify-center">
                      <Users className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-800">Passenger Login</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Access your account to book tickets and track buses in real-time
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Track live bus locations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Book and manage tickets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Plan your routes</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Driver Login */}
              <Link href="/login?type=driver">
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-500 transform hover:scale-105 bg-white/50 backdrop-blur-sm h-full">
                  <CardContent className="p-8 text-center">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-2xl shadow-lg mx-auto mb-6 w-16 h-16 flex items-center justify-center">
                      <Bus className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-800">Driver Login</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Access your driver dashboard to manage trips and scan tickets
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Manage daily trips</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Scan passenger tickets</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Track performance</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Owner Login */}
              <Link href="/login?type=owner">
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500 transform hover:scale-105 bg-white/50 backdrop-blur-sm h-full">
                  <CardContent className="p-8 text-center">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-lg mx-auto mb-6 w-16 h-16 flex items-center justify-center">
                      <Building2 className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-800">Bus Owner Login</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Manage your fleet operations and monitor business performance
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Fleet management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Revenue analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Driver oversight</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
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
