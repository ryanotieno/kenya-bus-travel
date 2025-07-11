"use client"

import { useEffect, useState } from "react";

import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"

export default function UserTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      // Get current user session
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      if (!sessionData.user) {
        setLoading(false);
        return;
      }
      setUser(sessionData.user);
      // Fetch tickets for this user
      const ticketsRes = await fetch(`/api/tickets?userId=${sessionData.user.id}`);
      const ticketsData = await ticketsRes.json();
      setTickets(ticketsData.tickets || []);
      setLoading(false);
    };
    fetchTickets();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div>Loading tickets...</div></div>;
  }
  if (!user) {
    return <div className="flex min-h-screen items-center justify-center"><div>Please log in to view your tickets.</div></div>;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="user" userName={user.name} userEmail={user.email} />
      <div className="flex-1 flex flex-col">
        <Header userName={user.name} notificationCount={3} />
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">My Tickets</h1>
              <p className="text-muted-foreground">View and manage your bus tickets</p>
            </div>
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No tickets found</h3>
                  <p className="text-gray-500">You have not booked any tickets yet.</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg overflow-hidden mb-4">
                    <div className="p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {ticket.status}
                          </div>
                          <h3 className="text-lg font-medium">Ticket #{ticket.id}</h3>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div>
                          <h4 className="text-xl font-semibold">{ticket.from_stop} - {ticket.to_stop}</h4>
                          <p className="text-gray-500">Trip ID: {ticket.trip_id}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">KSh {ticket.fare}</div>
                          <p className="text-sm text-gray-500">Ticket Fare</p>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t space-y-2">
                        <div className="flex items-center gap-2">
                          <span>Booked At: {ticket.booked_at ? new Date(ticket.booked_at).toLocaleString() : "-"}</span>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3 justify-end">
                        <Button variant="outline">View Details</Button>
                        <Button variant="destructive">Cancel Ticket</Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
