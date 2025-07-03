"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Bus, User, Navigation, RotateCcw, Play, Pause, ChevronRight, MapPin } from "lucide-react"
import Link from "next/link"

// Pickup strategies
const STRATEGIES = {
  NEAREST_FIRST: "nearest_first",
  MOST_PASSENGERS: "most_passengers",
  OPTIMAL_PATH: "optimal_path",
  CUSTOM: "custom"
}

// Road network types
interface RoadNode {
  id: number
  x: number
  y: number
  connections: number[] // IDs of connected nodes
}

interface RoadNetwork {
  nodes: RoadNode[]
  // Lookup table for path finding
  shortestPaths: Record<string, {
    path: number[] // sequence of node IDs
    distance: number
  }>
}

// Utility functions
function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generate a grid-based road network with some random connections
function generateRoadNetwork(
  width: number,
  height: number,
  gridSize: number = 80,
  randomConnections: number = 10
): RoadNetwork {
  const nodes: RoadNode[] = []
  const rows = Math.floor(height / gridSize)
  const cols = Math.floor(width / gridSize)
  
  // Create nodes in a grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Add some randomness to the grid positions
      const jitterX = getRandomInt(-10, 10)
      const jitterY = getRandomInt(-10, 10)
      
      nodes.push({
        id: r * cols + c,
        x: c * gridSize + gridSize / 2 + jitterX,
        y: r * gridSize + gridSize / 2 + jitterY,
        connections: []
      })
    }
  }
  
  // Connect grid neighbors
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const nodeId = r * cols + c
      
      // Connect to the right
      if (c < cols - 1) {
        nodes[nodeId].connections.push(nodeId + 1)
        nodes[nodeId + 1].connections.push(nodeId)
      }
      
      // Connect to the bottom
      if (r < rows - 1) {
        nodes[nodeId].connections.push(nodeId + cols)
        nodes[nodeId + cols].connections.push(nodeId)
      }
    }
  }
  
  // Add some random connections to make the graph more interesting
  for (let i = 0; i < randomConnections; i++) {
    const nodeA = getRandomInt(0, nodes.length - 1)
    const nodeB = getRandomInt(0, nodes.length - 1)
    
    if (nodeA !== nodeB && !nodes[nodeA].connections.includes(nodeB)) {
      nodes[nodeA].connections.push(nodeB)
      nodes[nodeB].connections.push(nodeA)
    }
  }
  
  // Initialize network with empty shortest paths
  const network: RoadNetwork = {
    nodes,
    shortestPaths: {}
  }
  
  // Calculate shortest paths using Floyd-Warshall algorithm
  calculateAllShortestPaths(network)
  
  return network
}

// Calculate shortest paths between all pairs of nodes
function calculateAllShortestPaths(network: RoadNetwork) {
  const { nodes } = network
  
  // Initialize distance matrix with infinity
  const dist: number[][] = Array(nodes.length).fill(0).map(() => 
    Array(nodes.length).fill(Infinity)
  )
  
  // Initialize path matrix
  const next: number[][] = Array(nodes.length).fill(0).map(() => 
    Array(nodes.length).fill(-1)
  )
  
  // Set distance for connections
  for (let i = 0; i < nodes.length; i++) {
    dist[i][i] = 0 // Distance to self is 0
    
    for (const connectedId of nodes[i].connections) {
      const nodeDistance = getDistance(
        nodes[i].x, nodes[i].y,
        nodes[connectedId].x, nodes[connectedId].y
      )
      dist[i][connectedId] = nodeDistance
      next[i][connectedId] = connectedId
    }
  }
  
  // Floyd-Warshall algorithm
  for (let k = 0; k < nodes.length; k++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j]
          next[i][j] = next[i][k]
        }
      }
    }
  }
  
  // Build path lookup table
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i !== j) {
        const path: number[] = []
        let current = i
        
        while (current !== j) {
          path.push(current)
          current = next[current][j]
          
          // Handle unreachable paths
          if (current === -1) break
        }
        
        if (current !== -1) {
          path.push(j)
          network.shortestPaths[`${i}-${j}`] = {
            path,
            distance: dist[i][j]
          }
        }
      }
    }
  }
}

// Find closest road node to a point
function findClosestRoadNode(x: number, y: number, network: RoadNetwork): number {
  let closestId = 0
  let closestDistance = Infinity
  
  for (const node of network.nodes) {
    const distance = getDistance(x, y, node.x, node.y)
    if (distance < closestDistance) {
      closestDistance = distance
      closestId = node.id
    }
  }
  
  return closestId
}

// Get path between two points via the road network
function getPathViaRoadNetwork(
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number, 
  network: RoadNetwork
): { path: {x: number, y: number}[], distance: number } {
  // Find closest nodes to start and end points
  const startNodeId = findClosestRoadNode(startX, startY, network)
  const endNodeId = findClosestRoadNode(endX, endY, network)
  
  // Get shortest path between these nodes
  const pathKey = `${startNodeId}-${endNodeId}`
  const nodePath = network.shortestPaths[pathKey]?.path || []
  
  // Convert node IDs to coordinates
  const path = nodePath.map(nodeId => {
    const node = network.nodes[nodeId]
    return { x: node.x, y: node.y }
  })
  
  // Add the actual start and end points
  path.unshift({ x: startX, y: startY })
  path.push({ x: endX, y: endY })
  
  // Calculate total path distance
  let totalDistance = 0
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += getDistance(
      path[i].x, path[i].y,
      path[i + 1].x, path[i + 1].y
    )
  }
  
  return { path, distance: totalDistance }
}

interface PassengerStop {
  id: number
  x: number
  y: number
  passengers: number
  picked: boolean
  nodeId?: number // Nearest road node
}

interface Vehicle {
  id: number
  x: number
  y: number
  capacity: number
  currentPassengers: number
  speed: number
  targetStopId: number | null
  pathToTarget: {x: number, y: number}[]
  currentPathIndex: number
}

interface SimulationStats {
  totalDistance: number
  totalPassengersPickedUp: number
  totalTimeElapsed: number
  efficiency: number  // passengers per km
}

export default function RouteOptimizationSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Simulation settings
  const [numStops, setNumStops] = useState(10)
  const [strategy, setStrategy] = useState(STRATEGIES.NEAREST_FIRST)
  const [vehicleCapacity, setVehicleCapacity] = useState(20)
  const [simSpeed, setSimSpeed] = useState(5)
  const [showRoadNetwork, setShowRoadNetwork] = useState(true)
  
  // Road network
  const [roadNetwork, setRoadNetwork] = useState<RoadNetwork | null>(null)
  
  // Multiple vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(0)
  
  // Simulation state
  const [stops, setStops] = useState<PassengerStop[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState<SimulationStats>({
    totalDistance: 0,
    totalPassengersPickedUp: 0,
    totalTimeElapsed: 0,
    efficiency: 0
  })

  // Helper to get the selected vehicle
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId)

  // Initialize simulation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Generate road network based on canvas size
    const network = generateRoadNetwork(canvas.width, canvas.height)
    setRoadNetwork(network)
    
    resetSimulation(network)
  }, [numStops])

  const resetSimulation = (network?: RoadNetwork) => {
    const currentNetwork = network || roadNetwork
    if (!currentNetwork) return
    
    // Generate random stops
    const newStops: PassengerStop[] = []
    for (let i = 0; i < numStops; i++) {
      const x = getRandomInt(50, 750)
      const y = getRandomInt(50, 550)
      
      // Find closest road node
      const nodeId = findClosestRoadNode(x, y, currentNetwork)
      
      newStops.push({
        id: i,
        x,
        y,
        passengers: getRandomInt(1, 10),
        picked: false,
        nodeId
      })
    }

    // Generate multiple vehicles (e.g., 3 vehicles)
    const newVehicles: Vehicle[] = Array.from({ length: 3 }, (_, idx) => ({
      id: idx,
      x: 400 + idx * 30,
      y: 300 + idx * 30,
      capacity: vehicleCapacity,
      currentPassengers: getRandomInt(0, Math.floor(vehicleCapacity / 2)),
      speed: 2,
      targetStopId: null,
      pathToTarget: [],
      currentPathIndex: 0
    }))

    setVehicles(newVehicles)
    setSelectedVehicleId(0)

    // Reset stats
    setStats({
      totalDistance: 0,
      totalPassengersPickedUp: 0,
      totalTimeElapsed: 0,
      efficiency: 0
    })

    setStops(newStops)
    setIsRunning(false)
    drawSimulation(newVehicles, newStops)
  }

  // Main simulation loop
  useEffect(() => {
    if (!isRunning || !roadNetwork || !selectedVehicle) return
    const interval = setInterval(() => {
      updateSimulation()
    }, 1000 / simSpeed)
    return () => clearInterval(interval)
  }, [isRunning, stops, vehicles, strategy, simSpeed, roadNetwork, selectedVehicleId])

  // Calculate next target stop based on strategy (for selected vehicle)
  const getNextStop = () => {
    if (!roadNetwork || !selectedVehicle) return null
    const remainingStops = stops.filter(stop => !stop.picked)
    if (remainingStops.length === 0) return null
    switch (strategy) {
      case STRATEGIES.NEAREST_FIRST: {
        let nearestStop = remainingStops[0]
        let shortestDistance = Infinity
        for (const stop of remainingStops) {
          const pathResult = getPathViaRoadNetwork(
            selectedVehicle.x, selectedVehicle.y,
            stop.x, stop.y,
            roadNetwork
          )
          if (pathResult.distance < shortestDistance) {
            shortestDistance = pathResult.distance
            nearestStop = stop
          }
        }
        return nearestStop
      }
      case STRATEGIES.MOST_PASSENGERS: {
        return remainingStops.reduce((mostPassengers, stop) => {
          return stop.passengers > mostPassengers.passengers ? stop : mostPassengers
        })
      }
      case STRATEGIES.OPTIMAL_PATH: {
        let bestStop = remainingStops[0]
        let bestScore = -Infinity
        for (const stop of remainingStops) {
          const pathResult = getPathViaRoadNetwork(
            selectedVehicle.x, selectedVehicle.y,
            stop.x, stop.y,
            roadNetwork
          )
          const score = stop.passengers / (pathResult.distance || 1)
          if (score > bestScore) {
            bestScore = score
            bestStop = stop
          }
        }
        return bestStop
      }
      case STRATEGIES.CUSTOM: {
        const weights = remainingStops.map(stop => {
          const pathResult = getPathViaRoadNetwork(
            selectedVehicle.x, selectedVehicle.y,
            stop.x, stop.y,
            roadNetwork
          )
          return (stop.passengers * 10) / (Math.sqrt(pathResult.distance) || 1)
        })
        const cumulativeWeights: number[] = []
        let sum = 0
        for (const weight of weights) {
          sum += weight
          cumulativeWeights.push(sum)
        }
        const randomValue = Math.random() * sum
        const selectedIndex = cumulativeWeights.findIndex(w => w >= randomValue)
        return remainingStops[selectedIndex >= 0 ? selectedIndex : 0]
      }
      default:
        return remainingStops[0]
    }
  }

  // Update simulation state (only for selected vehicle)
  const updateSimulation = () => {
    if (!roadNetwork || !selectedVehicle) return
    const newVehicles = vehicles.map(v => ({ ...v }))
    const vehicleIdx = newVehicles.findIndex(v => v.id === selectedVehicleId)
    const newVehicle = { ...newVehicles[vehicleIdx] }
    const newStops = [...stops]
    const newStats = { ...stats }
    if (newVehicle.pathToTarget.length === 0) {
      if (newVehicle.targetStopId === null) {
        const nextStop = getNextStop()
        if (nextStop === null) {
          setIsRunning(false)
          return
        }
        newVehicle.targetStopId = nextStop.id
        const targetStop = newStops.find(stop => stop.id === nextStop.id)
        if (targetStop) {
          const pathResult = getPathViaRoadNetwork(
            newVehicle.x, newVehicle.y,
            targetStop.x, targetStop.y,
            roadNetwork
          )
          newVehicle.pathToTarget = pathResult.path
          newVehicle.currentPathIndex = 0
        }
      }
    }
    if (newVehicle.pathToTarget.length > 0) {
      const currentTarget = newVehicle.pathToTarget[newVehicle.currentPathIndex]
      const dx = currentTarget.x - newVehicle.x
      const dy = currentTarget.y - newVehicle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < newVehicle.speed) {
        newVehicle.currentPathIndex++
        if (newVehicle.currentPathIndex >= newVehicle.pathToTarget.length) {
          const targetStop = newStops.find(stop => stop.id === newVehicle.targetStopId)
          if (targetStop && !targetStop.picked) {
            const pickupAmount = Math.min(
              targetStop.passengers,
              newVehicle.capacity - newVehicle.currentPassengers
            )
            newVehicle.currentPassengers += pickupAmount
            newStats.totalPassengersPickedUp += pickupAmount
            const stopIndex = newStops.findIndex(s => s.id === targetStop.id)
            newStops[stopIndex].picked = true
          }
          newVehicle.pathToTarget = []
          newVehicle.targetStopId = null
        }
        newStats.totalDistance += distance
      } else {
        const normDx = dx / distance
        const normDy = dy / distance
        newVehicle.x += normDx * newVehicle.speed
        newVehicle.y += normDy * newVehicle.speed
        newStats.totalDistance += newVehicle.speed
      }
    }
    newStats.totalTimeElapsed += 1
    if (newStats.totalDistance > 0) {
      newStats.efficiency = newStats.totalPassengersPickedUp / (newStats.totalDistance / 100)
    }
    newVehicles[vehicleIdx] = newVehicle
    setVehicles(newVehicles)
    setStops(newStops)
    setStats(newStats)
    drawSimulation(newVehicles, newStops)
  }

  // Draw simulation on canvas (draw all vehicles)
  const drawSimulation = (drawVehicles = vehicles, drawStops = stops) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (showRoadNetwork && roadNetwork) {
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)'
      ctx.lineWidth = 2
      for (const node of roadNetwork.nodes) {
        for (const connectedId of node.connections) {
          if (node.id < connectedId) {
            const connectedNode = roadNetwork.nodes[connectedId]
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(connectedNode.x, connectedNode.y)
            ctx.stroke()
          }
        }
      }
      ctx.fillStyle = 'rgba(200, 200, 200, 0.3)'
      for (const node of roadNetwork.nodes) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
    // Draw stops
    drawStops.forEach(stop => {
      ctx.beginPath()
      ctx.arc(stop.x, stop.y, 10 + stop.passengers, 0, 2 * Math.PI)
      ctx.fillStyle = stop.picked ? 'rgba(200, 200, 200, 0.5)' : 'rgba(255, 100, 0, 0.7)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(stop.passengers.toString(), stop.x, stop.y)
    })
    // Draw all vehicles
    drawVehicles.forEach(v => {
      ctx.beginPath()
      ctx.rect(v.x - 15, v.y - 10, 30, 20)
      ctx.fillStyle = v.id === selectedVehicleId ? 'blue' : 'gray'
      ctx.fill()
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.lineWidth = 1
      ctx.stroke()
      // Draw passenger count on vehicle
      ctx.fillStyle = 'white'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`${v.currentPassengers}/${v.capacity}`, v.x, v.y + 12)
      // Draw vehicle id
      ctx.fillStyle = 'yellow'
      ctx.font = 'bold 10px Arial'
      ctx.fillText(`#${v.id}`, v.x, v.y - 16)
      // Draw path for selected vehicle
      if (v.id === selectedVehicleId && v.pathToTarget.length > 0) {
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.7)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(v.x, v.y)
        for (let i = v.currentPathIndex; i < v.pathToTarget.length; i++) {
          const point = v.pathToTarget[i]
          ctx.lineTo(point.x, point.y)
        }
        ctx.stroke()
      }
    })
  }

  // Redraw on vehicle or stop change
  useEffect(() => {
    drawSimulation()
  }, [vehicles, stops, showRoadNetwork, selectedVehicleId])

  // Handle simulation control
  const toggleSimulation = () => {
    setIsRunning(!isRunning)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-500 text-white p-2 rounded-full">
              <Navigation className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">Route Optimization Sandbox</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Simulation</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleSimulation}
                      >
                        {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                        {isRunning ? "Pause" : "Run"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => resetSimulation()}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <canvas 
                      ref={canvasRef} 
                      width={800} 
                      height={600}
                      className="w-full h-full"
                    ></canvas>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Simulation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="text-xl font-bold">{stats.totalDistance.toFixed(2)} km</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Passengers</p>
                      <p className="text-xl font-bold">{stats.totalPassengersPickedUp}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-xl font-bold">{stats.totalTimeElapsed} units</p>
                    </div>
                    <div className="bg-orange-100 p-4 rounded-md">
                      <p className="text-sm text-gray-500">Efficiency</p>
                      <p className="text-xl font-bold">{stats.efficiency.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleSelect">Select Vehicle</Label>
                    <Select value={selectedVehicleId.toString()} onValueChange={v => setSelectedVehicleId(Number(v))}>
                      <SelectTrigger id="vehicleSelect">
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map(v => (
                          <SelectItem key={v.id} value={v.id.toString()}>
                            Vehicle #{v.id} ({v.currentPassengers}/{v.capacity} passengers)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="strategy">Pickup Strategy</Label>
                    <Select value={strategy} onValueChange={setStrategy}>
                      <SelectTrigger id="strategy">
                        <SelectValue placeholder="Select a strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={STRATEGIES.NEAREST_FIRST}>Nearest First</SelectItem>
                        <SelectItem value={STRATEGIES.MOST_PASSENGERS}>Most Passengers</SelectItem>
                        <SelectItem value={STRATEGIES.OPTIMAL_PATH}>Optimal Path</SelectItem>
                        <SelectItem value={STRATEGIES.CUSTOM}>Custom Strategy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="numStops">Number of Stops: {numStops}</Label>
                    </div>
                    <Slider 
                      id="numStops"
                      min={5} 
                      max={30} 
                      step={1} 
                      value={[numStops]} 
                      onValueChange={(value) => setNumStops(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="capacity">Vehicle Capacity: {vehicleCapacity}</Label>
                    </div>
                    <Slider 
                      id="capacity"
                      min={5} 
                      max={50} 
                      step={5} 
                      value={[vehicleCapacity]} 
                      onValueChange={(value) => setVehicleCapacity(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="simSpeed">Simulation Speed: {simSpeed}x</Label>
                    </div>
                    <Slider 
                      id="simSpeed"
                      min={1} 
                      max={20} 
                      step={1} 
                      value={[simSpeed]} 
                      onValueChange={(value) => setSimSpeed(value[0])}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showRoads" 
                      checked={showRoadNetwork}
                      onCheckedChange={(checked) => setShowRoadNetwork(!!checked)} 
                    />
                    <Label htmlFor="showRoads">Show Road Network</Label>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={() => {
                        if (roadNetwork) {
                          resetSimulation(roadNetwork)
                        }
                      }} 
                      variant="secondary" 
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Regenerate Stops
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Strategy Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-100 rounded-md text-sm space-y-4">
                    {strategy === STRATEGIES.NEAREST_FIRST && (
                      <>
                        <p className="font-medium">Nearest First Strategy</p>
                        <p>Calculates routes via the road network to find the closest stop.</p>
                        <p>Pros: Minimizes travel distance between stops</p>
                        <p>Cons: May miss high-density stops that are further away</p>
                      </>
                    )}
                    
                    {strategy === STRATEGIES.MOST_PASSENGERS && (
                      <>
                        <p className="font-medium">Most Passengers Strategy</p>
                        <p>Prioritizes stops with the highest number of passengers, regardless of road distance.</p>
                        <p>Pros: Maximizes passenger pickup at each stop</p>
                        <p>Cons: May result in longer travel distances along the road network</p>
                      </>
                    )}
                    
                    {strategy === STRATEGIES.OPTIMAL_PATH && (
                      <>
                        <p className="font-medium">Optimal Path Strategy</p>
                        <p>Balances road distance and passenger count to maximize efficiency.</p>
                        <p>Uses a "passengers per distance unit" metric based on actual road routes.</p>
                        <p>Pros: Better overall efficiency in realistic road conditions</p>
                        <p>Cons: More complex to implement</p>
                      </>
                    )}
                    
                    {strategy === STRATEGIES.CUSTOM && (
                      <>
                        <p className="font-medium">Custom Strategy</p>
                        <p>Uses a weighted random selection based on both passenger count and road distance.</p>
                        <p>Favors high passenger counts and shorter road distances.</p>
                        <p>Modify the code to implement your own optimization algorithm!</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
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