"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, Clock, Ticket, Heart, Settings, LogOut, Bus, Printer, Calculator, History } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SidebarWrapperProps {
  userType: "user" | "driver"
  userName: string
  userEmail: string
}

export function SidebarWrapper({ userType, userName, userEmail }: SidebarWrapperProps) {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path

  const userInitial = userName.charAt(0).toUpperCase()
  const basePath = userType === "user" ? "/user" : "/driver"

  return (
    <div className="w-64 min-h-screen bg-white border-r flex-shrink-0">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-orange-100 text-orange-800">{userInitial}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {userType === "user" ? (
            <>
              <Link
                href={`${basePath}/dashboard`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  isActive(`${basePath}/dashboard`)
                    ? "bg-orange-100 text-orange-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MapPin className="h-5 w-5" />
                <span>Nearby Stations</span>
              </Link>
              <Link
                href={`${basePath}/upcoming-buses`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  isActive(`${basePath}/upcoming-buses`)
                    ? "bg-orange-100 text-orange-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Clock className="h-5 w-5" />
                <span>Upcoming Buses</span>
              </Link>
              <Link
                href={`${basePath}/tickets`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  isActive(`${basePath}/tickets`)
                    ? "bg-orange-100 text-orange-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Ticket className="h-5 w-5" />
                <span>My Tickets</span>
              </Link>
              <Link
                href={`${basePath}/favorite-routes`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  isActive(`${basePath}/favorite-routes`)
                    ? "bg-orange-100 text-orange-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Heart className="h-5 w-5" />
                <span>Favorite Routes</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href={`${basePath}/dashboard`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  isActive(`${basePath}/dashboard`)
                    ? "bg-orange-100 text-orange-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Bus className="h-5 w-5" />
                <span>Current Trip</span>
              </Link>
              <Link
                href={`${basePath}/tickets`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  isActive(`${basePath}/tickets`)
                    ? "bg-orange-100 text-orange-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Printer className="h-5 w-5" />
                <span>Print Tickets</span>
              </Link>
              <Link
                href={`${basePath}/calculate`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  isActive(`${basePath}/calculate`)
                    ? "bg-orange-100 text-orange-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Calculator className="h-5 w-5" />
                <span>Calculate Trip Cost</span>
              </Link>
              <Link
                href={`${basePath}/history`}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  isActive(`${basePath}/history`)
                    ? "bg-orange-100 text-orange-800 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <History className="h-5 w-5" />
                <span>Trip History</span>
              </Link>
            </>
          )}
          <Link
            href={`${basePath}/settings`}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
              isActive(`${basePath}/settings`)
                ? "bg-orange-100 text-orange-800 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-2 border-t">
          <Link
            href="/logout"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
