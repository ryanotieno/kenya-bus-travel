CREATE TABLE `drivers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`password` text NOT NULL,
	`license_number` text NOT NULL,
	`license_expires` text,
	`vehicle_id` integer,
	`sacco_id` integer,
	`status` text DEFAULT 'active',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drivers_email_unique` ON `drivers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `drivers_license_number_unique` ON `drivers` (`license_number`);--> statement-breakpoint
CREATE TABLE `owners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`password` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `owners_name_unique` ON `owners` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `owners_email_unique` ON `owners` (`email`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bus_stops` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`latitude` real,
	`longitude` real,
	`route_id` integer,
	`stop_order` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_bus_stops`("id", "name", "location", "latitude", "longitude", "route_id", "stop_order", "created_at", "updated_at") SELECT "id", "name", "location", "latitude", "longitude", "route_id", "stop_order", "created_at", "updated_at" FROM `bus_stops`;--> statement-breakpoint
DROP TABLE `bus_stops`;--> statement-breakpoint
ALTER TABLE `__new_bus_stops` RENAME TO `bus_stops`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`business_license` text NOT NULL,
	`address` text NOT NULL,
	`phone` text,
	`email` text,
	`owner_name` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_companies`("id", "name", "business_license", "address", "phone", "email", "owner_name", "created_at", "updated_at") SELECT "id", "name", "business_license", "address", "phone", "email", "owner_name", "created_at", "updated_at" FROM `companies`;--> statement-breakpoint
DROP TABLE `companies`;--> statement-breakpoint
ALTER TABLE `__new_companies` RENAME TO `companies`;--> statement-breakpoint
CREATE TABLE `__new_driver_performance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`driver_id` integer,
	`date` text NOT NULL,
	`trips_completed` integer DEFAULT 0,
	`total_revenue` real DEFAULT 0,
	`total_distance` real DEFAULT 0,
	`on_time_performance` real DEFAULT 0,
	`safety_score` real DEFAULT 0,
	`customer_rating` real DEFAULT 0,
	`fuel_efficiency` real DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_driver_performance`("id", "driver_id", "date", "trips_completed", "total_revenue", "total_distance", "on_time_performance", "safety_score", "customer_rating", "fuel_efficiency", "created_at", "updated_at") SELECT "id", "driver_id", "date", "trips_completed", "total_revenue", "total_distance", "on_time_performance", "safety_score", "customer_rating", "fuel_efficiency", "created_at", "updated_at" FROM `driver_performance`;--> statement-breakpoint
DROP TABLE `driver_performance`;--> statement-breakpoint
ALTER TABLE `__new_driver_performance` RENAME TO `driver_performance`;--> statement-breakpoint
CREATE TABLE `__new_routes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`start_location` text NOT NULL,
	`end_location` text NOT NULL,
	`distance` real,
	`estimated_time` integer,
	`fare` real NOT NULL,
	`sacco_id` integer,
	`status` text DEFAULT 'active',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_routes`("id", "name", "start_location", "end_location", "distance", "estimated_time", "fare", "sacco_id", "status", "created_at", "updated_at") SELECT "id", "name", "start_location", "end_location", "distance", "estimated_time", "fare", "sacco_id", "status", "created_at", "updated_at" FROM `routes`;--> statement-breakpoint
DROP TABLE `routes`;--> statement-breakpoint
ALTER TABLE `__new_routes` RENAME TO `routes`;--> statement-breakpoint
CREATE TABLE `__new_saccos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sacco_name` text NOT NULL,
	`company_id` integer,
	`route` text,
	`route_start` text,
	`route_end` text,
	`bus_stops` text,
	`owner_name` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_saccos`("id", "sacco_name", "company_id", "route", "route_start", "route_end", "bus_stops", "owner_name", "created_at", "updated_at") SELECT "id", "sacco_name", "company_id", "route", "route_start", "route_end", "bus_stops", "owner_name", "created_at", "updated_at" FROM `saccos`;--> statement-breakpoint
DROP TABLE `saccos`;--> statement-breakpoint
ALTER TABLE `__new_saccos` RENAME TO `saccos`;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`driver_id` integer,
	`owner_id` integer,
	`user_type` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "user_id", "driver_id", "owner_id", "user_type", "token", "expires_at", "created_at") SELECT "id", "user_id", "driver_id", "owner_id", "user_type", "token", "expires_at", "created_at" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `__new_tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer,
	`passenger_id` integer,
	`from_stop` text NOT NULL,
	`to_stop` text NOT NULL,
	`fare` real NOT NULL,
	`status` text DEFAULT 'booked',
	`booked_at` text DEFAULT CURRENT_TIMESTAMP,
	`used_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_tickets`("id", "trip_id", "passenger_id", "from_stop", "to_stop", "fare", "status", "booked_at", "used_at", "created_at", "updated_at") SELECT "id", "trip_id", "passenger_id", "from_stop", "to_stop", "fare", "status", "booked_at", "used_at", "created_at", "updated_at" FROM `tickets`;--> statement-breakpoint
DROP TABLE `tickets`;--> statement-breakpoint
ALTER TABLE `__new_tickets` RENAME TO `tickets`;--> statement-breakpoint
CREATE TABLE `__new_trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`route_id` integer,
	`vehicle_id` integer,
	`driver_id` integer,
	`start_time` text,
	`end_time` text,
	`status` text DEFAULT 'scheduled',
	`total_passengers` integer DEFAULT 0,
	`total_revenue` real DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_trips`("id", "route_id", "vehicle_id", "driver_id", "start_time", "end_time", "status", "total_passengers", "total_revenue", "created_at", "updated_at") SELECT "id", "route_id", "vehicle_id", "driver_id", "start_time", "end_time", "status", "total_passengers", "total_revenue", "created_at", "updated_at" FROM `trips`;--> statement-breakpoint
DROP TABLE `trips`;--> statement-breakpoint
ALTER TABLE `__new_trips` RENAME TO `trips`;--> statement-breakpoint
CREATE TABLE `__new_vehicle_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vehicle_id` integer,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`speed` real,
	`heading` real,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_vehicle_locations`("id", "vehicle_id", "latitude", "longitude", "speed", "heading", "timestamp") SELECT "id", "vehicle_id", "latitude", "longitude", "speed", "heading", "timestamp" FROM `vehicle_locations`;--> statement-breakpoint
DROP TABLE `vehicle_locations`;--> statement-breakpoint
ALTER TABLE `__new_vehicle_locations` RENAME TO `vehicle_locations`;--> statement-breakpoint
CREATE TABLE `__new_vehicles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`reg_number` text NOT NULL,
	`capacity` integer NOT NULL,
	`sacco_id` integer,
	`driver_id` integer,
	`status` text DEFAULT 'active',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_vehicles`("id", "name", "reg_number", "capacity", "sacco_id", "driver_id", "status", "created_at", "updated_at") SELECT "id", "name", "reg_number", "capacity", "sacco_id", "driver_id", "status", "created_at", "updated_at" FROM `vehicles`;--> statement-breakpoint
DROP TABLE `vehicles`;--> statement-breakpoint
ALTER TABLE `__new_vehicles` RENAME TO `vehicles`;--> statement-breakpoint
CREATE UNIQUE INDEX `vehicles_reg_number_unique` ON `vehicles` (`reg_number`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`password` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "first_name", "last_name", "email", "phone", "password", "role", "created_at", "updated_at") SELECT "id", "first_name", "last_name", "email", "phone", "password", "role", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);