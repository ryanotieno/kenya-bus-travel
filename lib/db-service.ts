import { db } from './database';
import { 
  users, 
  owners,
  companies, 
  saccos, 
  vehicles, 
  routes, 
  busStops, 
  trips, 
  tickets, 
  vehicleLocations, 
  driverPerformance, 
  sessions,
  type User,
  type NewUser,
  type Owner,
  type NewOwner,
  type Company,
  type NewCompany,
  type Sacco,
  type NewSacco,
  type Vehicle,
  type NewVehicle,
  type Route,
  type NewRoute,
  type BusStop,
  type NewBusStop,
  type Trip,
  type NewTrip,
  type Ticket,
  type NewTicket,
  type VehicleLocation,
  type NewVehicleLocation,
  type DriverPerformance,
  type NewDriverPerformance,
  type Session,
  type NewSession,
  drivers
} from './schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import type { Driver } from './schema';

// User operations
export const userService = {
  // Create a new user
  async create(user: NewUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  },

  // Get user by email
  async getByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  },

  // Get user by ID
  async getById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  },

  // Get all users
  async getAll(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.createdAt));
  },

  // Update user
  async update(id: number, updates: Partial<NewUser>): Promise<User | null> {
    const result = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  },

  // Delete user
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.changes > 0;
  }
};

// Owner operations
export const ownerService = {
  // Create a new owner
  async create(owner: NewOwner): Promise<Owner> {
    const result = await db.insert(owners).values(owner).returning();
    return result[0];
  },

  // Get owner by email
  async getByEmail(email: string): Promise<Owner | null> {
    const result = await db.select().from(owners).where(eq(owners.email, email)).limit(1);
    return result[0] || null;
  },

  // Get owner by name
  async getByName(name: string): Promise<Owner | null> {
    const result = await db.select().from(owners).where(eq(owners.name, name)).limit(1);
    return result[0] || null;
  },

  // Get owner by ID
  async getById(id: number): Promise<Owner | null> {
    const result = await db.select().from(owners).where(eq(owners.id, id)).limit(1);
    return result[0] || null;
  },

  // Get all owners
  async getAll(): Promise<Owner[]> {
    return await db.select().from(owners).orderBy(asc(owners.createdAt));
  },

  // Update owner
  async update(id: number, updates: Partial<NewOwner>): Promise<Owner | null> {
    const result = await db.update(owners)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(owners.id, id))
      .returning();
    return result[0] || null;
  },

  // Delete owner
  async delete(id: number): Promise<boolean> {
    const result = await db.delete(owners).where(eq(owners.id, id));
    return result.changes > 0;
  }
};

// Company operations
export const companyService = {
  async create(company: NewCompany): Promise<Company> {
    const result = await db.insert(companies).values(company).returning();
    return result[0];
  },

  async getById(id: number): Promise<Company | null> {
    const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    return result[0] || null;
  },

  async getAll(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(asc(companies.createdAt));
  },

  async update(id: number, updates: Partial<NewCompany>): Promise<Company | null> {
    const result = await db.update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return result[0] || null;
  }
};

// Sacco operations
export const saccoService = {
  async create(sacco: NewSacco): Promise<Sacco> {
    const result = await db.insert(saccos).values(sacco).returning();
    return result[0];
  },

  async getById(id: number): Promise<Sacco | null> {
    const result = await db.select().from(saccos).where(eq(saccos.id, id)).limit(1);
    return result[0] || null;
  },

  async getAll(): Promise<Sacco[]> {
    return await db.select().from(saccos).orderBy(asc(saccos.createdAt));
  },

  async getByCompanyId(companyId: number): Promise<Sacco[]> {
    return await db.select().from(saccos).where(eq(saccos.companyId, companyId));
  }
};

// Vehicle operations
export const vehicleService = {
  async create(vehicle: NewVehicle): Promise<Vehicle> {
    const result = await db.insert(vehicles).values(vehicle).returning();
    return result[0];
  },

  async getById(id: number): Promise<Vehicle | null> {
    const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    return result[0] || null;
  },

  async getByRegNumber(regNumber: string): Promise<Vehicle | null> {
    const result = await db.select().from(vehicles).where(eq(vehicles.regNumber, regNumber)).limit(1);
    return result[0] || null;
  },

  async getAll(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).orderBy(asc(vehicles.createdAt));
  },

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.status, 'active'));
  },

  async deleteById(id: number): Promise<Vehicle | null> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();
    return result[0] || null;
  },

  async updateDriver(vehicleId: number, driverId: number): Promise<Vehicle | null> {
    // For now, we'll update the user's vehicleId instead of adding a driverId to vehicles
    // This follows the schema where users.vehicleId references vehicles.id
    const result = await db.update(users)
      .set({ vehicleId: vehicleId, updatedAt: new Date() })
      .where(eq(users.id, driverId))
      .returning();
    
    if (result[0]) {
      // Return the vehicle for consistency
      return await this.getById(vehicleId);
    }
    return null;
  },

  async getByDriverId(driverId: number): Promise<Vehicle | null> {
    const result = await db.select().from(vehicles).where(eq(vehicles.driverId, driverId));
    return result[0] || null;
  }
};

// Route operations
export const routeService = {
  async create(route: NewRoute): Promise<Route> {
    const result = await db.insert(routes).values(route).returning();
    return result[0];
  },

  async getById(id: number): Promise<Route | null> {
    const result = await db.select().from(routes).where(eq(routes.id, id)).limit(1);
    return result[0] || null;
  },

  async getAll(): Promise<Route[]> {
    return await db.select().from(routes).orderBy(asc(routes.createdAt));
  },

  async getBySaccoId(saccoId: number): Promise<Route[]> {
    return await db.select().from(routes).where(eq(routes.saccoId, saccoId));
  }
};

// Trip operations
export const tripService = {
  async create(trip: NewTrip): Promise<Trip> {
    const result = await db.insert(trips).values(trip).returning();
    return result[0];
  },

  async getById(id: number): Promise<Trip | null> {
    const result = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
    return result[0] || null;
  },

  async getByDriverId(driverId: number): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.driverId, driverId)).orderBy(desc(trips.createdAt));
  },

  async getActiveTrips(): Promise<Trip[]> {
    return await db.select().from(trips).where(eq(trips.status, 'in_progress'));
  },

  async updateStatus(tripId: number, status: Trip['status']): Promise<Trip | null> {
    const result = await db.update(trips)
      .set({ status, updatedAt: new Date() })
      .where(eq(trips.id, tripId))
      .returning();
    return result[0] || null;
  },

  async completeTrip(tripId: number, endTime: Date, totalPassengers: number, totalRevenue: number): Promise<Trip | null> {
    const result = await db.update(trips)
      .set({ 
        status: 'completed', 
        endTime, 
        totalPassengers, 
        totalRevenue, 
        updatedAt: new Date() 
      })
      .where(eq(trips.id, tripId))
      .returning();
    return result[0] || null;
  }
};

// Driver performance operations
export const driverPerformanceService = {
  async create(performance: NewDriverPerformance): Promise<DriverPerformance> {
    const result = await db.insert(driverPerformance).values(performance).returning();
    return result[0];
  },

  async getByDriverId(driverId: number): Promise<DriverPerformance[]> {
    return await db.select().from(driverPerformance)
      .where(eq(driverPerformance.driverId, driverId))
      .orderBy(desc(driverPerformance.date));
  },

  async getByDate(driverId: number, date: string): Promise<DriverPerformance | null> {
    const result = await db.select().from(driverPerformance)
      .where(and(eq(driverPerformance.driverId, driverId), eq(driverPerformance.date, date)))
      .limit(1);
    return result[0] || null;
  },

  async updateOrCreate(performance: NewDriverPerformance): Promise<DriverPerformance> {
    const existing = await this.getByDate(Number(performance.driverId), performance.date);
    if (existing && typeof existing.id === 'number') {
      const result = await db.update(driverPerformance)
        .set({ ...performance, updatedAt: new Date() })
        .where(eq(driverPerformance.id, existing.id as unknown as number))
        .returning();
      return result[0];
    } else {
      return await this.create(performance);
    }
  }
};

// Session operations
export const sessionService = {
  async create(session: NewSession): Promise<Session> {
    const result = await db.insert(sessions).values(session).returning();
    return result[0];
  },

  async getByToken(token: string): Promise<Session | null> {
    const result = await db.select().from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);
    return result[0] || null;
  },

  async deleteByToken(token: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.token, token));
    return result.changes > 0;
  },

  async deleteByUserId(userId: number): Promise<number> {
    const result = await db.delete(sessions).where(eq(sessions.userId, userId));
    return result.changes;
  },

  async getByUserId(userId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.userId, userId));
  },

  async updateLastActivity(token: string): Promise<boolean> {
    const result = await db.update(sessions)
      .set({ createdAt: new Date() }) // Using createdAt as lastActivity for now
      .where(eq(sessions.token, token));
    return result.changes > 0;
  },

  async updateExpiration(token: string, expiresAt: Date): Promise<boolean> {
    const result = await db.update(sessions)
      .set({ expiresAt })
      .where(eq(sessions.token, token));
    return result.changes > 0;
  },

  async deleteExpired(): Promise<number> {
    const result = await db.delete(sessions)
      .where(sql`${sessions.expiresAt} < datetime('now')`);
    return result.changes;
  }
};

// Vehicle location operations
export const vehicleLocationService = {
  async create(location: NewVehicleLocation): Promise<VehicleLocation> {
    const result = await db.insert(vehicleLocations).values(location).returning();
    return result[0];
  },

  async getLatestByVehicleId(vehicleId: number): Promise<VehicleLocation | null> {
    const result = await db.select().from(vehicleLocations)
      .where(eq(vehicleLocations.vehicleId, vehicleId))
      .orderBy(desc(vehicleLocations.timestamp))
      .limit(1);
    return result[0] || null;
  },

  async getByVehicleId(vehicleId: number, limit: number = 100): Promise<VehicleLocation[]> {
    return await db.select().from(vehicleLocations)
      .where(eq(vehicleLocations.vehicleId, vehicleId))
      .orderBy(desc(vehicleLocations.timestamp))
      .limit(limit);
  }
};

// Driver operations
export const driverService = {
  async create(driverData: any): Promise<Driver> {
    const result = await db.insert(drivers).values(driverData).returning();
    return result[0];
  },

  async getById(id: number): Promise<Driver | null> {
    const result = await db.select().from(drivers).where(eq(drivers.id, id));
    return result[0] || null;
  },

  async getByEmail(email: string): Promise<Driver | null> {
    const result = await db.select().from(drivers).where(eq(drivers.email, email));
    return result[0] || null;
  },

  async getByLicenseNumber(licenseNumber: string): Promise<Driver | null> {
    const result = await db.select().from(drivers).where(eq(drivers.licenseNumber, licenseNumber));
    return result[0] || null;
  },

  async getAll(): Promise<Driver[]> {
    return await db.select().from(drivers);
  },

  async updateById(id: number, driverData: Partial<Driver>): Promise<Driver | null> {
    driverData.updatedAt = new Date();
    const result = await db.update(drivers).set(driverData).where(eq(drivers.id, id)).returning();
    return result[0] || null;
  },

  async deleteById(id: number): Promise<Driver | null> {
    const result = await db.delete(drivers).where(eq(drivers.id, id)).returning();
    return result[0] || null;
  },

  async assignVehicle(driverId: number, vehicleId: number): Promise<Driver | null> {
    const result = await db.update(drivers)
      .set({ vehicleId: vehicleId, updatedAt: new Date() })
      .where(eq(drivers.id, driverId))
      .returning();
    return result[0] || null;
  },

  async getWithVehicleAndSacco(driverId: number): Promise<any> {
    // Get driver with their assigned vehicle and sacco details
    const driver = await this.getById(driverId);
    if (!driver) return null;

    let vehicleDetails = null;
    let saccoDetails = null;
    let routeDetails = null;

    // Get vehicle details from driver's assigned vehicle
    if (driver.vehicleId) {
      vehicleDetails = await vehicleService.getById(driver.vehicleId);
      
      if (vehicleDetails && vehicleDetails.saccoId) {
        saccoDetails = await saccoService.getById(vehicleDetails.saccoId);
        
        // Get route details from the sacco (using the sacco's route info)
        if (saccoDetails) {
          routeDetails = {
            name: saccoDetails.route || `${saccoDetails.routeStart} - ${saccoDetails.routeEnd}`,
            startLocation: saccoDetails.routeStart,
            endLocation: saccoDetails.routeEnd,
            busStops: saccoDetails.busStops
          };
        }
      }
    }

    return {
      ...driver,
      vehicle: vehicleDetails,
      sacco: saccoDetails,
      route: routeDetails
    };
  },

  async getDriverRouteInfo(driverId: number): Promise<any> {
    // Get route information for driver dashboard based on assigned vehicle
    const assignment = await this.getWithVehicleAndSacco(driverId);
    if (!assignment) {
      return {
        hasAssignment: false,
        message: "Driver not found"
      };
    }

    if (!assignment.vehicle) {
      return {
        driver: assignment,
        hasAssignment: false,
        message: "No vehicle assigned to driver"
      };
    }

    if (!assignment.sacco) {
      return {
        driver: assignment,
        vehicle: assignment.vehicle,
        hasAssignment: false,
        message: "Vehicle not assigned to any sacco"
      };
    }

    return {
      driver: {
        id: assignment.id,
        firstName: assignment.firstName,
        lastName: assignment.lastName,
        email: assignment.email,
        licenseNumber: assignment.licenseNumber,
        status: assignment.status
      },
      hasAssignment: true,
      vehicle: {
        id: assignment.vehicle.id,
        name: assignment.vehicle.name,
        regNumber: assignment.vehicle.regNumber,
        capacity: assignment.vehicle.capacity,
        status: assignment.vehicle.status
      },
      sacco: {
        id: assignment.sacco.id,
        name: assignment.sacco.saccoName,
        route: assignment.route?.name || assignment.sacco.route,
        routeStart: assignment.route?.startLocation || assignment.sacco.routeStart,
        routeEnd: assignment.route?.endLocation || assignment.sacco.routeEnd,
        busStops: assignment.route?.busStops || assignment.sacco.busStops
      }
    };
  }
}; 