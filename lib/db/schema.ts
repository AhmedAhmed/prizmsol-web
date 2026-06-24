import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    json,
    pgTable,
    real,
    text,
    timestamp,
    uuid,
    varchar,
    vector,
} from "drizzle-orm/pg-core";

// ─── Auth Tables ─────────────────────────────────────────────────────────────

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    bio: text("bio").notNull().default(""),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),

    // Custom columns
    plan: varchar("plan", { enum: ["free", "pro", "max"] }).notNull().default("free"),
    stripeCustomerId: text("stripeCustomerId"),
    stripeSubscriptionId: text("stripeSubscriptionId"),
    stripeProductId: text("stripeProductId"),
    billingPeriodStart: timestamp("billingPeriodStart"),
    billingPeriodEnd: timestamp("billingPeriodEnd"),
    aiCreditUsedCents: integer("aiCreditUsedCents").notNull().default(0),
    description: text("description"),
    isAnonymous: boolean("isAnonymous").notNull().default(false),
});

export type User = InferSelectModel<typeof user>;

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export type Session = InferSelectModel<typeof session>;

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export type Account = InferSelectModel<typeof account>;

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export type Verification = InferSelectModel<typeof verification>;

// ─── App Tables ───────────────────────────────────────────────────────────────

export const chat = pgTable("chats", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    title: text("title").notNull(),
    userId: text("userId").references(() => user.id),
    visibility: varchar("visibility", { enum: ["public", "private"] })
        .notNull()
        .default("private"),
    isDeleted: boolean("isDeleted").notNull().default(false),
    createdAt: timestamp("createdAt").notNull(),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("messages", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: text("userId").references(() => user.id),
    chatId: uuid("chatId")
        .notNull()
        .references(() => chat.id),
    content: varchar("content").notNull(),
    role: varchar("role", { enum: ["data", "user", "system", "assistant"] }).notNull(),
    parts: json("parts").notNull(),
    attachments: json("attachments").notNull(),
    createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const Likes = pgTable("likes", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    messageId: uuid("messageId").notNull().references(() => message.id),
    createdAt: timestamp("createdAt").notNull(),
});

export type Like = InferSelectModel<typeof Likes>;

export const aiCreditUsageEvent = pgTable("ai_credit_usage_events", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: text("userId").notNull().references(() => user.id),
    amountCents: integer("amountCents").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type AICreditUsageEvent = InferSelectModel<typeof aiCreditUsageEvent>;

export const portfolio = pgTable("portfolio", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: text("userId").notNull().references(() => user.id),
    vanity: varchar("vanity").unique().notNull(),
    photo: varchar("photo").notNull(),
    title: varchar("title").notNull(),
    description: varchar("description").notNull(),
    theme: varchar("theme").default("prizm").notNull(),
    config: json("data").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Portfolio = InferSelectModel<typeof portfolio>;

// ─── Sources ──────────────────────────────────────────────────────────────────

/** User-attached materials (website / text / file) and training pipeline status. */
export const source = pgTable(
    "sources",
    {
        id: uuid("id").primaryKey().notNull().defaultRandom(),
        userId: text("userId")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        type: varchar("type", { enum: ["website", "text", "file"] }).notNull(),
        name: varchar("name").notNull(),
        status: varchar("status", {
            enum: ["pending", "processing", "ready", "failed"],
        })
            .notNull()
            .default("pending"),
        metadata: json("metadata").notNull().default({}),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        index("sources_userId_idx").on(table.userId),
    ],
);

/** text-embedding-3-small = 1536; text-embedding-3-large = 3072 */
export const SOURCE_EMBEDDING_DIMENSIONS = 1536 as const;

/**
 * One row per chunk: raw text + optional embedding for similarity search.
 * Parent metadata and ingestion status live on `source`.
 */
export const sourceChunk = pgTable(
    "source_chunks",
    {
        id: uuid("id").primaryKey().notNull().defaultRandom(),
        sourceId: uuid("sourceId")
            .notNull()
            .references(() => source.id, { onDelete: "cascade" }),
        content: text("content").notNull(),
        embedding: vector("embedding", { dimensions: SOURCE_EMBEDDING_DIMENSIONS }),
        chunkIndex: integer("chunkIndex").notNull(),
        metadata: json("metadata").notNull().default({}),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [index("source_chunks_source_idx").on(table.sourceId)],
);

export type DBSource = InferSelectModel<typeof source>;
export type SourceType = DBSource["type"];
export type Source = DBSource;

export type DBSourceChunk = InferSelectModel<typeof sourceChunk>;

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    messages: many(message),
    aiCreditUsageEvents: many(aiCreditUsageEvent),
    sources: many(source),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const messageRelations = relations(message, ({ one }) => ({
    user: one(user, { fields: [message.userId], references: [user.id] }),
    chat: one(chat, { fields: [message.chatId], references: [chat.id] }),
}));

export const sourceRelations = relations(source, ({ one, many }) => ({
    user: one(user, { fields: [source.userId], references: [user.id] }),
    chunks: many(sourceChunk),
}));

export const sourceChunkRelations = relations(sourceChunk, ({ one }) => ({
    source: one(source, { fields: [sourceChunk.sourceId], references: [source.id] }),
}));
