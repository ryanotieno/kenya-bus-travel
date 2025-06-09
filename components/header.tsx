import Link from "next/link"
import { Bell, MapPin } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  userName: string
  notificationCount?: number
}

export function Header({ userName, notificationCount = 0 }: HeaderProps) {
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header className="border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-500 text-white p-1.5 rounded-full">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="font-bold">Kenya Bus Tracker</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-500 text-white p-1.5 rounded-full">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="font-bold">Kenya Bus Tracker</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500">
                {notificationCount}
              </Badge>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-orange-100 text-orange-800">{userInitial}</AvatarFallback>
            </Avatar>
            <span className="font-medium hidden md:inline-block">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
