"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Printer, Search } from "lucide-react"

export default function PrintTickets() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])

  const tickets = [
    { id: "TKT-001", passenger: "John Passenger", seat: "5", route: "Nairobi - Mombasa" },
    { id: "TKT-002", passenger: "Jane Doe", seat: "12", route: "Nairobi - Mombasa" },
    { id: "TKT-003", passenger: "Bob Smith", seat: "18", route: "Nairobi - Mombasa" },
    { id: "TKT-004", passenger: "Alice Johnson", seat: "24", route: "Nairobi - Mombasa" },
  ]

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

  return (
    <div className="min-h-screen flex">
      <SidebarWrapper userType="driver" userName="David Driver" userEmail="driver@example.com" />

      <div className="flex-1 flex flex-col">
        <Header userName="David Driver" notificationCount={2} />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Print Tickets</h1>
              <p className="text-muted-foreground">Search and print tickets for passengers</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Management</CardTitle>
                <CardDescription>Select tickets to print for the current trip</CardDescription>
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
                      <Input id="trip-id" defaultValue="KBZ-123-456" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bus-id">Bus ID</Label>
                      <Input id="bus-id" defaultValue="KBZ 123C" />
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
          </div>
        </main>
      </div>
    </div>
  )
}
