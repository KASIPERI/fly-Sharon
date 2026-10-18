import { z } from 'zod';

export const UnitStatusSchema = z.enum(['active', 'warning', 'critical', 'standby']);

export const NetworkTypeSchema = z.enum(['4G-LTE', 'GPRS-2G', 'SATELLITE']);

export const UnitSchema = z.object({
  id: z.string().min(1, 'Unit ID is required'),
  callsign: z.string().min(1, 'Callsign is required'),
  model: z.string().min(1, 'Model is required'),
  status: UnitStatusSchema,
  batteryLevel: z.number().min(0).max(100),
  signalCsq: z.number().min(0).max(31),
  networkType: NetworkTypeSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitudeM: z.number().min(0),
  speedMps: z.number().min(0),
  headingDeg: z.number().min(0).max(360),
  payloadWeightKg: z.number().min(0),
  payloadTempC: z.number(),
  hazardProximityM: z.number().min(0),
  lastHeartbeat: z.string(),
});

export const TelemetryLogSchema = z.object({
  id: z.number().optional(),
  unitId: z.string(),
  timestamp: z.string(),
  batteryLevel: z.number().min(0).max(100),
  signalCsq: z.number().min(0).max(31),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitudeM: z.number().min(0),
  speedMps: z.number().min(0),
  tempC: z.number(),
  vibrationG: z.number().min(0),
  hazardAlert: z.boolean(),
});

export const CoordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const GeofenceZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['delivery_corridor', 'no_fly_zone', 'landing_hub']),
  maxAltitudeM: z.number().positive(),
  coordinates: z.array(CoordinateSchema).min(3),
  status: z.enum(['active', 'inactive']),
});

export const GeofenceEventSchema = z.object({
  id: z.string(),
  unitId: z.string(),
  zoneName: z.string(),
  eventType: z.enum(['entered', 'exited', 'boundary_warning']),
  timestamp: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const SystemAuditLogSchema = z.object({
  id: z.number().optional(),
  action: z.string(),
  operator: z.string(),
  details: z.string(),
  timestamp: z.string(),
});

export const SqliteQueryPayloadSchema = z.object({
  sql: z.string().min(1, 'SQL query cannot be empty'),
  params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});
