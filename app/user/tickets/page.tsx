"use client"

import { useEffect, useState } from "react";

import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download } from "lucide-react"
import { QRCodeCanvas as QRCode } from "qrcode.react";

export default function UserTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

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

  const openModal = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
  };

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
                  <div
                    key={ticket.id}
                    className="rounded-lg border p-4 shadow hover:bg-accent cursor-pointer flex items-center"
                    onClick={() => openModal(ticket)}
                  >
                    <div className="mr-4">
                      <QRCode
                        value={ticket.qr_code || ticket.qrCode || String(ticket.id)}
                        size={64}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{ticket.from_stop} → {ticket.to_stop}</div>
                      <div className="text-sm text-muted-foreground">Status: {ticket.status}</div>
                      <div className="text-sm text-muted-foreground">Fare: KES {ticket.fare}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Modal for ticket details */}
          {showModal && selectedTicket && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  onClick={closeModal}
                >
                  ×
                </button>
                <h2 className="text-xl font-bold mb-4">Ticket Details</h2>
                <div className="flex flex-col items-center mb-4">
                  <QRCode
                    value={selectedTicket.qr_code || selectedTicket.qrCode || String(selectedTicket.id)}
                    size={192}
                  />
                </div>
                <div className="space-y-2">
                  <div><b>From:</b> {selectedTicket.from_stop}</div>
                  <div><b>To:</b> {selectedTicket.to_stop}</div>
                  <div><b>Status:</b> {selectedTicket.status}</div>
                  <div><b>Fare:</b> KES {selectedTicket.fare}</div>
                  <div><b>Booked At:</b> {selectedTicket.booked_at || selectedTicket.bookedAt}</div>
                  <div><b>Ticket ID:</b> {selectedTicket.id}</div>
                  <div><b>QR Code:</b> {selectedTicket.qr_code || selectedTicket.qrCode}</div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button className="btn btn-secondary" onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
