"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle, MapPin, Navigation, TrendingUp, Users, Bus, DollarSign, PlayCircle, StopCircle, ArrowRight, UserCircle2, UsersRound, Clock, Zap, Minus, Plus, BarChart3 } from "lucide-react";
import DriverPerformanceSidebar from "@/components/driver-performance-sidebar";
import { useAuth } from "@/hooks/use-auth";

export default function DriverDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();
  const [loading, setLoading] = useState(true);

  // Don't render anything while auth is loading or if user is not authenticated
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  // Redirect if not authenticated or not a driver
  if (!user || user.role !== 'driver') {
    return null; // Don't render anything while redirecting
  }
  const [tripStatus, setTripStatus] = useState("idle"); // idle, boarding, enRoute, completed
  const [currentStop, setCurrentStop] = useState(0);
  const [passengers, setPassengers] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [shiftStatus, setShiftStatus] = useState("off_duty");
  
  // Driver and route data
  const [driverData, setDriverData] = useState<any>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [routeStops, setRouteStops] = useState<Array<{
    name: string, 
    distance: number,
    dropOffCount: number
  }>>([]);
  const [vehicleCapacity, setVehicleCapacity] = useState(14);

  // Dialogs
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDropOffDialog, setShowDropOffDialog] = useState(false);

  // Payment state
  const [currentPassenger, setCurrentPassenger] = useState(1);
  const [totalPassengers, setTotalPassengers] = useState(0);
  const [passengerDropOff, setPassengerDropOff] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [payForOthers, setPayForOthers] = useState(false);
  const [othersCount, setOthersCount] = useState(1);
  const [othersDropOffs, setOthersDropOffs] = useState<{[key: string]: number}>({});
  const [showPaymentSummary, setShowPaymentSummary] = useState(false);

  // Animation and visual state
  const [tripProgress, setTripProgress] = useState(0);
  const [travelProgress, setTravelProgress] = useState(0);
  const [showTravelAnimation, setShowTravelAnimation] = useState(false);
  const [passengerAvatars, setPassengerAvatars] = useState<string[]>([]);
  const [boardingPassengers, setBoardingPassengers] = useState<string[]>([]);
  const [droppingPassengers, setDroppingPassengers] = useState<string[]>([]);
  const [showBoardingAnimation, setShowBoardingAnimation] = useState(false);
  const [showDropOffAnimation, setShowDropOffAnimation] = useState(false);
  const [vehicleStatus, setVehicleStatus] = useState("idle"); // idle, boarding, traveling, stopping
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [etaToNextStop, setEtaToNextStop] = useState(0);

  // New state for capacity warning
  const [showCapacityWarning, setShowCapacityWarning] = useState(false);

  // Drop-off tracking state
  const [tempDropOffCount, setTempDropOffCount] = useState(0);

  // Trip statistics tracking
  const [totalPassengersServed, setTotalPassengersServed] = useState(0);
  const [totalDropOffs, setTotalDropOffs] = useState(0);
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [tripEndTime, setTripEndTime] = useState<Date | null>(null);

  // Waiting passengers at current stop
  const [waitingPassengers, setWaitingPassengers] = useState(0);

  // Performance sidebar state
  const [showPerformanceSidebar, setShowPerformanceSidebar] = useState(true);
  const [performanceView, setPerformanceView] = useState<"trip" | "performance">("trip");

  // Mock performance data - in real app this would come from API
  const mockPerformanceData = {
    // Revenue & Financial KPIs
    dailyRevenue: 8500,
    weeklyRevenue: 52000,
    monthlyRevenue: 185000,
    averageFare: 45,
    revenueGrowth: 12.5,
    
    // Efficiency KPIs
    tripsCompleted: 24,
    averageTripTime: 35,
    onTimePerformance: 94,
    capacityUtilization: 78,
    fuelEfficiency: 8.5,
    
    // Safety & Compliance KPIs
    safetyScore: 92,
    incidentsThisMonth: 0,
    licenseExpiryDays: 45,
    vehicleMaintenanceStatus: "Good",
    
    // Customer Service KPIs
    customerRating: 4.6,
    complaintsThisMonth: 1,
    passengerSatisfaction: 88,
    
    // Operational KPIs
    totalDistance: 1250,
    workingHours: 8.5,
    breakTimeCompliance: 98,
    routeAdherence: 99,
    
    // Rankings & Comparisons
    rankAmongDrivers: 3,
    totalDrivers: 15,
    performanceTrend: "improving" as const,
  };

  // Check authentication and fetch driver data
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    // Check if user is authenticated and is a driver
    if (!user) {
      router.push('/login?redirect=/driver/dashboard');
      return;
    }

    if (user.role !== 'driver') {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'user') {
        router.push('/user/dashboard');
      } else if (user.role === 'owner') {
        router.push('/owner/dashboard');
      }
      return;
    }

    // User is authenticated and is a driver, fetch their data
    fetchDriverData();
  }, [user, authLoading, router]);

  const fetchDriverData = async () => {
    if (!user) return;
    
    try {
      // Use the new API endpoint to get driver details with vehicle and route info
      const response = await fetch(`/api/drivers?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      
      if (!data.success || !data.driver) {
        console.error('Driver not found for email:', user.email);
        setLoading(false);
        return;
      }
      
      const driverInfo = data.driver;
      setDriverData(driverInfo);
      
      if (driverInfo.vehicle) {
        setVehicleData(driverInfo.vehicle);
        setVehicleCapacity(driverInfo.vehicle.capacity || 14);
        
        if (driverInfo.route && driverInfo.route.busStops && driverInfo.route.busStops.length > 0) {
          // Use bus stops from the route
          const stops = driverInfo.route.busStops.map((stop: any, index: number) => ({
            name: stop,
            distance: index * 2,
            dropOffCount: 0
          }));
          setRouteStops(stops);
        } else if (driverInfo.route && driverInfo.route.name) {
          // If no bus stops but route name is defined, create stops from route
          const routeParts = driverInfo.route.name.split(' - ');
          const stops = routeParts.map((stop: any, index: number) => ({
            name: stop.trim(),
            distance: index * 2,
            dropOffCount: 0
          }));
          setRouteStops(stops);
        } else {
          // Fallback stops if no route info
          setRouteStops([
            { name: "Starting Point", distance: 0, dropOffCount: 0 },
            { name: "Route Point 1", distance: 5, dropOffCount: 0 },
            { name: "Route Point 2", distance: 10, dropOffCount: 0 },
          ]);
        }
      } else {
        console.error('No vehicle assigned to driver:', user.email);
        // Set default vehicle data for display
        setVehicleData({
          name: 'No Vehicle Assigned',
          regNumber: 'N/A',
          capacity: 14
        });
        setRouteStops([
          { name: "No Route Assigned", distance: 0, dropOffCount: 0 },
        ]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  // Update trip progress
  useEffect(() => {
    const progress = ((currentStop + 1) / routeStops.length) * 100;
    setTripProgress(progress);
  }, [currentStop, routeStops.length]);

  // Generate passenger avatars
  const generatePassengerAvatars = (count: number) => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-pink-500", "bg-purple-500", "bg-orange-500", "bg-teal-500", "bg-red-500"];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  // Calculate fare based on distance
  const calculateFare = (stopIndex: number) => {
    return Math.max(30, stopIndex * 15);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Empty": return "text-gray-600";
      case "Available": return "text-green-600";
      case "Full": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  // Get capacity status
  const getCapacityStatus = () => {
    const currentCount = getCurrentPassengerCount();
    if (currentCount === 0) return "Empty";
    if (currentCount < vehicleCapacity) return "Available";
    return "Full";
  };

  // Animate boarding process
  const animateBoarding = (count: number) => {
    setShowBoardingAnimation(true);
    setVehicleStatus("boarding");
    
    const avatars = generatePassengerAvatars(count);
    setBoardingPassengers(avatars);
    
    setTimeout(() => {
      setPassengerAvatars(prev => [...prev, ...avatars]);
      setBoardingPassengers([]);
      setShowBoardingAnimation(false);
      setVehicleStatus("traveling");
    }, 2000);
  };

  // Animate drop-off process
  const animateDropOff = (count: number) => {
    setShowDropOffAnimation(true);
    setVehicleStatus("stopping");
    
    // Get the avatars for the passengers being dropped off (last N passengers)
    const droppingAvatars = passengerAvatars.slice(-count);
    setDroppingPassengers(droppingAvatars);
    
    setTimeout(() => {
      // Remove the dropped passengers from the end of the array
      setPassengerAvatars(prev => prev.slice(0, -count));
      setDroppingPassengers([]);
      setShowDropOffAnimation(false);
      setVehicleStatus("boarding");
    }, 1500);
  };

  // Animate travel between stops
  const animateTravel = () => {
    setShowTravelAnimation(true);
    setVehicleStatus("traveling");
    setTravelProgress(0);
    setCurrentSpeed(40);
    
    const interval = setInterval(() => {
      setTravelProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowTravelAnimation(false);
          setCurrentSpeed(0);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  // Handle start shift
  const handleStartShift = () => {
    setShiftStatus("on_duty");
  };

  // Handle end shift
  const handleEndShift = () => {
    setShiftStatus("off_duty");
    setTripStatus("idle");
    setCurrentStop(0);
    setPassengers(0);
    setRevenue(0);
    setPassengerAvatars([]);
    setTripProgress(0);
    setVehicleStatus("idle");
    
    // Reset route stop drop-off counts
    setRouteStops(prev => prev.map(stop => ({
      ...stop,
      dropOffCount: 0
    })));
  };

  // Reset payment form
  const resetPaymentForm = () => {
    setPassengerDropOff("");
    setAmountReceived("");
    setPaymentConfirmed(false);
    setPayForOthers(false);
    setOthersCount(1);
    setOthersDropOffs({});
  };

  // Handle start trip
  const handleStartTrip = () => {
    setTripStatus("boarding");
    setCurrentStop(0);
    setPassengers(0);
    setRevenue(0);
    setTripProgress(0);
    setTravelProgress(0);
    setShowStartDialog(false);
    
    // Initialize trip statistics
    setTotalPassengersServed(0);
    setTotalDropOffs(0);
    setTripStartTime(new Date());
    setTripEndTime(null);
    
    // Generate initial waiting passengers
    const initialWaiting = Math.floor(Math.random() * 8) + 2; // 2-9 passengers
    setWaitingPassengers(initialWaiting);
    
    // Clear any previous passenger tracking
    setPassengerAvatars([]);
    
    // Reset drop-off counts
    setRouteStops(prev => prev.map(stop => ({
      ...stop,
      dropOffCount: 0
    })));
    
    // Set trip status to enRoute immediately - no automatic boarding
    setTimeout(() => {
      setTripStatus("enRoute");
      setShiftStatus("on_trip");
    }, 1000);
  };

  // Handle payment confirmation
  const handlePaymentConfirm = () => {
    if (!passengerDropOff || !paymentConfirmed) return;

    let totalFare = calculateFare(routeStops.findIndex(stop => stop.name === passengerDropOff));
    let additionalPassengers = 0;
    
    // Add drop-off count for the selected destination
    setRouteStops(prev => prev.map(stop => 
      stop.name === passengerDropOff 
        ? { ...stop, dropOffCount: stop.dropOffCount + 1 }
        : stop
    ));
    
    if (payForOthers) {
      // Calculate additional fares for others and add drop-off counts
      Object.entries(othersDropOffs).forEach(([stopName, count]) => {
        const stopIndex = routeStops.findIndex(stop => stop.name === stopName);
        totalFare += calculateFare(stopIndex) * count;
        additionalPassengers += count;
        
        // Add drop-off counts for additional passengers
        setRouteStops(prev => prev.map(stop => 
          stop.name === stopName 
            ? { ...stop, dropOffCount: stop.dropOffCount + count }
            : stop
        ));
      });
    }

    // Add to revenue
    setRevenue(prev => prev + totalFare);

    // Move to next passenger or complete
    const nextPassenger = currentPassenger + 1 + additionalPassengers;
    
    if (nextPassenger <= totalPassengers) {
      setCurrentPassenger(nextPassenger);
      resetPaymentForm();
    } else {
      // All passengers processed
      setShowPaymentDialog(false);
      
      // Check if we're at the last stop
      if (currentStop >= routeStops.length - 1) {
        setTripStatus("completed");
        setShowEndDialog(true);
      } else {
        setShowPaymentSummary(true);
        setTimeout(() => setShowPaymentSummary(false), 3000);
      }
    }
  };

  // Handle stop progression
  const handleNextStop = () => {
    if (currentStop >= routeStops.length - 1) return;

    // Animate travel to next stop
    setShowTravelAnimation(true);
    setVehicleStatus("traveling");
    
    // Simulate travel time
    const travelTime = Math.random() * 3000 + 2000; // 2-5 seconds
    setEtaToNextStop(travelTime / 1000);
    
    const travelInterval = setInterval(() => {
      setTravelProgress(prev => {
        if (prev >= 100) {
          clearInterval(travelInterval);
          return 100;
        }
        return prev + 2;
      });
    }, travelTime / 50);

    setTimeout(() => {
      const nextStopIndex = currentStop + 1;
      setCurrentStop(nextStopIndex);
      setTripProgress(((nextStopIndex + 1) / routeStops.length) * 100);
      setTravelProgress(0);
      setShowTravelAnimation(false);
      setVehicleStatus("boarding");
      
      // Check if this is the final stop
      if (nextStopIndex >= routeStops.length - 1) {
        // We've reached the end of the route - show trip summary
        setTimeout(() => {
          setTripEndTime(new Date());
          setTripStatus("completed");
          setShowEndDialog(true);
        }, 2000); // Wait 2 seconds after arrival to show summary
        return;
      }
      
      // Generate waiting passengers for next stop
      const waitingCount = Math.floor(Math.random() * 8) + 2; // 2-9 passengers
      setWaitingPassengers(waitingCount);
      
      // Check for passengers dropping off at this stop
      const currentStopData = routeStops[nextStopIndex];
      if (currentStopData && currentStopData.dropOffCount > 0) {
        const actualDropOffs = Math.min(currentStopData.dropOffCount, getCurrentPassengerCount());
        if (actualDropOffs > 0) {
          animateDropOff(actualDropOffs);
          
          // Track total drop-offs
          setTotalDropOffs(prev => prev + actualDropOffs);
          
          // Update the drop-off count (reduce by actual drop-offs)
          setRouteStops(prev => prev.map((stop, index) => 
            index === nextStopIndex 
              ? { ...stop, dropOffCount: Math.max(0, stop.dropOffCount - actualDropOffs) }
              : stop
          ));
        }
      }
      
      // Don't automatically start payment collection - wait for manual boarding
    }, travelTime);
  };

  // Handle proceed when full
  const handleProceedWhenFull = () => {
    setShowCapacityWarning(false);
    setShowStopDialog(true);
    setTimeout(() => setShowStopDialog(false), 3000);
  };

  // Handle end trip
  const handleEndTrip = () => {
    setTripStatus("idle");
    setCurrentStop(0);
    setPassengers(0);
    setRevenue(0);
    setShiftStatus("on_duty");
    setShowEndDialog(false);
    setPassengerAvatars([]);
    setTripProgress(0);
    setVehicleStatus("idle");
    
    // Reset trip statistics
    setTotalPassengersServed(0);
    setTotalDropOffs(0);
    setTripStartTime(null);
    setTripEndTime(null);
  };

  // Get current passenger count
  const getCurrentPassengerCount = () => {
    return passengerAvatars.length;
  };

  // Handle boarding at current stop
  const handleBoarding = () => {
    if (waitingPassengers === 0) return;
    
    const availableSpace = vehicleCapacity - getCurrentPassengerCount();
    if (availableSpace <= 0) {
      setShowCapacityWarning(true);
      return;
    }
    
    const boardingCount = Math.min(waitingPassengers, availableSpace);
    animateBoarding(boardingCount);
    setWaitingPassengers(prev => prev - boardingCount);
    
    // Track total passengers served
    setTotalPassengersServed(prev => prev + boardingCount);
    
    // Start payment collection for the passengers that just boarded
    setTimeout(() => {
      setShowPaymentDialog(true);
      setCurrentPassenger(1);
      setTotalPassengers(boardingCount);
      resetPaymentForm();
    }, 2500);
  };

  // Handle manual drop-off at current stop
  const handleManualDropOff = () => {
    const currentStopData = routeStops[currentStop];
    if (!currentStopData || currentStopData.dropOffCount === 0) return;
    
    setTempDropOffCount(currentStopData.dropOffCount);
    setShowDropOffDialog(true);
  };

  // Confirm manual drop-off
  const handleConfirmDropOff = () => {
    const actualDropOffs = Math.min(tempDropOffCount, getCurrentPassengerCount());
    if (actualDropOffs > 0) {
      animateDropOff(actualDropOffs);
      
      // Update the drop-off count
      setRouteStops(prev => prev.map((stop, index) => 
        index === currentStop 
          ? { ...stop, dropOffCount: Math.max(0, stop.dropOffCount - actualDropOffs) }
          : stop
      ));
    }
    
    setShowDropOffDialog(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show error state if authentication failed
  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{authError}</p>
          <Button onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Not Logged In</h2>
          <p className="text-gray-600">Please log in to access the driver dashboard.</p>
          <Button onClick={() => router.push('/login?redirect=/driver/dashboard')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1">
        <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={shiftStatus === 'on_duty' ? 'default' : 'secondary'}>
                  {shiftStatus === 'off_duty' ? 'Off Duty' : shiftStatus === 'on_duty' ? 'On Duty' : 'On Trip'}
                </Badge>
                {tripStatus !== 'idle' && (
                  <Badge variant="outline">
                    {tripStatus === 'boarding' ? 'Boarding' : tripStatus === 'enRoute' ? 'En Route' : 'Completed'}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Performance Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPerformanceSidebar(!showPerformanceSidebar)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {showPerformanceSidebar ? 'Hide' : 'Show'} Performance
            </Button>
          </div>
          
          {/* Driver Info */}
          {driverData && vehicleData && (
            <div className="mt-4 p-4 bg-white rounded-lg border shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4" />
                    Driver
                  </h3>
                  <p className="text-gray-600 font-medium">{driverData.firstName} {driverData.lastName}</p>
                  <p className="text-sm text-gray-500">{driverData.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <UsersRound className="h-4 w-4" />
                    Sacco
                  </h3>
                  <p className="text-gray-600 font-medium">{driverData.sacco?.saccoName || 'No Sacco Assigned'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bus className="h-4 w-4" />
                    Vehicle
                  </h3>
                  <p className="text-gray-600 font-medium">{vehicleData.name}</p>
                  <p className="text-sm text-gray-500">{vehicleData.regNumber}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Route
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {routeStops.length > 0 ? 
                      `${routeStops[0].name} → ${routeStops[routeStops.length - 1].name}` : 
                      'Route not defined'
                    }
                  </p>
                  <p className="text-sm text-gray-500">{routeStops.length} stops</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Route Details */}
        {routeStops.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Route Details
              </CardTitle>
              <CardDescription>
                Complete route for {driverData?.sacco?.saccoName || 'Unknown Sacco'} - {routeStops.length} stops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Route Overview */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      {routeStops[0].name} → {routeStops[routeStops.length - 1].name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-blue-700">
                    {routeStops.length} stops
                  </Badge>
                </div>

                {/* Route Stops */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">All Stops:</h4>
                  <div className="grid gap-2">
                    {routeStops.map((stop, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                          index === currentStop 
                            ? 'bg-blue-100 border-blue-300 shadow-sm' 
                            : index < currentStop 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            index === currentStop 
                              ? 'bg-blue-500 text-white animate-pulse' 
                              : index < currentStop 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-300 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{stop.name}</div>
                            <div className="text-sm text-gray-500">
                              Distance: {stop.distance} km
                              {stop.dropOffCount > 0 && (
                                <span className="ml-2 text-red-600">
                                  • {stop.dropOffCount} drop-offs
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {index === currentStop && (
                            <Badge className="bg-blue-600">Current</Badge>
                          )}
                          {index < currentStop && (
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              Completed
                            </Badge>
                          )}
                          {index > currentStop && (
                            <Badge variant="outline" className="text-gray-500">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trip Progress Bar */}
        {tripStatus !== 'idle' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Trip Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Main Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${tripProgress}%` }}
                    ></div>
                    <Bus 
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 text-blue-800 animate-bounce" 
                      style={{ left: `calc(${tripProgress}% - 12px)` }} 
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Progress</span>
                    <span>{Math.round(tripProgress)}%</span>
                  </div>
                </div>

                {/* Vehicle Status */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      vehicleStatus === 'idle' ? 'bg-gray-400' :
                      vehicleStatus === 'boarding' ? 'bg-yellow-400' :
                      vehicleStatus === 'traveling' ? 'bg-green-400' :
                      'bg-red-400'
                    }`}></div>
                    <span className="font-medium capitalize">{vehicleStatus}</span>
                  </div>
                  {vehicleStatus === 'traveling' && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{currentSpeed} km/h</span>
                    </div>
                  )}
                </div>

                {/* Travel Animation */}
                {showTravelAnimation && (
                  <div className="relative w-full bg-gray-100 rounded-lg h-8 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">Traveling to next stop...</span>
                    </div>
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-5000 ease-linear"
                      style={{ width: `${travelProgress}%` }}
                    ></div>
                    <Bus 
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 text-blue-800 animate-pulse" 
                      style={{ left: `calc(${travelProgress}% - 12px)` }} 
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Vehicle Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Vehicle Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Capacity Visualization */}
                <div className="flex justify-between items-center">
                  <span>Passengers:</span>
                  <span className="flex items-center gap-2">
                    {getCurrentPassengerCount()} / {vehicleCapacity}
                    <div className="flex gap-1">
                      {[...Array(vehicleCapacity)].map((_, i) => (
                        <span 
                          key={i} 
                          className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                            i < getCurrentPassengerCount() ? 'bg-green-400 border-green-500 scale-110' : 'bg-gray-200 border-gray-300'
                          }`}
                        ></span>
                      ))}
                    </div>
                  </span>
                </div>

                {/* Status */}
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={getStatusColor(getCapacityStatus())}>
                    {getCapacityStatus()}
                  </span>
                </div>

                {/* Available Space */}
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className="font-medium">{vehicleCapacity - getCurrentPassengerCount()}</span>
                </div>

                {/* Capacity Warning */}
                {getCurrentPassengerCount() >= vehicleCapacity && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-medium">Vehicle at full capacity!</span>
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      No more passengers can be picked up until some exit.
                    </div>
                  </div>
                )}

                {/* Passenger Avatars */}
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Onboard Passengers:</div>
                  <div className="flex flex-wrap gap-1 min-h-[32px]">
                    {passengerAvatars.map((color, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded-full ${color} animate-pulse transition-all duration-300`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Boarding Animation */}
                {showBoardingAnimation && (
                  <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <UsersRound className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-medium">Boarding passengers...</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {boardingPassengers.map((color, index) => (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded-full ${color} animate-bounce`}
                          style={{ animationDelay: `${index * 200}ms` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drop-off Animation */}
                {showDropOffAnimation && (
                  <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-800">
                      <Users className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-medium">Passengers exiting...</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {droppingPassengers.map((color, index) => (
                        <div
                          key={index}
                          className={`w-4 h-4 rounded-full ${color} animate-ping`}
                          style={{ animationDelay: `${index * 150}ms` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Current Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {routeStops[currentStop]?.name || "Terminal"}
                </div>
                <p className="text-gray-600">Stop {currentStop + 1} of {routeStops.length}</p>
                <div className="text-sm text-gray-500">
                  Distance: {routeStops[currentStop]?.distance || 0} km
                </div>
                
                {/* Current Stop Indicator */}
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">Currently at this stop</span>
                </div>

                {/* Drop-off Information */}
                {routeStops[currentStop]?.dropOffCount > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-700" />
                        <span className="text-sm font-medium text-red-800">Passengers Dropping Off</span>
                      </div>
                      <span className="text-lg font-bold text-red-700">{routeStops[currentStop]?.dropOffCount}</span>
                    </div>
                    
                    {/* Drop-off Button */}
                    <Button 
                      onClick={handleManualDropOff}
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      disabled={getCurrentPassengerCount() === 0}
                    >
                      {getCurrentPassengerCount() === 0 ? 'No Passengers' : 'Process Drop-offs'}
                    </Button>
                  </div>
                )}

                {/* Waiting Passengers */}
                {waitingPassengers > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UsersRound className="w-4 h-4 text-yellow-700" />
                        <span className="text-sm font-medium text-yellow-800">Waiting Passengers</span>
                      </div>
                      <span className="text-lg font-bold text-yellow-700">{waitingPassengers}</span>
                    </div>
                    
                    {/* Waiting Passenger Icons */}
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: Math.min(waitingPassengers, 8) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full bg-yellow-400 animate-pulse"
                          style={{ animationDelay: `${i * 100}ms` }}
                        ></div>
                      ))}
                      {waitingPassengers > 8 && (
                        <span className="text-xs text-yellow-600">+{waitingPassengers - 8} more</span>
                      )}
                    </div>

                    {/* Boarding Button */}
                    <Button 
                      onClick={handleBoarding}
                      size="sm"
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                      disabled={getCurrentPassengerCount() >= vehicleCapacity}
                    >
                      {getCurrentPassengerCount() >= vehicleCapacity ? 'Vehicle Full' : 'Board Passengers'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Stop */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Next Stop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {currentStop < routeStops.length - 1 ? routeStops[currentStop + 1]?.name : "End of Route"}
                </div>
                {currentStop < routeStops.length - 1 && (
                  <div className="text-sm text-gray-500">
                    Distance: {(routeStops[currentStop + 1]?.distance || 0) - (routeStops[currentStop]?.distance || 0)} km
                  </div>
                )}
                
                {/* ETA */}
                {vehicleStatus === 'traveling' && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">
                      ETA: {Math.max(0, Math.ceil((100 - travelProgress) / 10))} min
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-green-600 animate-pulse">
                  KSh {revenue}
                </div>
                <p className="text-sm text-gray-500">Total trip revenue</p>
                
                {/* Revenue Animation */}
                {revenue > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-600 animate-bounce" />
                    <span className="text-sm font-medium text-green-700">Revenue increasing!</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {shiftStatus === 'off_duty' && (
                  <Button onClick={handleStartShift} className="w-full">
                    Start Shift
                  </Button>
                )}
                
                {shiftStatus === 'on_duty' && tripStatus === 'idle' && (
                  <Button onClick={() => setShowStartDialog(true)} className="w-full">
                    Start Trip
                  </Button>
                )}
                
                {tripStatus === 'enRoute' && (
                  <Button 
                    onClick={handleNextStop} 
                    className="w-full"
                    disabled={showTravelAnimation}
                  >
                    {showTravelAnimation ? 'Traveling...' : 'Next Stop'}
                  </Button>
                )}
                
                {shiftStatus !== 'off_duty' && (
                  <Button onClick={handleEndShift} variant="outline" className="w-full">
                    End Shift
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trip Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trip Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Stops Completed:</span>
                  <span className="font-medium">{currentStop}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Passengers:</span>
                  <span className="font-medium">{getCurrentPassengerCount()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Fare:</span>
                  <span className="font-medium">
                    KSh {getCurrentPassengerCount() > 0 ? Math.round(revenue / getCurrentPassengerCount()) : 0}
                  </span>
                </div>
                
                {/* Efficiency Indicator */}
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700">Trip running efficiently</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Route Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routeStops.map((stop, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                    index === currentStop 
                      ? 'bg-blue-50 border-blue-200 shadow-lg scale-105' 
                      : index < currentStop 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStop 
                      ? 'bg-blue-500 animate-pulse' 
                      : index < currentStop 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {stop.name}
                      {index === currentStop && <ArrowRight className="w-4 h-4 text-blue-500 animate-bounce" />}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stop.distance} km • KSh {calculateFare(index)}
                    </div>
                    {/* Drop-off Count */}
                    {stop.dropOffCount > 0 && (
                      <div className="mt-1">
                        <Badge variant="destructive" className="text-xs">
                          Drop-off: {stop.dropOffCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {index === currentStop && (
                    <Badge className="bg-blue-100 text-blue-800 animate-pulse">Current</Badge>
                  )}
                  {index < currentStop && (
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Start Trip Dialog */}
        <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start New Trip</DialogTitle>
              <DialogDescription>
                Begin passenger pickup and start your journey
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <PlayCircle className="h-12 w-12 text-blue-500 mx-auto mb-2 animate-pulse" />
                <p className="text-blue-700">Ready to start your trip?</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowStartDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleStartTrip} className="flex-1">
                  Start Trip
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Passenger Payment</DialogTitle>
              <DialogDescription>
                Passenger {currentPassenger} of {totalPassengers}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserCircle2 className="h-5 w-5 text-blue-600 animate-pulse" />
                  <span className="font-medium">Passenger {currentPassenger}</span>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  {totalPassengers - currentPassenger + 1} passengers remaining to process
                </div>
              </div>

              <div>
                <Label className="block mb-2">Destination:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {routeStops.slice(currentStop + 1).map(stop => (
                    <Button
                      key={stop.name}
                      variant={passengerDropOff === stop.name ? 'default' : 'outline'}
                      onClick={() => setPassengerDropOff(stop.name)}
                      className="justify-start transition-all duration-200 hover:scale-105"
                    >
                      <div className="text-left">
                        <div className="font-medium">{stop.name}</div>
                        <div className="text-xs text-gray-500">KSh {calculateFare(routeStops.findIndex(s => s.name === stop.name))}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {passengerDropOff && (
                <div className="p-3 bg-green-50 rounded-lg animate-pulse">
                  <div className="text-center">
                    <div className="font-medium text-green-900">Fare:</div>
                    <div className="text-2xl font-bold text-green-600">
                      KSh {calculateFare(routeStops.findIndex(stop => stop.name === passengerDropOff))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="pay-for-others" 
                  checked={payForOthers} 
                  onCheckedChange={(checked) => setPayForOthers(checked === true)} 
                />
                <Label htmlFor="pay-for-others">Paying for others</Label>
              </div>

              {payForOthers && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="others-count">Number of additional passengers:</Label>
                    <Input
                      id="others-count"
                      type="number"
                      min="1"
                      max={totalPassengers - currentPassenger}
                      value={othersCount}
                      onChange={(e) => setOthersCount(Math.max(1, Math.min(parseInt(e.target.value) || 1, totalPassengers - currentPassenger)))}
                      className="mt-1"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Maximum: {totalPassengers - currentPassenger} additional passengers
                    </div>
                  </div>

                  <div>
                    <Label className="block mb-2">Assign destinations:</Label>
                    {routeStops.slice(currentStop + 1).map(stop => (
                      <div key={stop.name} className="flex items-center gap-2 mb-2">
                        <Label className="text-sm min-w-[120px]">{stop.name}:</Label>
                        <Input
                          type="number"
                          min="0"
                          max={Math.min(othersCount, totalPassengers - currentPassenger)}
                          value={othersDropOffs[stop.name] || 0}
                          onChange={(e) => {
                            const newValue = Math.max(0, parseInt(e.target.value) || 0);
                            const currentTotal = Object.values(othersDropOffs).reduce((sum, count) => sum + count, 0) - (othersDropOffs[stop.name] || 0);
                            const maxAllowed = Math.min(othersCount, totalPassengers - currentPassenger - currentTotal);
                            
                            setOthersDropOffs(prev => ({
                              ...prev,
                              [stop.name]: Math.min(newValue, maxAllowed)
                            }));
                          }}
                          className="w-16"
                        />
                      </div>
                    ))}
                  </div>

                  {Object.values(othersDropOffs).reduce((sum, count) => sum + count, 0) > 0 && (
                    <div className="p-3 bg-yellow-50 rounded-lg animate-pulse">
                      <div className="text-sm">
                        <div className="font-medium text-yellow-900">Additional fare:</div>
                        <div className="text-lg font-bold text-yellow-700">
                          KSh {Object.entries(othersDropOffs).reduce((sum, [stopName, count]) => {
                            const stopIndex = routeStops.findIndex(stop => stop.name === stopName);
                            return sum + (calculateFare(stopIndex) * count);
                          }, 0)}
                        </div>
                        <div className="text-xs text-yellow-700 mt-1">
                          This will skip {Object.values(othersDropOffs).reduce((sum, count) => sum + count, 0)} passengers in the payment queue
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="amount-received">Amount received (KSh):</Label>
                <Input
                  id="amount-received"
                  type="number"
                  min="0"
                  step="10"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="Enter amount"
                  className="mt-1"
                />
              </div>

              {amountReceived && passengerDropOff && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Required:</span>
                      <span>KSh {calculateFare(routeStops.findIndex(stop => stop.name === passengerDropOff)) + (payForOthers ? Object.entries(othersDropOffs).reduce((sum, [stopName, count]) => {
                        const stopIndex = routeStops.findIndex(stop => stop.name === stopName);
                        return sum + (calculateFare(stopIndex) * count);
                      }, 0) : 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Received:</span>
                      <span>KSh {parseFloat(amountReceived) || 0}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Change:</span>
                      <span className={((parseFloat(amountReceived) || 0) - (calculateFare(routeStops.findIndex(stop => stop.name === passengerDropOff)) + (payForOthers ? Object.entries(othersDropOffs).reduce((sum, [stopName, count]) => {
                          const stopIndex = routeStops.findIndex(stop => stop.name === stopName);
                          return sum + (calculateFare(stopIndex) * count);
                        }, 0) : 0))) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        KSh {((parseFloat(amountReceived) || 0) - (calculateFare(routeStops.findIndex(stop => stop.name === passengerDropOff)) + (payForOthers ? Object.entries(othersDropOffs).reduce((sum, [stopName, count]) => {
                          const stopIndex = routeStops.findIndex(stop => stop.name === stopName);
                          return sum + (calculateFare(stopIndex) * count);
                        }, 0) : 0))).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="payment-confirmed" 
                  checked={paymentConfirmed} 
                  onCheckedChange={(checked) => setPaymentConfirmed(checked === true)} 
                />
                <Label htmlFor="payment-confirmed">Payment confirmed and change given</Label>
              </div>

              <Button 
                onClick={handlePaymentConfirm} 
                disabled={!passengerDropOff || !paymentConfirmed}
                className="w-full"
              >
                Confirm Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Summary Dialog */}
        <Dialog open={showPaymentSummary} onOpenChange={setShowPaymentSummary}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Complete</DialogTitle>
              <DialogDescription>
                All passengers have been processed
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2 animate-bounce" />
                <p className="text-green-700 font-medium">All payments processed!</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stop Summary Dialog */}
        <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Stop Summary</DialogTitle>
              <DialogDescription>
                Passengers dropped off and picked up
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2 animate-bounce" />
                <p className="text-green-700">Stop completed successfully!</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* End Trip Dialog */}
        <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Trip Complete - Summary
              </DialogTitle>
              <DialogDescription>
                Final summary for your completed trip
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Success Header */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg text-center border border-green-200">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3 animate-bounce" />
                <h3 className="text-xl font-bold text-green-700 mb-2">Trip Completed Successfully!</h3>
                <p className="text-green-600">Great job! All passengers have been safely transported.</p>
              </div>

              {/* Trip Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Revenue Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Revenue Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="text-2xl font-bold text-green-600">KSh {revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Passengers Served:</span>
                      <span className="font-medium">{totalPassengersServed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Drop-offs:</span>
                      <span className="font-medium">{totalDropOffs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Fare:</span>
                      <span className="font-medium">
                        KSh {totalPassengersServed > 0 ? Math.round(revenue / totalPassengersServed) : 0}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-sm text-gray-500">
                        Revenue per stop: KSh {Math.round(revenue / routeStops.length)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trip Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bus className="h-5 w-5 text-blue-600" />
                      Trip Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-medium">{routeStops[0]?.name} → {routeStops[routeStops.length - 1]?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stops Completed:</span>
                      <span className="font-medium">{routeStops.length} / {routeStops.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Distance:</span>
                      <span className="font-medium">{routeStops[routeStops.length - 1]?.distance || 0} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trip Duration:</span>
                      <span className="font-medium">
                        {tripStartTime && tripEndTime ? 
                          `${Math.round((tripEndTime.getTime() - tripStartTime.getTime()) / 60000)} min` : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium">{vehicleData?.name} ({vehicleData?.regNumber})</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Route Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    Route Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {routeStops.map((stop, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                          index === routeStops.length - 1 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          index === routeStops.length - 1 
                            ? 'bg-green-500' 
                            : 'bg-gray-400'
                        }`}></div>
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {stop.name}
                            {index === routeStops.length - 1 && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Final Stop</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {stop.distance} km • KSh {calculateFare(index)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">Stop {index + 1}</div>
                          <div className="text-xs text-gray-500">
                            {index === routeStops.length - 1 ? 'Completed' : 'Visited'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{Math.round((totalPassengersServed / vehicleCapacity) * 100)}%</div>
                      <div className="text-sm text-gray-600">Capacity Used</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{routeStops.length}</div>
                      <div className="text-sm text-gray-600">Stops Completed</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{Math.round(revenue / routeStops.length)}</div>
                      <div className="text-sm text-gray-600">Avg/Stop (KSh)</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{totalPassengersServed > 0 ? Math.round(revenue / totalPassengersServed) : 0}</div>
                      <div className="text-sm text-gray-600">Avg/Passenger (KSh)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleEndTrip} className="flex-1">
                  End Trip & Return to Dashboard
                </Button>
                <Button 
                  onClick={() => {
                    setShowEndDialog(false);
                    // Reset for new trip
                    setTripStatus("idle");
                    setCurrentStop(0);
                    setPassengers(0);
                    setRevenue(0);
                    setPassengerAvatars([]);
                    setTripProgress(0);
                    setVehicleStatus("idle");
                    setShiftStatus("on_duty");
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Start New Trip
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Capacity Warning Dialog */}
        <Dialog open={showCapacityWarning} onOpenChange={setShowCapacityWarning}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Capacity Warning</DialogTitle>
              <DialogDescription>
                The vehicle is full. No more passengers can be picked up.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-2 animate-bounce" />
                <p className="text-yellow-700 font-medium">The vehicle is full. No more passengers can be picked up.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleProceedWhenFull} className="flex-1">
                  Proceed to Next Stop
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Drop-off Dialog */}
        <Dialog open={showDropOffDialog} onOpenChange={setShowDropOffDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Drop-off Confirmation</DialogTitle>
              <DialogDescription>
                Confirm the drop-off at the current stop
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-blue-700">Are you sure you want to drop off passengers at this stop?</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDropOffDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleConfirmDropOff} className="flex-1">
                  Confirm Drop-off
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
      
      {/* Performance Sidebar */}
      <DriverPerformanceSidebar 
        data={mockPerformanceData}
        isExpanded={showPerformanceSidebar}
        onToggle={() => setShowPerformanceSidebar(!showPerformanceSidebar)}
        currentView={performanceView}
        onViewChange={setPerformanceView}
      />
    </div>
  );
} 