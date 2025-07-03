"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Users, 
  MapPin, 
  Fuel, 
  Shield, 
  Star, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  Calendar,
  BarChart3,
  Bus,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

interface DriverPerformanceData {
  // Revenue & Financial KPIs
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  averageFare: number;
  revenueGrowth: number;
  
  // Efficiency KPIs
  tripsCompleted: number;
  averageTripTime: number;
  onTimePerformance: number;
  capacityUtilization: number;
  fuelEfficiency: number;
  
  // Safety & Compliance KPIs
  safetyScore: number;
  incidentsThisMonth: number;
  licenseExpiryDays: number;
  vehicleMaintenanceStatus: string;
  
  // Customer Service KPIs
  customerRating: number;
  complaintsThisMonth: number;
  passengerSatisfaction: number;
  
  // Operational KPIs
  totalDistance: number;
  workingHours: number;
  breakTimeCompliance: number;
  routeAdherence: number;
  
  // Rankings & Comparisons
  rankAmongDrivers: number;
  totalDrivers: number;
  performanceTrend: "improving" | "declining" | "stable";
}

interface DriverPerformanceSidebarProps {
  data: DriverPerformanceData;
  isExpanded?: boolean;
  onToggle?: () => void;
  currentView?: "trip" | "performance";
  onViewChange?: (view: "trip" | "performance") => void;
}

export default function DriverPerformanceSidebar({ 
  data, 
  isExpanded = true,
  onToggle,
  currentView = "trip",
  onViewChange
}: DriverPerformanceSidebarProps) {
  
  const getPerformanceColor = (value: number, threshold: number) => {
    if (value >= threshold) return "text-green-600";
    if (value >= threshold * 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "declining": return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSafetyStatus = (score: number) => {
    if (score >= 90) return { color: "text-green-600", icon: <Shield className="w-4 h-4" />, label: "Excellent" };
    if (score >= 75) return { color: "text-yellow-600", icon: <AlertTriangle className="w-4 h-4" />, label: "Good" };
    return { color: "text-red-600", icon: <XCircle className="w-4 h-4" />, label: "Needs Attention" };
  };

  const safetyStatus = getSafetyStatus(data.safetyScore);

  if (!isExpanded) {
    return (
      <div className="bg-white border-l border-gray-200 w-16">
        <div className="p-2 h-screen flex flex-col items-center justify-center space-y-4">
          <button 
            onClick={onToggle}
            className="p-2 rounded hover:bg-gray-100"
            title="Expand Performance Dashboard"
          >
            <BarChart3 className="w-6 h-6" />
          </button>
          <div className="text-xs text-center text-gray-500">
            Performance
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-l border-gray-200 w-80">
      <div className="p-4 space-y-4 h-screen overflow-y-auto">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Performance Dashboard</h2>
          <button 
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-100"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={currentView === "trip" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange?.("trip")}
            className="flex-1 flex items-center gap-2"
          >
            <Bus className="w-4 h-4" />
            Trip View
          </Button>
          <Button
            variant={currentView === "performance" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange?.("performance")}
            className="flex-1 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            KPIs
          </Button>
        </div>

        {currentView === "trip" ? (
          /* Trip/Shift Summary View */
          <div className="space-y-4">
            {/* Quick Performance Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">#{data.rankAmongDrivers}</div>
                  <div className="text-sm text-gray-600">Driver Ranking</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">KSh {data.dailyRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Today's Revenue</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{data.tripsCompleted}</div>
                    <div className="text-xs text-gray-600">Trips</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1">
                  {getTrendIcon(data.performanceTrend)}
                  <span className="text-xs capitalize">{data.performanceTrend}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Safety Check */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  Safety Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  {safetyStatus.icon}
                  <span className={`font-semibold ${safetyStatus.color}`}>
                    {data.safetyScore}%
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {safetyStatus.label}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {data.incidentsThisMonth === 0 ? "No incidents this month" : `${data.incidentsThisMonth} incident(s) this month`}
                </div>
              </CardContent>
            </Card>

            {/* Quick Customer Feedback */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4" />
                  Customer Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{data.customerRating}/5.0</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {data.complaintsThisMonth === 0 ? "No complaints" : `${data.complaintsThisMonth} complaint(s)`}
                </div>
              </CardContent>
            </Card>

            {/* View Detailed KPIs Button */}
            <Button
              onClick={() => onViewChange?.("performance")}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <ArrowRight className="w-4 h-4" />
              View Detailed KPIs
            </Button>
          </div>
        ) : (
          /* Detailed KPI View */
          <div className="space-y-4">
            {/* Back to Trip View Button */}
            <Button
              onClick={() => onViewChange?.("trip")}
              className="w-full flex items-center gap-2 mb-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Trip View
            </Button>

            {/* Driver Ranking */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" />
                  Driver Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">#{data.rankAmongDrivers}</div>
                  <div className="text-sm text-gray-600">of {data.totalDrivers} drivers</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {getTrendIcon(data.performanceTrend)}
                    <span className="text-xs capitalize">{data.performanceTrend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4" />
                  Revenue Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Today:</span>
                  <span className="font-semibold">KSh {data.dailyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Week:</span>
                  <span className="font-semibold">KSh {data.weeklyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Month:</span>
                  <span className="font-semibold">KSh {data.monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Fare:</span>
                  <span className="font-semibold">KSh {data.averageFare}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Growth:</span>
                  <span className={`font-semibold ${getPerformanceColor(data.revenueGrowth, 5)}`}>
                    {data.revenueGrowth > 0 ? '+' : ''}{data.revenueGrowth}%
                  </span>
                  {data.revenueGrowth > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4" />
                  Efficiency Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trips Completed:</span>
                  <span className="font-semibold">{data.tripsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Trip Time:</span>
                  <span className="font-semibold">{data.averageTripTime} min</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">On-Time Performance:</span>
                    <span className={`font-semibold ${getPerformanceColor(data.onTimePerformance, 90)}`}>
                      {data.onTimePerformance}%
                    </span>
                  </div>
                  <Progress value={data.onTimePerformance} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Capacity Utilization:</span>
                    <span className={`font-semibold ${getPerformanceColor(data.capacityUtilization, 80)}`}>
                      {data.capacityUtilization}%
                    </span>
                  </div>
                  <Progress value={data.capacityUtilization} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fuel Efficiency:</span>
                  <span className="font-semibold">{data.fuelEfficiency} km/L</span>
                </div>
              </CardContent>
            </Card>

            {/* Safety & Compliance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" />
                  Safety & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {safetyStatus.icon}
                  <span className={`font-semibold ${safetyStatus.color}`}>
                    Safety Score: {data.safetyScore}%
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {safetyStatus.label}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Incidents (Month):</span>
                  <span className={`font-semibold ${data.incidentsThisMonth === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.incidentsThisMonth}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">License Expires:</span>
                  <span className={`font-semibold ${data.licenseExpiryDays > 30 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.licenseExpiryDays} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Vehicle Status:</span>
                  <Badge 
                    variant={data.vehicleMaintenanceStatus === 'Good' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {data.vehicleMaintenanceStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Customer Service */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4" />
                  Customer Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{data.customerRating}/5.0</span>
                  <Badge variant="outline" className="text-xs">
                    Rating
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Complaints (Month):</span>
                  <span className={`font-semibold ${data.complaintsThisMonth === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.complaintsThisMonth}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Satisfaction:</span>
                    <span className={`font-semibold ${getPerformanceColor(data.passengerSatisfaction, 85)}`}>
                      {data.passengerSatisfaction}%
                    </span>
                  </div>
                  <Progress value={data.passengerSatisfaction} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Operational Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  Operational Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Distance:</span>
                  <span className="font-semibold">{data.totalDistance} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Working Hours:</span>
                  <span className="font-semibold">{data.workingHours}h</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Break Compliance:</span>
                    <span className={`font-semibold ${getPerformanceColor(data.breakTimeCompliance, 95)}`}>
                      {data.breakTimeCompliance}%
                    </span>
                  </div>
                  <Progress value={data.breakTimeCompliance} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Route Adherence:</span>
                    <span className={`font-semibold ${getPerformanceColor(data.routeAdherence, 98)}`}>
                      {data.routeAdherence}%
                    </span>
                  </div>
                  <Progress value={data.routeAdherence} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm">
                  📊 View Detailed Report
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm">
                  📅 Schedule Maintenance
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm">
                  🎯 Set Performance Goals
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm">
                  📧 Contact Supervisor
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 