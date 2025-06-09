import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Ticket } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 text-white p-2 rounded-full">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Kenya Bus Tracker</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/sandbox/route-optimization" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded">New</span>
              <span>Route Optimizer</span>
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
            <Link href="/help" className="text-gray-600 hover:text-gray-900">
              Help
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 grid md:grid-cols-2">
        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="max-w-md space-y-6">
            <div className="flex justify-center">
              <div className="bg-orange-500 text-white p-4 rounded-full">
                <MapPin className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
            <p className="text-center text-gray-500">Sign in to your account to continue</p>
            <div className="flex gap-4">
              <Link href="/login?type=user" className="flex-1">
                <Button variant="outline" className="w-full">
                  User Login
                </Button>
              </Link>
              <Link href="/login?type=driver" className="flex-1">
                <Button variant="outline" className="w-full">
                  Driver Login
                </Button>
              </Link>
              <Link href="/login?type=owner" className="flex-1">
                <Button variant="outline" className="w-full">
                  Owner Login
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <span className="text-gray-500">Don&apos;t have an account? </span>
              <Link href="/register" className="text-orange-500 hover:underline">
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white flex items-center justify-center p-10 hidden md:flex">
          <div className="max-w-md space-y-8">
            <h2 className="text-4xl font-bold">Track Kenya&apos;s Buses in Real-Time</h2>
            <p className="text-xl">
              Get real-time information about bus schedules, routes, and availability. No more waiting at stations!
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-6 w-6 shrink-0 mt-0.5" />
                <span>Find the nearest bus station based on your location</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-6 w-6 shrink-0 mt-0.5" />
                <span>View upcoming buses with route and fare information</span>
              </li>
              <li className="flex items-start gap-3">
                <Ticket className="h-6 w-6 shrink-0 mt-0.5" />
                <span>Book tickets in advance or purchase them on the go</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-500">
          © {new Date().getFullYear()} Kenya Bus Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
