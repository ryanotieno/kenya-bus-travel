"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

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

export default function DriverRegister() {
  const [saccos, setSaccos] = useState<Sacco[]>([])
  const [selectedSacco, setSelectedSacco] = useState<string>("")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    license: "",
    experience: "",
    password: ""
  })
  const [status, setStatus] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    async function fetchSaccos() {
      const res = await fetch("/api/companies")
      const companies = await res.json()
      // Flatten all saccos from all companies
      const allSaccos = companies.flatMap((c: any) => c.saccos)
      setSaccos(allSaccos)
    }
    fetchSaccos()
  }, [])

  useEffect(() => {
    const sacco = saccos.find(s => s.saccoName === selectedSacco)
    setVehicles(sacco ? sacco.vehicles : [])
    setSelectedVehicle("")
  }, [selectedSacco, saccos])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("")
    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sacco: selectedSacco,
          vehicle: selectedVehicle,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus("Registration successful! Redirecting to login...")
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          license: "",
          experience: "",
          password: ""
        })
        setSelectedSacco("")
        setSelectedVehicle("")
        setTimeout(() => {
          router.push("/login?type=driver")
        }, 1500)
      } else {
        setStatus(data.error || "Registration failed.")
      }
    } catch (err) {
      setStatus("Registration failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Driver Registration</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleFormChange} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleFormChange} required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="license">Driver's License Number</Label>
              <Input id="license" name="license" value={form.license} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" name="experience" type="number" min="0" value={form.experience} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={handleFormChange} required />
            </div>
            <div>
              <Label htmlFor="sacco">Sacco</Label>
              <Select value={selectedSacco} onValueChange={setSelectedSacco} required>
                <SelectTrigger id="sacco">
                  <SelectValue placeholder="Select Sacco" />
                </SelectTrigger>
                <SelectContent>
                  {saccos.map(sacco => (
                    <SelectItem key={sacco.saccoName} value={sacco.saccoName}>
                      {sacco.saccoName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vehicle">Vehicle</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle} disabled={!selectedSacco || vehicles.length === 0} required>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder={selectedSacco ? (vehicles.length ? "Select Vehicle" : "No vehicles available") : "Select Sacco first"} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.regNumber}>
                      {vehicle.name} ({vehicle.regNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {status && (
              <div className={status.includes("success") ? "text-green-600" : "text-red-600"}>{status}</div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="submit">Register</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 