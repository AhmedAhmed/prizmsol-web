import { desc, type InferSelectModel } from 'drizzle-orm';
import {
    boolean,
    integer,
    json,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar
} from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    email: varchar("email", { length: 64 }).notNull(),
    password: varchar("password", { length: 64 }),
    plan: varchar("plan", { enum: ["free", "pro", "plus"] }).notNull().default("free"),
    stripeCustomerId: text("stripeCustomerId"),
    stripeSubscriptionId: text("stripeSubscriptionId"),
    stripeProductId: text("stripeProductId"),
    billingPeriodStart: timestamp("billingPeriodStart"),
    billingPeriodEnd: timestamp("billingPeriodEnd"),
    aiCreditUsedCents: integer("aiCreditUsedCents").notNull().default(0),
    name: text("name"),
    description: text("description"),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    isAnonymous: boolean("isAnonymous").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('chats', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    title: text('title').notNull(),
    visibility: varchar('visibility', { enum: ['public', 'private'] })
        .notNull()
        .default('private'),
    isDeleted: boolean('isDeleted').notNull().default(false),
    createdAt: timestamp('createdAt').notNull(),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('messages', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('userId').references(() => user.id),
    chatId: uuid('chatId')
        .notNull()
        .references(() => chat.id),
    content: varchar('content').notNull(),
    role: varchar('role', { enum: ['data', 'user', 'system', 'assistant'] }).notNull(),
    parts: json('parts').notNull(),
    attachments: json('attachments').notNull(),
    createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const Documents = pgTable('documents', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    chatId: uuid('chatId')
        .notNull()
        .references(() => chat.id),
    title: varchar('title').notNull(),
    content: varchar('content').notNull(),
    type: varchar('type', { enum: ['text', 'image', 'code', 'speech', 'sheet'] }).notNull(),
    media: varchar('media').notNull(),
    credit_cost: integer('credit_cost').notNull().default(0),
    createdAt: timestamp('createdAt').notNull(),
});

export type Document = InferSelectModel<typeof Documents>;

export const Likes = pgTable("likes", {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    messageId: uuid('messageId').notNull().references(() => message.id),
    createdAt: timestamp('createdAt').notNull()
})

export type Like = InferSelectModel<typeof Likes>;

export const Collections = pgTable('collections', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    name: varchar('name').notNull(),
    description: varchar('description').default(""),
    createdAt: timestamp('createdAt').notNull()
});

export type Collection = InferSelectModel<typeof Collections>

export const CollectionItems = pgTable('collection_items', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    collectionId: uuid('collectionId').notNull().references(() => Collections.id),
    chatId: uuid('chatId').notNull().references(() => chat.id),
    createdAt: timestamp('createdAt').notNull()
});

export type CollectionItem = InferSelectModel<typeof CollectionItems>

export const aiCreditUsageEvent = pgTable('ai_credit_usage_events', {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    userId: uuid('userId').notNull().references(() => user.id),
    amountCents: integer('amountCents').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type AICreditUsageEvent = InferSelectModel<typeof aiCreditUsageEvent>;

