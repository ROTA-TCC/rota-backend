import { pgTable, text, integer, doublePrecision, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { geometry } from 'drizzle-orm/pg-core'; // Or equivalent custom type definition if not native
import { sql } from 'drizzle-orm';

// Enums
export const planEnum = pgEnum('Plan', ['GRATIS', 'PRO']);
export type Plan = typeof planEnum.enumValues[number];

export const transactionTypeEnum = pgEnum('TransactionType', ['PLAN_SUBSCRIPTION']);
export type TransactionType = typeof transactionTypeEnum.enumValues[number];
export const transactionStatusEnum = pgEnum('TransactionStatus', ['PENDING', 'PAID', 'CANCELLED', 'EXPIRED', 'REFUNDED']);

export const users = pgTable('User', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  alias: text('alias').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').default('FULL').notNull(),
  plan: planEnum('plan').default('GRATIS').notNull(),
  isVerified: boolean('isVerified').default(false).notNull(),
  is2faEnabled: boolean('is2faEnabled').default(false).notNull(),
  twoFactorCode: text('twoFactorCode'),
  twoFactorExpiresAt: timestamp('twoFactorExpiresAt'),
  verificationToken: text('verificationToken').unique(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const profiles = pgTable('profiles', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),
    
  userId: text('userId')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    
  peso: doublePrecision('peso'),
  altura: doublePrecision('altura'),
  idade: integer('idade'),
  nivelDificuldade: text('nivelDificuldade'),
  
  hideoutLocation: geometry('hideoutLocation', { 
    type: 'point', 
    mode: 'xy', 
    srid: 4326 
  }),
  
  hideoutRadius: integer('hideoutRadius'),
  
  updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const passwordReset = pgTable('PasswordReset', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  usedAt: timestamp('usedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const sessions = pgTable('Session', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text('refreshToken').notNull().unique(),
  ipAddress: text('ipAddress').notNull(),
  userAgent: text('userAgent').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const auditLog = pgTable('AuditLog', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  details: jsonb('details'),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const knownDevice = pgTable('KnownDevice', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  deviceFingerprint: text('deviceFingerprint').notNull(),
  lastUsed: timestamp('lastUsed').defaultNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const transaction = pgTable('Transaction', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  externalId: text('externalId').notNull().unique(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  status: transactionStatusEnum('status').default('PENDING').notNull(),
  type: transactionTypeEnum('type').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const runs = pgTable('runs', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  distanceMeters: doublePrecision('distance_meters').notNull(),
  averagePace: doublePrecision('average_pace'),
  calories: integer('calories'),
  routeGeometry: geometry('route_geometry', { type: 'lineString', srid: 4326 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const runTrackpoints = pgTable('run_trackpoints', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  runId: text('run_id').notNull().references(() => runs.id, { onDelete: 'cascade' }),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  altitude: doublePrecision('altitude'),
  speedMps: doublePrecision('speed_mps'),
  recordedAt: timestamp('recorded_at').notNull(),
  location: geometry('location', { type: 'point', srid: 4326 }),
});
