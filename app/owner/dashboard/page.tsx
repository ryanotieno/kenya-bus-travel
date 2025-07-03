"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  LogOut, 
  Plus, 
  Bus, 
  MapPin, 
  Users, 
  TrendingUp, 
  Building2, 
  Route, 
  Car, 
  Edit, 
  Trash2, 
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Calendar,
  Clock,
  Star
} from "lucide-react"
import React from "react"

type Vehicle = { id: number; name: string; regNumber: string; capacity: number };

export default function OwnerDashboard() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedSaccoIdx, setSelectedSaccoIdx] = useState(0)
  const [saccoForm, setSaccoForm] = useState({ 
    saccoName: "", 
    routeStart: "", 
    routeEnd: "", 
    busStops: "",
    companyName: "",
    businessLicense: "",
    address: "",
    phone: ""
  })
  const [addingSacco, setAddingSacco] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    regNumber: "",
    capacity: 30,
  })
  const [editId, setEditId] = useState<number | null>(null)
  const [animateIn, setAnimateIn] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  // Fetch session on mount
  useEffect(() => {
    async function fetchSession() {
      setLoading(true)
      try {
        const sessionRes = await fetch("/api/auth/session")
        if (!sessionRes.ok) {
          setSession(null)
          setLoading(false)
          return
        }
        const sessionData = await sessionRes.json()
        // Handle both old format { user: session } and new format session
        setSession(sessionData.user || sessionData)
      } catch (error) {
        console.error('Error fetching session:', error)
      }
      setLoading(false)
    }
    fetchSession()
  }, [])

  // Fetch companies function
  const fetchCompanies = async () => {
    if (!session?.email) {
      console.log('No session email found')
      return
    }
    
    try {
      console.log('Fetching companies for email:', session.email)
      console.log('Session data:', session)
      
      const res = await fetch("/api/companies/my")
      console.log('Response status:', res.status)
      
      if (!res.ok) {
        console.error('Failed to fetch companies:', res.status)
        const errorText = await res.text()
        console.error('Error response:', errorText)
        return
      }
      
      const mine = await res.json()
      console.log('My companies:', mine)
      setCompanies(mine)
      
      if (mine.length > 0 && mine[0].saccos.length > 0) {
        setSelectedSaccoIdx(0)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  // Fetch all companies for this owner
  useEffect(() => {
    fetchCompanies()
  }, [session])

  // Trigger entrance animation
  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 100)
  }, [])

  // Get selected sacco
  const selectedSacco = companies.length > 0 && companies[0].saccos.length > 0 ? companies[0].saccos[selectedSaccoIdx] : null
  const vehicles: Vehicle[] = selectedSacco ? selectedSacco.vehicles : []
  const saccoRoute: string = selectedSacco ? selectedSacco.route : ""

  // Save sacco to API
  const saveSacco = async (saccoName: string, routeStart: string, routeEnd: string, busStops: string[], vehicles: any[], ownerName: string) => {
    if (!ownerName) return
    
    const route = `${routeStart} - ${routeEnd}`
    
    console.log('Saving sacco:', {
      ownerName,
      saccoName,
      route,
      routeStart,
      routeEnd,
      busStops,
      vehicles,
    })
    
    try {
      const response = await fetch("/api/saccos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerName,
          saccoName,
          routeStart,
          routeEnd,
          busStops: JSON.stringify(busStops), // Store as JSON string
          companyName: saccoForm.companyName,
          businessLicense: saccoForm.businessLicense,
          address: saccoForm.address,
          phone: saccoForm.phone,
        }),
      })
      
      const result = await response.json()
      console.log('Save response:', result)
      
      if (result.success) {
        // Auto-refresh the data
        await fetchCompanies()
        console.log('✅ Sacco saved successfully, data refreshed')
        return true
      } else {
        console.error('Failed to save sacco:', result.error)
        return false
      }
    } catch (error) {
      console.error('Error saving sacco:', error)
      return false
    }
  }

  // Sacco form handlers
  const handleSaccoFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaccoForm({ ...saccoForm, [e.target.name]: e.target.value })
  }
  const handleAddSacco = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!saccoForm.saccoName.trim() || !saccoForm.routeStart.trim() || !saccoForm.routeEnd.trim()) return
    
    setIsSubmitting(true)
    setSubmitMessage("")
    
    try {
      // Parse bus stops from comma-separated string
      const busStops = saccoForm.busStops
        .split(',')
        .map(stop => stop.trim())
        .filter(stop => stop.length > 0)
      
      const success = await saveSacco(
        saccoForm.saccoName.trim(), 
        saccoForm.routeStart.trim(), 
        saccoForm.routeEnd.trim(), 
        busStops, 
        [],
        session.name
      )
      
      if (success) {
        setSubmitMessage("Sacco registered successfully!")
        setTimeout(() => {
          setSaccoForm({ 
            saccoName: "", 
            routeStart: "", 
            routeEnd: "", 
            busStops: "",
            companyName: "",
            businessLicense: "",
            address: "",
            phone: ""
          })
          setAddingSacco(false)
          setSubmitMessage("")
        }, 2000)
      } else {
        setSubmitMessage("Failed to register sacco. Please try again.")
      }
    } catch (error) {
      setSubmitMessage("Failed to register sacco. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Vehicle form handlers
  const handleVehicleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVehicleForm({
      ...vehicleForm,
      [e.target.name]: e.target.name === "capacity" ? Number(e.target.value) : e.target.value,
    })
  }
  const handleAddOrEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSacco) return
    let newVehicles
    if (editId !== null) {
      newVehicles = vehicles.map(v => v.id === editId ? { ...vehicleForm, id: editId } : v)
      setEditId(null)
    } else {
      newVehicles = [
        ...vehicles,
        { ...vehicleForm, id: `temp_${Date.now()}` }, // Use temporary ID for new vehicles
      ]
    }
    setVehicleForm({ name: "", regNumber: "", capacity: 30 })
    console.log('Adding/editing vehicle with vehicles:', newVehicles)
    await saveSacco(selectedSacco.saccoName, selectedSacco.routeStart, selectedSacco.routeEnd, selectedSacco.busStops, newVehicles, session.name)
  }
  const handleEditVehicle = (id: number) => {
    const v = vehicles.find((v: any) => v.id === id)
    if (v) {
      setVehicleForm({ name: v.name, regNumber: v.regNumber, capacity: v.capacity })
      setEditId(id)
    }
  }
  const handleDeleteVehicle = async (id: number) => {
    if (!selectedSacco) return
    const newVehicles = vehicles.filter((v: any) => v.id !== id)
    setVehicleForm({ name: "", regNumber: "", capacity: 30 })
    setEditId(null)
    await saveSacco(selectedSacco.saccoName, selectedSacco.routeStart, selectedSacco.routeEnd, selectedSacco.busStops, newVehicles, session.name)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="bg-red-100 text-red-600 p-4 rounded-2xl mx-auto mb-6 w-16 h-16 flex items-center justify-center">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Logged In</h2>
            <p className="text-gray-600 mb-6">Please log in to access the owner dashboard.</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (session.role !== "owner") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="bg-red-100 text-red-600 p-4 rounded-2xl mx-auto mb-6 w-16 h-16 flex items-center justify-center">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need owner privileges to access this dashboard.</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex relative z-10">
        {/* Enhanced Sidebar */}
        <aside className="w-80 bg-white/90 backdrop-blur-sm border-r border-white/20 shadow-xl">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-xl shadow-lg">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold text-lg text-gray-800">Owner Dashboard</div>
                <div className="text-sm text-gray-500">Fleet Management</div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-100">
              <div className="text-sm text-gray-600 mb-1">Welcome back,</div>
              <div className="font-semibold text-gray-800">{session.name}</div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Route className="h-5 w-5 text-green-600" />
                My Saccos
              </h3>
              <Badge className="bg-green-100 text-green-800">
                {companies.length > 0 && companies[0].saccos ? companies[0].saccos.length : 0}
              </Badge>
            </div>
            
            {companies.length === 0 || companies[0].saccos.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-gray-100 text-gray-400 p-4 rounded-xl mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <Bus className="h-8 w-8" />
                </div>
                <p className="text-gray-500 text-sm mb-4">No saccos yet. Add your first sacco to get started.</p>
                <Button 
                  onClick={() => setAddingSacco(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sacco
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {companies[0].saccos.map((s: any, idx: number) => (
                  <div key={s.saccoName} className="group">
                    <button
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedSaccoIdx === idx 
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-lg" 
                          : "bg-white hover:bg-gray-50 border-gray-200 hover:border-green-300 hover:shadow-md"
                      }`}
                      onClick={() => setSelectedSaccoIdx(idx)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{s.saccoName}</div>
                        {selectedSaccoIdx === idx && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className={`text-sm ${selectedSaccoIdx === idx ? 'text-green-100' : 'text-gray-500'}`}>
                        {s.vehicles?.length || 0} vehicles
                      </div>
                    </button>
                    {selectedSaccoIdx === idx && s.vehicles && s.vehicles.length > 0 && (
                      <div className="mt-3 ml-4 space-y-2">
                        {s.vehicles.slice(0, 3).map((v: any) => (
                          <div key={v.id} className="flex items-center gap-2 text-sm text-gray-600">
                            <Car className="h-4 w-4 text-green-500" />
                            <span>{v.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {v.regNumber}
                            </Badge>
                          </div>
                        ))}
                        {s.vehicles.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{s.vehicles.length - 3} more vehicles
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <Button 
                  onClick={() => setAddingSacco(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Sacco
                </Button>
              </div>
            )}
          </div>

          <div className="mt-auto p-6 border-t border-gray-200">
            <Link href="/logout" className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg group-hover:bg-red-200 transition-colors">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-medium">Log out</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className={`transition-all duration-1000 ${
            animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Saccos</p>
                      <p className="text-3xl font-bold">{companies.length > 0 && companies[0].saccos ? companies[0].saccos.length : 0}</p>
                    </div>
                    <div className="bg-blue-400/20 p-3 rounded-xl">
                      <Building2 className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Vehicles</p>
                      <p className="text-3xl font-bold">
                        {companies.length > 0 && companies[0].saccos 
                          ? companies[0].saccos.reduce((acc: number, sacco: any) => acc + (sacco.vehicles?.length || 0), 0)
                          : 0
                        }
                      </p>
                    </div>
                    <div className="bg-green-400/20 p-3 rounded-xl">
                      <Car className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Active Routes</p>
                      <p className="text-3xl font-bold">{companies.length > 0 && companies[0].saccos ? companies[0].saccos.length : 0}</p>
                    </div>
                    <div className="bg-purple-400/20 p-3 rounded-xl">
                      <Route className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Total Capacity</p>
                      <p className="text-3xl font-bold">
                        {companies.length > 0 && companies[0].saccos 
                          ? companies[0].saccos.reduce((acc: number, sacco: any) => 
                              acc + (sacco.vehicles?.reduce((vAcc: number, v: any) => vAcc + (v.capacity || 0), 0) || 0), 0)
                          : 0
                        }
                      </p>
                    </div>
                    <div className="bg-orange-400/20 p-3 rounded-xl">
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Sacco Modal */}
            {addingSacco && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 border-white/20 shadow-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-2 rounded-lg">
                          <Plus className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl">Register New Sacco</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setAddingSacco(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddSacco} className="space-y-4">
                      <div>
                        <Label htmlFor="saccoName" className="text-sm font-medium text-gray-700">Sacco Name</Label>
                        <Input
                          id="saccoName"
                          name="saccoName"
                          value={saccoForm.saccoName}
                          onChange={handleSaccoFormChange}
                          className="h-12 px-4 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                          placeholder="Enter sacco name"
                          required
                        />
                      </div>
                      
                      {/* Company Information Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          Company Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company Name</Label>
                            <Input
                              id="companyName"
                              name="companyName"
                              value={saccoForm.companyName}
                              onChange={handleSaccoFormChange}
                              className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="e.g. Latema Transport Ltd"
                            />
                          </div>
                          <div>
                            <Label htmlFor="businessLicense" className="text-sm font-medium text-gray-700">Business License</Label>
                            <Input
                              id="businessLicense"
                              name="businessLicense"
                              value={saccoForm.businessLicense}
                              onChange={handleSaccoFormChange}
                              className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="e.g. LIC001"
                            />
                          </div>
                          <div>
                            <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                            <Input
                              id="address"
                              name="address"
                              value={saccoForm.address}
                              onChange={handleSaccoFormChange}
                              className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="e.g. Nairobi, Kenya"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={saccoForm.phone}
                              onChange={handleSaccoFormChange}
                              className="h-12 px-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="e.g. +254700123456"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Route Information Section */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Route className="h-4 w-4 text-green-600" />
                          Route Information
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="routeStart" className="text-sm font-medium text-gray-700">Route Start</Label>
                            <Input
                              id="routeStart"
                              name="routeStart"
                              value={saccoForm.routeStart}
                              onChange={handleSaccoFormChange}
                              className="h-12 px-4 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                              placeholder="e.g. Nairobi"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="routeEnd" className="text-sm font-medium text-gray-700">Route End</Label>
                            <Input
                              id="routeEnd"
                              name="routeEnd"
                              value={saccoForm.routeEnd}
                              onChange={handleSaccoFormChange}
                              className="h-12 px-4 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                              placeholder="e.g. Kisumu"
                              required
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label htmlFor="busStops" className="text-sm font-medium text-gray-700">Bus Stops</Label>
                          <Input
                            id="busStops"
                            name="busStops"
                            value={saccoForm.busStops}
                            onChange={handleSaccoFormChange}
                            className="h-12 px-4 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                            placeholder="e.g. Mombasa, Kakamega, Nakuru"
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter bus stops between start and end points, separated by commas</p>
                        </div>
                      </div>
                      {submitMessage && (
                        <div className={`p-4 rounded-xl ${
                          submitMessage.includes("successfully") 
                            ? "bg-green-50 border border-green-200 text-green-800" 
                            : "bg-red-50 border border-red-200 text-red-800"
                        }`}>
                          <div className="flex items-center gap-2">
                            {submitMessage.includes("successfully") ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className="font-medium">{submitMessage}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setAddingSacco(false)}
                          className="px-6 py-2"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              Registering...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Register Sacco
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sacco and Vehicle Management */}
            {selectedSacco ? (
              <div className="space-y-8">
                {/* Sacco Details Card */}
                <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl shadow-lg">
                        <Route className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-gray-800">{selectedSacco.saccoName}</CardTitle>
                        <p className="text-gray-500">Route Management</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          <Label className="text-sm font-semibold text-gray-700">Route</Label>
                        </div>
                        <div className="text-xl font-bold text-gray-800">
                          {selectedSacco.routeStart} → {selectedSacco.routeEnd}
                        </div>
                      </div>
                      
                      {selectedSacco.busStops && selectedSacco.busStops.length > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-5 w-5 text-green-600" />
                            <Label className="text-sm font-semibold text-gray-700">Bus Stops</Label>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedSacco.busStops.map((stop: string, index: number) => (
                              <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                                {stop}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Management Card */}
                <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-xl shadow-lg">
                          <Car className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-gray-800">Vehicle Fleet</CardTitle>
                          <p className="text-gray-500">Manage your vehicles</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {vehicles.length} vehicles
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add Vehicle Form */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-green-600" />
                        {editId !== null ? 'Edit Vehicle' : 'Add New Vehicle'}
                      </h3>
                      <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleAddOrEditVehicle}>
                        <div>
                          <Label htmlFor="vehicleName" className="text-sm font-medium text-gray-700">Vehicle Name</Label>
                          <Input
                            id="vehicleName"
                            name="name"
                            value={vehicleForm.name}
                            onChange={handleVehicleFormChange}
                            className="h-12 px-4 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                            placeholder="e.g. Express Bus"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="regNumber" className="text-sm font-medium text-gray-700">Registration</Label>
                          <Input
                            id="regNumber"
                            name="regNumber"
                            value={vehicleForm.regNumber}
                            onChange={handleVehicleFormChange}
                            className="h-12 px-4 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                            placeholder="e.g. KCA 123A"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="capacity" className="text-sm font-medium text-gray-700">Capacity</Label>
                          <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            min={1}
                            value={vehicleForm.capacity}
                            onChange={handleVehicleFormChange}
                            className="h-12 px-4 border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all duration-300"
                            placeholder="30"
                            required
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            {editId !== null ? "Update" : "Add Vehicle"}
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Vehicles Table */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      {vehicles.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="bg-gray-100 text-gray-400 p-4 rounded-xl mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                            <Car className="h-8 w-8" />
                          </div>
                          <p className="text-gray-500 mb-4">No vehicles added yet.</p>
                          <p className="text-sm text-gray-400">Add your first vehicle to start managing your fleet.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Registration</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Capacity</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Route</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {vehicles.map((v: Vehicle, idx: number): React.ReactElement => (
                                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                                        <Car className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-800">{v.name}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge variant="outline" className="font-mono">
                                      {v.regNumber}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4 text-gray-400" />
                                      <span className="font-medium text-gray-800">{v.capacity}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Route className="h-4 w-4" />
                                      {saccoRoute}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleEditVehicle(v.id)}
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleDeleteVehicle(v.id)}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-100 text-gray-400 p-6 rounded-2xl mx-auto mb-6 w-20 h-20 flex items-center justify-center">
                  <Route className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Sacco Selected</h3>
                <p className="text-gray-500 mb-6">Select a sacco from the sidebar to manage or add a new one to get started.</p>
                <Button 
                  onClick={() => setAddingSacco(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Sacco
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
} 