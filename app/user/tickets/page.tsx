"use client"

import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"

export default function UserTickets() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="user" userName="John Passenger" userEmail="passenger@example.com" />

      <div className="flex-1 flex flex-col">
        <Header userName="John Passenger" notificationCount={3} />

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">My Tickets</h1>
              <p className="text-muted-foreground">View and manage your bus tickets</p>
            </div>

            <Tabs defaultValue="upcoming">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upcoming">Upcoming Trips</TabsTrigger>
                <TabsTrigger value="past">Past Trips</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          In Progress
                        </div>
                        <h3 className="text-lg font-medium">Ticket #1</h3>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div>
                        <h4 className="text-xl font-semibold">Nairobi - Mombasa</h4>
                        <p className="text-gray-500">Bus KBZ 123C • Seat 5</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">KSh 2000</div>
                        <p className="text-sm text-gray-500">Ticket Fare</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
                      <div className="flex flex-col items-center md:items-start">
                        <div className="text-lg font-medium">11:08 PM</div>
                        <div className="text-sm text-gray-500">Departure</div>
                      </div>

                      <div className="my-4 md:my-0 w-full md:w-auto flex items-center justify-center">
                        <div className="h-1 w-24 md:w-32 bg-orange-200 rounded-l-full"></div>
                        <div className="h-1 w-24 md:w-32 bg-gray-200 rounded-r-full"></div>
                      </div>

                      <div className="flex flex-col items-center md:items-end">
                        <div className="text-lg font-medium">3:08 AM</div>
                        <div className="text-sm text-gray-500">Arrival (Est.)</div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t space-y-2">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Tuesday, April 8, 2025</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>Passenger: John Passenger</span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3 justify-end">
                      <Button variant="outline">View Details</Button>
                      <Button variant="destructive">Cancel Ticket</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="past">
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No past trips found</h3>
                  <p className="text-gray-500">Your completed trips will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
