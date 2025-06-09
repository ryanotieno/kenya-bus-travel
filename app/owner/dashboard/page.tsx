"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { LogOut } from "lucide-react"
import React from "react"

type Vehicle = { id: number; name: string; regNumber: string; capacity: number };

export default function OwnerDashboard() {
  // TODO: Replace this with real session data
  const userRole = "owner"; // or "user"/"driver" for demo
  const ownerEmail = "owner@demo.com"; // Mocked owner email

  const [companies, setCompanies] = useState<any[]>([])
  const [selectedSaccoIdx, setSelectedSaccoIdx] = useState(0)
  const [saccoForm, setSaccoForm] = useState({ saccoName: "", route: "" })
  const [addingSacco, setAddingSacco] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({
    name: "",
    regNumber: "",
    capacity: 30,
  })
  const [editId, setEditId] = useState<number | null>(null)

  // Fetch all companies for this owner
  useEffect(() => {
    async function fetchCompanies() {
      const res = await fetch("/api/companies")
      const all = await res.json()
      const mine = all.filter((c: any) => c.ownerEmail === ownerEmail)
      setCompanies(mine)
      if (mine.length > 0 && mine[0].saccos.length > 0) {
        setSelectedSaccoIdx(0)
      }
    }
    fetchCompanies()
  }, [])

  // Get selected sacco
  const selectedSacco = companies.length > 0 && companies[0].saccos.length > 0 ? companies[0].saccos[selectedSaccoIdx] : null
  const vehicles: Vehicle[] = selectedSacco ? selectedSacco.vehicles : []
  const saccoRoute: string = selectedSacco ? selectedSacco.route : ""

  // Save sacco to API
  const saveSacco = async (saccoName: string, route: string, vehicles: any[]) => {
    await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerEmail,
        saccoName,
        route,
        vehicles,
      }),
    })
    // Refresh sidebar
    const res = await fetch("/api/companies")
    const all = await res.json()
    const mine = all.filter((c: any) => c.ownerEmail === ownerEmail)
    setCompanies(mine)
  }

  // Sacco form handlers
  const handleSaccoFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaccoForm({ ...saccoForm, [e.target.name]: e.target.value })
  }
  const handleAddSacco = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!saccoForm.saccoName.trim() || !saccoForm.route.trim()) return
    await saveSacco(saccoForm.saccoName.trim(), saccoForm.route.trim(), [])
    setSaccoForm({ saccoName: "", route: "" })
    setAddingSacco(false)
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
        { ...vehicleForm, id: Date.now() },
      ]
    }
    setVehicleForm({ name: "", regNumber: "", capacity: 30 })
    await saveSacco(selectedSacco.saccoName, selectedSacco.route, newVehicles)
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
    await saveSacco(selectedSacco.saccoName, selectedSacco.route, newVehicles)
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="font-bold text-lg mb-2">My Saccos</div>
          {companies.length === 0 || companies[0].saccos.length === 0 ? (
            <div className="text-gray-400 text-sm">No saccos yet.</div>
          ) : (
            <ul>
              {companies[0].saccos.map((s: any, idx: number) => (
                <li key={s.saccoName} className="mb-2">
                  <button
                    className={`w-full text-left px-2 py-1 rounded ${selectedSaccoIdx === idx ? "bg-orange-100 text-orange-800 font-semibold" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedSaccoIdx(idx)}
                  >
                    {s.saccoName}
                  </button>
                  <ul className="ml-4 mt-1">
                    {s.vehicles.map((v: any) => (
                      <li key={v.id} className="text-xs text-gray-600">• {v.name} ({v.regNumber})</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          <Button className="mt-4 w-full" onClick={() => setAddingSacco(true)}>
            + Add Sacco
          </Button>
        </div>
        <div className="mt-auto p-4 border-t">
          <Link href="/logout" className="flex items-center gap-2 text-gray-700 hover:text-orange-600">
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </Link>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center py-8">
        {/* Add Sacco Modal */}
        {addingSacco && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Register New Sacco</h2>
              <form onSubmit={handleAddSacco} className="space-y-4">
                <div>
                  <Label htmlFor="saccoName">Sacco Name</Label>
                  <Input
                    id="saccoName"
                    name="saccoName"
                    value={saccoForm.saccoName}
                    onChange={handleSaccoFormChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="route">Route</Label>
                  <Input
                    id="route"
                    name="route"
                    value={saccoForm.route}
                    onChange={handleSaccoFormChange}
                    placeholder="e.g. Nairobi - Kisumu"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddingSacco(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Register Sacco</Button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Sacco and Vehicle Management */}
        {selectedSacco ? (
          <>
            <Card className="w-full max-w-xl mb-8">
              <CardHeader>
                <CardTitle>Sacco: {selectedSacco.saccoName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label>Route</Label>
                  <div className="text-lg font-semibold">{selectedSacco.route}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="w-full max-w-xl">
              <CardHeader>
                <CardTitle>Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                {userRole === "owner" && (
                  <form className="flex flex-col md:flex-row gap-2 mb-4" onSubmit={handleAddOrEditVehicle}>
                    <Input
                      name="name"
                      value={vehicleForm.name}
                      onChange={handleVehicleFormChange}
                      placeholder="Vehicle Name"
                      className="flex-1"
                      required
                    />
                    <Input
                      name="regNumber"
                      value={vehicleForm.regNumber}
                      onChange={handleVehicleFormChange}
                      placeholder="Registration Number"
                      className="flex-1"
                      required
                    />
                    <Input
                      name="capacity"
                      type="number"
                      min={1}
                      value={vehicleForm.capacity}
                      onChange={handleVehicleFormChange}
                      placeholder="Capacity"
                      className="w-24"
                      required
                    />
                    <Button type="submit" className="w-32">
                      {editId !== null ? "Update" : "Add Vehicle"}
                    </Button>
                  </form>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 border">Name</th>
                        <th className="px-3 py-2 border">Reg. Number</th>
                        <th className="px-3 py-2 border">Capacity</th>
                        <th className="px-3 py-2 border">Route</th>
                        {userRole === "owner" && <th className="px-3 py-2 border">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.length === 0 ? (
                        <tr>
                          <td colSpan={userRole === "owner" ? 5 : 4} className="text-center py-4 text-gray-400">No vehicles added yet.</td>
                        </tr>
                      ) : (
                        vehicles.map((v: Vehicle, idx: number): React.ReactElement => (
                          <tr key={v.id}>
                            <td className="px-3 py-2 border">{v.name}</td>
                            <td className="px-3 py-2 border">{v.regNumber}</td>
                            <td className="px-3 py-2 border">{v.capacity}</td>
                            <td className="px-3 py-2 border">{saccoRoute}</td>
                            {userRole === "owner" && (
                              <td className="px-3 py-2 border flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditVehicle(v.id)}>Edit</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteVehicle(v.id)}>Delete</Button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-gray-400 text-lg mt-16">Select a Sacco to manage or add a new one.</div>
        )}
      </main>
    </div>
  )
} 