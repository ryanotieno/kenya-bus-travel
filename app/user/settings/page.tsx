"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { SidebarWrapper } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Shield, User, MapPin, CreditCard } from "lucide-react"

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [locationTracking, setLocationTracking] = useState(true)

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="user" userName="John Passenger" userEmail="passenger@example.com" />

      <div className="flex-1 flex flex-col">
        <Header userName="John Passenger" notificationCount={3} />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-3xl font-semibold">
                          J
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                        >
                          <User className="h-4 w-4" />
                          <span className="sr-only">Change avatar</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" defaultValue="Passenger" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="passenger@example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" type="tel" defaultValue="+254 712 345 678" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm new password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Update Password</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-orange-500" />
                          <h3 className="font-medium">All Notifications</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Enable or disable all notifications</p>
                      </div>
                      <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Notification Channels</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Email notifications</span>
                          </Label>
                          <Switch
                            id="email-notifications"
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                            disabled={!notificationsEnabled}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Push notifications</span>
                          </Label>
                          <Switch
                            id="push-notifications"
                            checked={pushNotifications}
                            onCheckedChange={setPushNotifications}
                            disabled={!notificationsEnabled}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Notification Types</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="booking-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Booking confirmations</span>
                          </Label>
                          <Switch id="booking-notifications" defaultChecked disabled={!notificationsEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="reminder-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Trip reminders</span>
                          </Label>
                          <Switch id="reminder-notifications" defaultChecked disabled={!notificationsEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="delay-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Delay alerts</span>
                          </Label>
                          <Switch id="delay-notifications" defaultChecked disabled={!notificationsEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="promo-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Promotions and offers</span>
                          </Label>
                          <Switch id="promo-notifications" defaultChecked={false} disabled={!notificationsEnabled} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Manage your privacy preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-orange-500" />
                          <h3 className="font-medium">Location Tracking</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Allow the app to track your location for better service
                        </p>
                      </div>
                      <Switch checked={locationTracking} onCheckedChange={setLocationTracking} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-orange-500" />
                          <h3 className="font-medium">Data Sharing</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Share anonymous usage data to improve our services
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data-retention">Data Retention Period</Label>
                      <Select defaultValue="6months">
                        <SelectTrigger id="data-retention">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3months">3 months</SelectItem>
                          <SelectItem value="6months">6 months</SelectItem>
                          <SelectItem value="1year">1 year</SelectItem>
                          <SelectItem value="forever">Forever</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        This controls how long we keep your trip history and location data
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      Delete My Data
                    </Button>
                    <Button>Save Settings</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-800 p-2 rounded">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">M-Pesa</h3>
                          <p className="text-sm text-gray-500">+254 712 *** ***</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Default</div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 text-orange-800 p-2 rounded">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Visa Card</h3>
                          <p className="text-sm text-gray-500">**** **** **** 4321</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          Set Default
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>Manage your billing details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="billing-name">Full name</Label>
                      <Input id="billing-name" defaultValue="John Passenger" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-email">Email address</Label>
                      <Input id="billing-email" type="email" defaultValue="passenger@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-address">Address</Label>
                      <Input id="billing-address" defaultValue="123 Main St" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="billing-city">City</Label>
                        <Input id="billing-city" defaultValue="Nairobi" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing-postal">Postal code</Label>
                        <Input id="billing-postal" defaultValue="00100" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Information</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
