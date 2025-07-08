import { pgTable, text, integer, real, timestamp, serial, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table (for regular passengers/customers)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  password: text('password').notNull(),
  role: text('role', { enum: ['user'] }).notNull().default('user'), // Only for regular users now
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Drivers table (separate from users)
export const drivers = pgTable('drivers', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  password: text('password').notNull(),
  licenseNumber: text('license_number').notNull().unique(),
  licenseExpiry: timestamp('license_expires'),
  vehicleId: integer('vehicle_id'), // Will reference vehicles.id
  saccoId: integer('sacco_id'), // Will reference saccos.id
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Owners table
export const owners = pgTable('owners', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Companies table
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  businessLicense: text('business_license').notNull(),
  address: text('address').notNull(),
  phone: text('phone'),
  email: text('email'),
  ownerName: text('owner_name').references(() => owners.name),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Saccos table
export const saccos = pgTable('saccos', {
  id: serial('id').primaryKey(),
  saccoName: text('sacco_name').notNull(),
  companyId: integer('company_id').references(() => companies.id),
  route: text('route'),
  routeStart: text('route_start'),
  routeEnd: text('route_end'),
  busStops: text('bus_stops'), // JSON string of bus stops
  ownerName: text('owner_name').references(() => owners.name),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  regNumber: text('reg_number').notNull().unique(),
  capacity: integer('capacity').notNull(),
  saccoId: integer('sacco_id').references(() => saccos.id),
  driverId: integer('driver_id').references(() => drivers.id), // Now references drivers table
  status: text('status', { enum: ['active', 'maintenance', 'inactive'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Routes table
export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  startLocation: text('start_location').notNull(),
  endLocation: text('end_location').notNull(),
  distance: real('distance'),
  estimatedTime: integer('estimated_time'), // in minutes
  fare: real('fare').notNull(),
  saccoId: integer('sacco_id').references(() => saccos.id),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bus stops table
export const busStops = pgTable('bus_stops', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  routeId: integer('route_id').references(() => routes.id),
  stopOrder: integer('stop_order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Trips table
export const trips = pgTable('trips', {
  id: serial('id').primaryKey(),
  routeId: integer('route_id').references(() => routes.id),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  driverId: integer('driver_id').references(() => drivers.id), // Now references drivers table
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  status: text('status', { enum: ['scheduled', 'in_progress', 'completed', 'cancelled'] }).default('scheduled'),
  totalPassengers: integer('total_passengers').default(0),
  totalRevenue: real('total_revenue').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tickets table
export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  tripId: integer('trip_id').references(() => trips.id),
  passengerId: integer('passenger_id').references(() => users.id),
  fromStop: text('from_stop').notNull(),
  toStop: text('to_stop').notNull(),
  fare: real('fare').notNull(),
  status: text('status', { enum: ['booked', 'paid', 'used', 'cancelled'] }).default('booked'),
  bookedAt: timestamp('booked_at').defaultNow(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Vehicle locations table (for real-time tracking)
export const vehicleLocations = pgTable('vehicle_locations', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  speed: real('speed'),
  heading: real('heading'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Driver performance metrics
export const driverPerformance = pgTable('driver_performance', {
  id: serial('id').primaryKey(),
  driverId: integer('driver_id').references(() => drivers.id), // Now references drivers table
  date: text('date').notNull(), // YYYY-MM-DD format
  tripsCompleted: integer('trips_completed').default(0),
  totalRevenue: real('total_revenue').default(0),
  totalDistance: real('total_distance').default(0),
  onTimePerformance: real('on_time_performance').default(0), // percentage
  safetyScore: real('safety_score').default(0), // 0-100
  customerRating: real('customer_rating').default(0), // 0-5
  fuelEfficiency: real('fuel_efficiency').default(0), // km/L
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Sessions table for authentication (supports both users and drivers)
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  driverId: integer('driver_id').references(() => drivers.id),
  ownerId: integer('owner_id').references(() => owners.id),
  userType: text('user_type', { enum: ['user', 'driver', 'owner'] }).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
export type Owner = typeof owners.$inferSelect;
export type NewOwner = typeof owners.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Sacco = typeof saccos.$inferSelect;
export type NewSacco = typeof saccos.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Route = typeof routes.$inferSelect;
export type NewRoute = typeof routes.$inferInsert;
export type BusStop = typeof busStops.$inferSelect;
export type NewBusStop = typeof busStops.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type VehicleLocation = typeof vehicleLocations.$inferSelect;
export type NewVehicleLocation = typeof vehicleLocations.$inferInsert;
export type DriverPerformance = typeof driverPerformance.$inferSelect;
export type NewDriverPerformance = typeof driverPerformance.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert; 