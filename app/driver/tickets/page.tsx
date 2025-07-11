"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Printer, Search } from "lucide-react"
import { QrReader } from "react-qr-reader";

interface Ticket {
  id: string
  passenger: string
  seat: string
  route: string
}

export default function PrintTickets() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [driver, setDriver] = useState<any>(null)
  const [vehicle, setVehicle] = useState<any>(null)
  const [sacco, setSacco] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [scanModal, setScanModal] = useState(false);
  const [scannedTicket, setScannedTicket] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionAndData = async () => {
      try {
        // Get current user session
        const sessionResponse = await fetch('/api/auth/session')
        if (!sessionResponse.ok) {
          console.error('Not logged in')
          return
        }
        const sessionData = await sessionResponse.json()
        // Handle both old and new session formats
        const user = sessionData.user || sessionData
        setSession(user)

        // Fetch driver data
        const driversResponse = await fetch('/api/drivers')
        const drivers = await driversResponse.json()
        const currentDriver = drivers.find((d: any) => d.email === sessionData.email)
        
        if (currentDriver) {
          setDriver(currentDriver)
          
          // Fetch companies data to get vehicle and sacco details
          const companiesResponse = await fetch('/api/companies')
          const companies = await companiesResponse.json()
          
          // Find the sacco and vehicle for this driver
          for (const company of companies) {
            for (const saccoData of company.saccos) {
              if (saccoData.saccoName === currentDriver.sacco) {
                setSacco(saccoData)
                
                // Find the specific vehicle
                const vehicleData = saccoData.vehicles.find((v: any) => v.regNumber === currentDriver.vehicle)
                if (vehicleData) {
                  setVehicle(vehicleData)
                  
                  // Generate sample tickets based on the vehicle capacity and route
                  const routeName = saccoData.route || `${saccoData.routeStart || ''} - ${saccoData.routeEnd || ''}`
                  const sampleTickets: Ticket[] = []
                  
                  for (let i = 1; i <= vehicleData.capacity; i++) {
                    sampleTickets.push({
                      id: `TKT-${Date.now()}-${i.toString().padStart(3, '0')}`,
                      passenger: `Passenger ${i}`,
                      seat: i.toString(),
                      route: routeName
                    })
                  }
                  
                  setTickets(sampleTickets)
                }
                break
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessionAndData()
  }, [])

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.passenger.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleTicket = (id: string) => {
    if (selectedTickets.includes(id)) {
      setSelectedTickets(selectedTickets.filter((ticketId) => ticketId !== id))
    } else {
      setSelectedTickets([...selectedTickets, id])
    }
  }

  const selectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(filteredTickets.map((ticket) => ticket.id))
    }
  }

  const printSelectedTickets = () => {
    alert(`Printing tickets: ${selectedTickets.join(", ")}`)
  }

  const handleScan = async (data: string | null) => {
    if (data) {
      setScanError(null);
      setScanModal(false);
      // Fetch ticket details from API
      try {
        const res = await fetch(`/api/tickets/scan?code=${encodeURIComponent(data)}`);
        const json = await res.json();
        if (json.ticket) {
          setScannedTicket(json.ticket);
        } else {
          setScannedTicket(null);
          setScanError(json.error || "Ticket not found");
        }
      } catch (err) {
        setScanError("Failed to fetch ticket details");
      }
    }
  };

  const handleError = (err: any) => {
    setScanError("QR scan error: " + (err?.message || err));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading ticket data...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Not Logged In</h2>
          <p className="text-gray-600">Please log in to access ticket management.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <SidebarWrapper userType="driver" userName={session.name} userEmail={session.email} />

      <div className="flex-1 flex flex-col">
        <Header userName={session.name} notificationCount={2} />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Print Tickets</h1>
                <p className="text-muted-foreground">Search and print tickets for passengers</p>
              </div>
              <Button onClick={() => setScanModal(true)} variant="default">
                Scan Ticket QR
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Management</CardTitle>
                <CardDescription>
                  Select tickets to print for the current trip - {vehicle?.regNumber || driver?.vehicle} • {sacco?.saccoName || driver?.sacco}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search by ticket ID or passenger name"
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" onClick={selectAll} className="whitespace-nowrap">
                      {selectedTickets.length === filteredTickets.length ? "Deselect All" : "Select All"}
                    </Button>
                    <Button
                      onClick={printSelectedTickets}
                      disabled={selectedTickets.length === 0}
                      className="whitespace-nowrap"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print Selected
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Select
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Ticket ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Passenger
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Seat
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Route
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTickets.length > 0 ? (
                          filteredTickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-orange-600 border-gray-300 rounded"
                                    checked={selectedTickets.includes(ticket.id)}
                                    onChange={() => toggleTicket(ticket.id)}
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{ticket.id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{ticket.passenger}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{ticket.seat}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{ticket.route}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button variant="ghost" size="sm">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                              No tickets found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Print Receipt</CardTitle>
                <CardDescription>Generate a receipt for the entire trip</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="trip-id">Trip ID</Label>
                      <Input id="trip-id" defaultValue={`TRIP-${Date.now()}`} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bus-id">Bus ID</Label>
                      <Input id="bus-id" defaultValue={vehicle?.regNumber || driver?.vehicle || ''} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="route">Route</Label>
                      <Input id="route" defaultValue="Nairobi - Mombasa" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" defaultValue="2025-04-08" />
                    </div>
                  </div>

                  <Button className="w-full md:w-auto">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Trip Receipt
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* QR Scanner Modal */}
            {scanModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setScanModal(false)}>×</button>
                  <h2 className="text-xl font-bold mb-4">Scan Ticket QR Code</h2>
                  <div style={{ width: "100%" }}>
                    <QrReader
                      constraints={{ facingMode: "environment" }}
                      onResult={(result: any, error: any) => {
                        if (!!result) handleScan(result.getText());
                        if (!!error) handleError(error);
                      }}
                    />
                  </div>
                  {scanError && <div className="text-red-600 mt-2">{scanError}</div>}
                </div>
              </div>
            )}
            {/* Ticket Details Modal */}
            {scannedTicket && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setScannedTicket(null)}>×</button>
                  <h2 className="text-xl font-bold mb-4">Ticket Details</h2>
                  <div className="space-y-2">
                    <div><b>From:</b> {scannedTicket.from_stop}</div>
                    <div><b>To:</b> {scannedTicket.to_stop}</div>
                    <div><b>Status:</b> {scannedTicket.status}</div>
                    <div><b>Fare:</b> KES {scannedTicket.fare}</div>
                    <div><b>Booked At:</b> {scannedTicket.booked_at}</div>
                    <div><b>Ticket ID:</b> {scannedTicket.id}</div>
                    <div><b>QR Code:</b> {scannedTicket.qr_code}</div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <button className="btn btn-secondary" onClick={() => setScannedTicket(null)}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
