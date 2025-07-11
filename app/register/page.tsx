"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Users, 
  Car, 
  Building2, 
  ArrowLeft, 
  MapPin, 
  Bus, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  Eye, 
  EyeOff,
  UserPlus,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  Lock,
  User,
  Building
} from "lucide-react"
import Link from "next/link"

interface Vehicle {
  id: number | string
  name: string
  regNumber: string
  capacity: number
  route?: string
}

interface Sacco {
  saccoName: string
  route?: string
  routes?: string[]
  vehicles: Vehicle[]
}

type UserRole = "user" | "owner" | null

function RegisterForm() {
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') as UserRole
  
  const [selectedRole, setSelectedRole] = useState<UserRole>(roleParam || null)
  const [saccos, setSaccos] = useState<Sacco[]>([])
  const [selectedSacco, setSelectedSacco] = useState<string>("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",

    // Owner specific fields
    companyName: "",
    businessLicense: "",
    address: ""
  })
  const [status, setStatus] = useState<string>("")
  const [statusType, setStatusType] = useState<"success" | "error">("success")
  const router = useRouter()

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setAnimateIn(true), 100)
    
    async function fetchSaccos() {
      try {
        console.log("🔍 Fetching saccos...")
        const res = await fetch("/api/saccos")
        if (!res.ok) {
          throw new Error(`Saccos API failed: ${res.status}`)
        }
        const saccos = await res.json()
        console.log("✅ Saccos fetched:", saccos)
        setSaccos(saccos)
      } catch (error) {
        console.error('❌ Error fetching saccos:', error)
        
        // If it's a database table error, try to initialize database first
        if (error instanceof Error && error.message.includes("no such table")) {
          try {
            console.log("🔧 Database tables missing, attempting initialization...")
            const initRes = await fetch("/api/init-database")
            if (initRes.ok) {
              console.log("✅ Database initialized, retrying saccos fetch...")
              const retryRes = await fetch("/api/saccos")
              if (retryRes.ok) {
                const retrySaccos = await retryRes.json()
                console.log("✅ Saccos fetched after initialization:", retrySaccos)
                setSaccos(retrySaccos)
                return
              }
            }
          } catch (initError) {
            console.error("❌ Database initialization failed:", initError)
          }
        }
        
        // Fallback to companies API if saccos API fails
        try {
          console.log("🔄 Trying companies API fallback...")
          const res = await fetch("/api/companies")
          if (!res.ok) {
            throw new Error(`Companies API failed: ${res.status}`)
          }
          const companies = await res.json()
          const allSaccos = companies.flatMap((c: any) => c.saccos || [])
          console.log("✅ Companies fallback successful:", allSaccos)
          setSaccos(allSaccos)
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError)
          // Provide empty array as final fallback
          console.log("📝 Using empty saccos array as fallback")
          setSaccos([])
        }
      }
    }
    fetchSaccos()
  }, [])

  useEffect(() => {
    const sacco = saccos.find(s => s.saccoName === selectedSacco)
    setVehicles(sacco?.vehicles || [])
    setSelectedVehicle("")
    
    // Get available vehicles (not assigned to other drivers)
    if (sacco && sacco.vehicles) {
      async function fetchAvailableVehicles() {
        try {
          const driversRes = await fetch("/api/drivers")
          const drivers = await driversRes.json()
          const assignedVehicles = drivers.map((d: any) => d.vehicle)
          const available = (sacco as any).vehicles.filter((v: Vehicle) => !assignedVehicles.includes(v.regNumber))
          setAvailableVehicles(available)
        } catch (error) {
          console.error('Error fetching available vehicles:', error)
          setAvailableVehicles((sacco as any).vehicles)
        }
      }
      fetchAvailableVehicles()
    } else {
      setAvailableVehicles([])
    }
  }, [selectedSacco, saccos])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("")
    setIsLoading(true)
    
    try {
      // Check database health first
      console.log("🔍 Checking database health before registration...")
      const healthRes = await fetch("/api/health")
      const healthData = await healthRes.json()
      
      if (healthData.status === "unhealthy" && healthData.tables === "missing") {
        console.log("🔧 Database tables missing, initializing...")
        const initRes = await fetch("/api/init-database")
        if (!initRes.ok) {
          throw new Error("Failed to initialize database")
        }
        console.log("✅ Database initialized")
      }
      
      let payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: selectedRole
      }

      // Add role-specific data
      switch (selectedRole) {

        case "owner":
          payload = {
            ...payload,
            companyName: form.companyName,
            businessLicense: form.businessLicense,
            address: form.address,
          }
          break
      }

      console.log("📝 Submitting registration payload:", payload)

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      console.log("📨 Registration response:", data)
      
      if (res.ok) {
        setStatusType("success")
        setStatus("Registration successful! Redirecting to login...")
        resetForm()
        setTimeout(() => {
          router.push(`/login?type=${selectedRole}`)
        }, 2000)
      } else {
        setStatusType("error")
        setStatus(data.error || "Registration failed.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("❌ Registration error:", err)
      setStatusType("error")
      setStatus("Registration failed. Please try again.")
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      companyName: "",
      businessLicense: "",
      address: ""
    })
    setSelectedSacco("")
    setSelectedVehicle("")
  }

  const handleBackToRoleSelection = () => {
    router.push('/')
  }

  const getIconForRole = (role: string) => {
    switch (role) {
      case "owner":
        return <Shield className="h-6 w-6" />
      default:
        return <MapPin className="h-6 w-6" />
    }
  }

  const getColorForRole = (role: string) => {
    switch (role) {
      case "owner":
        return "from-green-500 to-green-600"
      default:
        return "from-blue-500 to-blue-600"
    }
  }

  // If no role is selected, redirect to home page
  if (!selectedRole) {
    router.push('/')
    return null
  }

  // Registration Form Screen
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
        <Card className={`w-full max-w-2xl backdrop-blur-sm bg-white/80 border-white/20 shadow-2xl transition-all duration-1000 ${
          animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className={`bg-gradient-to-r ${getColorForRole(selectedRole)} text-white p-4 rounded-2xl shadow-lg`}>
                {getIconForRole(selectedRole)}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Register as {selectedRole === "user" ? "Passenger" : "Bus Owner"}
            </CardTitle>
            <p className="text-gray-600">Create your account to get started</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Message */}
            {status && (
              <div className={`p-4 rounded-xl border ${
                statusType === "success" 
                  ? "bg-green-50 border-green-200 text-green-700" 
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                <div className="flex items-center gap-2">
                  {statusType === "success" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{status}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={form.firstName}
                      onChange={handleFormChange}
                      className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={form.lastName}
                      onChange={handleFormChange}
                      className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleFormChange}
                        className="h-12 px-4 pl-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={form.phone}
                        onChange={handleFormChange}
                        className="h-12 px-4 pl-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                        required
                      />
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={handleFormChange}
                      className="h-12 px-4 pl-12 pr-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2"
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
              </div>

              {/* Role-specific Information */}

              {selectedRole === "owner" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-green-600" />
                    Business Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                        Company Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="companyName"
                          name="companyName"
                          type="text"
                          placeholder="Enter your company name"
                          value={form.companyName}
                          onChange={handleFormChange}
                          className="h-12 px-4 pl-12 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                          required
                        />
                        <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessLicense" className="text-sm font-medium text-gray-700">
                          Business License
                        </Label>
                        <Input
                          id="businessLicense"
                          name="businessLicense"
                          type="text"
                          placeholder="Enter business license number"
                          value={form.businessLicense}
                          onChange={handleFormChange}
                          className="h-12 px-4 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                          Business Address
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          placeholder="Enter business address"
                          value={form.address}
                          onChange={handleFormChange}
                          className="h-12 px-4 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToRoleSelection}
                  className="flex-1 h-12 border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Create Account
                    </div>
                  )}
                </Button>
              </div>
            </form>

            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                  Sign in here
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

export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading registration...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
} 