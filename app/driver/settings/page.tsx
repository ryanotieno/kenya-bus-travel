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
import { Bell, Shield, User, MapPin, Bus } from "lucide-react"

export default function DriverSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [locationSharing, setLocationSharing] = useState(true)

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <SidebarWrapper userType="driver" userName="David Driver" userEmail="driver@example.com" />

      <div className="flex-1 flex flex-col">
        <Header userName="David Driver" notificationCount={2} />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Driver Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-3xl font-semibold">
                          D
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
                        <Input id="first-name" defaultValue="David" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" defaultValue="Driver" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="driver@example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" type="tel" defaultValue="+254 723 456 789" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license">Driver's License Number</Label>
                      <Input id="license" defaultValue="DL-123456789" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Select defaultValue="5">
                        <SelectTrigger id="experience">
                          <SelectValue placeholder="Select years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 year</SelectItem>
                          <SelectItem value="2">2 years</SelectItem>
                          <SelectItem value="3">3 years</SelectItem>
                          <SelectItem value="5">5+ years</SelectItem>
                          <SelectItem value="10">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
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

              <TabsContent value="vehicle" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                    <CardDescription>Manage your vehicle details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bus-id">Bus ID</Label>
                      <Input id="bus-id" defaultValue="KBZ 123C" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bus-model">Bus Model</Label>
                      <Input id="bus-model" defaultValue="Scania K410" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Passenger Capacity</Label>
                        <Input id="capacity" type="number" defaultValue="45" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year of Manufacture</Label>
                        <Input id="year" defaultValue="2020" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last-maintenance">Last Maintenance Date</Label>
                      <Input id="last-maintenance" type="date" defaultValue="2025-03-15" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="next-maintenance">Next Scheduled Maintenance</Label>
                      <Input id="next-maintenance" type="date" defaultValue="2025-06-15" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amenities">Amenities</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="wifi" defaultChecked />
                          <Label htmlFor="wifi">WiFi</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="ac" defaultChecked />
                          <Label htmlFor="ac">Air Conditioning</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="usb" defaultChecked />
                          <Label htmlFor="usb">USB Charging</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="tv" />
                          <Label htmlFor="tv">TV Screens</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Vehicle Information</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Documentation</CardTitle>
                    <CardDescription>Manage your vehicle documents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance">Insurance Expiry Date</Label>
                      <Input id="insurance" type="date" defaultValue="2025-12-31" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inspection">Last Vehicle Inspection Date</Label>
                      <Input id="inspection" type="date" defaultValue="2025-02-10" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license-expiry">Vehicle License Expiry</Label>
                      <Input id="license-expiry" type="date" defaultValue="2026-01-15" />
                    </div>

                    <div className="border rounded-lg p-4 mt-4">
                      <h3 className="font-medium mb-2">Upload Documents</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Button variant="outline" className="w-full">
                          <Bus className="mr-2 h-4 w-4" />
                          Upload Insurance
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Bus className="mr-2 h-4 w-4" />
                          Upload Registration
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Documentation</Button>
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
                      <h4 className="text-sm font-medium">Notification Types</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="trip-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Trip assignments</span>
                          </Label>
                          <Switch id="trip-notifications" defaultChecked disabled={!notificationsEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="passenger-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Passenger updates</span>
                          </Label>
                          <Switch id="passenger-notifications" defaultChecked disabled={!notificationsEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="maintenance-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Maintenance reminders</span>
                          </Label>
                          <Switch id="maintenance-notifications" defaultChecked disabled={!notificationsEnabled} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="schedule-notifications" className="flex items-center gap-2 cursor-pointer">
                            <span>Schedule changes</span>
                          </Label>
                          <Switch id="schedule-notifications" defaultChecked disabled={!notificationsEnabled} />
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
                          <h3 className="font-medium">Location Sharing</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Share your location with passengers during trips
                        </p>
                      </div>
                      <Switch checked={locationSharing} onCheckedChange={setLocationSharing} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-orange-500" />
                          <h3 className="font-medium">Data Collection</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Allow collection of driving patterns for service improvement
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-orange-500" />
                          <h3 className="font-medium">Profile Visibility</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Show your profile information to passengers</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button>Save Settings</Button>
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
