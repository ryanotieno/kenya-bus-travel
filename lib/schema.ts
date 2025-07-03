import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  password: text('password').notNull(),
  role: text('role', { enum: ['user', 'driver', 'owner'] }).notNull().default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Companies table
export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  businessLicense: text('business_license').notNull(),
  address: text('address').notNull(),
  phone: text('phone'),
  email: text('email'),
  ownerId: integer('owner_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Saccos table
export const saccos = sqliteTable('saccos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  saccoName: text('sacco_name').notNull(),
  companyId: integer('company_id').references(() => companies.id),
  route: text('route'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Vehicles table
export const vehicles = sqliteTable('vehicles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  regNumber: text('reg_number').notNull().unique(),
  capacity: integer('capacity').notNull(),
  saccoId: integer('sacco_id').references(() => saccos.id),
  driverId: integer('driver_id').references(() => users.id),
  status: text('status', { enum: ['active', 'maintenance', 'inactive'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Routes table
export const routes = sqliteTable('routes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  startLocation: text('start_location').notNull(),
  endLocation: text('end_location').notNull(),
  distance: real('distance'),
  estimatedTime: integer('estimated_time'), // in minutes
  fare: real('fare').notNull(),
  saccoId: integer('sacco_id').references(() => saccos.id),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Bus stops table
export const busStops = sqliteTable('bus_stops', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  location: text('location').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  routeId: integer('route_id').references(() => routes.id),
  stopOrder: integer('stop_order').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Trips table
export const trips = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  routeId: integer('route_id').references(() => routes.id),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  driverId: integer('driver_id').references(() => users.id),
  startTime: integer('start_time', { mode: 'timestamp' }),
  endTime: integer('end_time', { mode: 'timestamp' }),
  status: text('status', { enum: ['scheduled', 'in_progress', 'completed', 'cancelled'] }).default('scheduled'),
  totalPassengers: integer('total_passengers').default(0),
  totalRevenue: real('total_revenue').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Tickets table
export const tickets = sqliteTable('tickets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id').references(() => trips.id),
  passengerId: integer('passenger_id').references(() => users.id),
  fromStop: text('from_stop').notNull(),
  toStop: text('to_stop').notNull(),
  fare: real('fare').notNull(),
  status: text('status', { enum: ['booked', 'paid', 'used', 'cancelled'] }).default('booked'),
  bookedAt: integer('booked_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  usedAt: integer('used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Vehicle locations table (for real-time tracking)
export const vehicleLocations = sqliteTable('vehicle_locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  speed: real('speed'),
  heading: real('heading'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Driver performance metrics
export const driverPerformance = sqliteTable('driver_performance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  driverId: integer('driver_id').references(() => users.id),
  date: text('date').notNull(), // YYYY-MM-DD format
  tripsCompleted: integer('trips_completed').default(0),
  totalRevenue: real('total_revenue').default(0),
  totalDistance: real('total_distance').default(0),
  onTimePerformance: real('on_time_performance').default(0), // percentage
  safetyScore: real('safety_score').default(0), // 0-100
  customerRating: real('customer_rating').default(0), // 0-5
  fuelEfficiency: real('fuel_efficiency').default(0), // km/L
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Sessions table for authentication
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
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
export type DriverPerformance = Omit<typeof driverPerformance.$inferSelect, 'id'> & { id: number };
export type NewDriverPerformance = typeof driverPerformance.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert; 