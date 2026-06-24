import 'server-only';

import { and, asc, count, desc, eq, gte, inArray, lte, ne, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { aiCreditUsageEvent, chat, DBMessage, Likes, message, portfolio, source, Source, sourceChunk, user, User } from './schema';

export async function getUser(email: string): Promise<User[]> {
    try {
        return await db.select().from(user).where(eq(user.email, email));
    } catch (_error) {
        throw new Error("Failed to get user");
    }
}

export async function updateUserInformation(userId: string, data: { name?: string; image?: string; }): Promise<boolean> {
    try {
        const response = await db.update(user).set(data).where(eq(user.id, userId));
        if (response.count > 0) {
            console.log("User updated successfully");
            return true;
        }
        return false;
    } catch (_error) {
        console.error("Failed to update user information");
        return false;
    }
}

export async function updateUserStripeCustomerId({
    userId,
    stripeCustomerId,
}: {
    userId: string;
    stripeCustomerId: string;
}) {
    try {
        return await db
            .update(user)
            .set({ stripeCustomerId, updatedAt: new Date() })
            .where(eq(user.id, userId));
    } catch (_error) {
        throw new Error("Failed to update user stripe customer id");
    }
}

export async function getUserById(id: string): Promise<User | null> {
    try {
        const [selectedUser] = await db.select().from(user).where(eq(user.id, id as string));
        return selectedUser ?? null;
    } catch (_error) {
        throw new Error("Failed to get user");
    }
}

export async function getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    try {
        const [selectedUser] = await db
            .select()
            .from(user)
            .where(eq(user.stripeCustomerId, stripeCustomerId));
        return selectedUser ?? null;
    } catch (_error) {
        throw new Error("Failed to get user by stripe customer id");
    }
}

export async function updateUserPlanAndSubscription({
    userId,
    plan,
    stripeSubscriptionId,
    stripeProductId,
    billingPeriodStart,
    billingPeriodEnd,
    resetCredits,
}: {
    userId: string;
    plan: "free" | "pro" | "max";
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    billingPeriodStart: Date | null;
    billingPeriodEnd: Date | null;
    resetCredits?: boolean;
}) {
    try {
        return await db
            .update(user)
            .set({
                plan,
                stripeSubscriptionId,
                stripeProductId,
                billingPeriodStart,
                billingPeriodEnd,
                aiCreditUsedCents: resetCredits ? 0 : undefined,
                updatedAt: new Date(),
            })
            .where(eq(user.id, userId));
    } catch (_error) {
        throw new Error("Failed to update user subscription");
    }
}

export async function incrementUserAiCreditUsage({
    userId,
    amountCents,
}: {
    userId: string;
    amountCents: number;
}) {
    try {
        const [selectedUser] = await db.select().from(user).where(eq(user.id, userId));
        if (!selectedUser) return null;

        const nextValue = Math.max(0, (selectedUser.aiCreditUsedCents ?? 0) + amountCents);
        await db
            .update(user)
            .set({ aiCreditUsedCents: nextValue, updatedAt: new Date() })
            .where(eq(user.id, userId));

        if (amountCents > 0) {
            await db.insert(aiCreditUsageEvent).values({
                userId,
                amountCents,
                createdAt: new Date(),
            });
        }
        return nextValue;
    } catch (_error) {
        throw new Error("Failed to increment user ai credit usage");
    }
}

export async function getUserAiCreditUsageEvents({
    userId,
    from,
    to,
}: {
    userId: string;
    from: Date;
    to: Date;
}) {
    try {
        return await db
            .select()
            .from(aiCreditUsageEvent)
            .where(
                and(
                    eq(aiCreditUsageEvent.userId, userId),
                    gte(aiCreditUsageEvent.createdAt, from),
                    lte(aiCreditUsageEvent.createdAt, to),
                ),
            )
            .orderBy(asc(aiCreditUsageEvent.createdAt));
    } catch (_error) {
        throw new Error("Failed to fetch user ai credit usage events");
    }
}

export async function getUserAiCreditUsageTotal({
    userId,
    from,
    to,
}: {
    userId: string;
    from: Date;
    to: Date;
}) {
    try {
        const [row] = await db
            .select({ total: sql<number>`coalesce(sum(${aiCreditUsageEvent.amountCents}), 0)` })
            .from(aiCreditUsageEvent)
            .where(
                and(
                    eq(aiCreditUsageEvent.userId, userId),
                    gte(aiCreditUsageEvent.createdAt, from),
                    lte(aiCreditUsageEvent.createdAt, to),
                ),
            );

        return Number(row?.total ?? 0);
    } catch (_error) {
        throw new Error("Failed to fetch user ai credit usage total");
    }
}

export async function saveChat({
    id,
    title,
    userId
}: {
    id: string;
    title: string;
    userId: string;
}) {
    try {
        return await db.insert(chat).values({
            id,
            createdAt: new Date(),
            title,
            userId
        });
    } catch (error) {
        console.error('Failed to save chat in database');
        throw error;
    }
}

export async function deleteChatById({ id }: { id: string }) {
    try {
        // set all isDeleted messages to true.
        return await db.update(chat).set({ isDeleted: true }).where(eq(chat.id, id));
    } catch (error) {
        console.error('Failed to delete chat by id from database');
        throw error;
    }
}

export async function getChats({
    page = 1,
    limit = 20,
    userId
}: {
    page?: number;
    limit?: number;
    userId: string;
}) {
    try {
        // Validate page number
        if (page < 1) {
            throw new Error('Page number must be at least 1');
        }

        // Calculate the offset
        const offset = (page - 1) * limit;

        // Get total count for pagination metadata
        const [{ count: totalCount }]: any = await db
            .select({ count: count() })
            .from(chat)
            .where(
                and(eq(chat.isDeleted, false), eq(chat.userId, userId)),
            );

        const totalPages = Math.ceil(totalCount / limit);

        // Get the chats for the requested page
        const chats = await db
            .select()
            .from(chat)
            .where(
                and(eq(chat.isDeleted, false), eq(chat.userId, userId)),
            )
            .orderBy(desc(chat.createdAt))
            .limit(limit)
            .offset(offset);

        return {
            chats,
            pagination: {
                total: totalCount,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                nextPage: page < totalPages ? page + 1 : null,
                previousPage: page > 1 ? page - 1 : null,
            }
        };
    } catch (error) {
        console.error('Failed to get chats by user from database');
        throw error;
    }
}

export async function getChatById({ id }: { id: string }) {
    try {
        const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
        return selectedChat;
    } catch (error) {
        console.error('Failed to get chat by id from database');
        return null;
    }
}

export async function saveMessages({
    messages,
}: {
    messages: Array<DBMessage>;
}) {
    try {
        return await db.insert(message).values(messages);
    } catch (error) {
        console.error('Failed to save messages in database', error);
        throw error;
    }
}

export async function getMessagesByChatId({ id }: { id: string }) {
    try {
        return await db
            .select()
            .from(message)
            .where(
                eq(message.chatId, id),
            )
            .orderBy(asc(message.createdAt));
    } catch (error) {
        console.error('Failed to get messages by chat id from database', error);
        throw error;
    }
}

export async function getMessageById({ id }: { id: string }) {
    try {
        return await db.select().from(message).where(eq(message.id, id));
    } catch (error) {
        console.error('Failed to get message by id from database');
        throw error;
    }
}

export async function deleteMessagesByChatIdAfterTimestamp({
    chatId,
    timestamp,
}: {
    chatId: string;
    timestamp: Date;
}) {
    try {
        const messagesToDelete = await db
            .select({ id: message.id })
            .from(message)
            .where(
                and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
            );

        const messageIds = messagesToDelete.map((message) => message.id);

        if (messageIds.length > 0) {

            return await db
                .delete(message)
                .where(
                    and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
                );
        }
    } catch (error) {
        console.error(
            'Failed to delete messages by id after timestamp from database',
        );
        throw error;
    }
}

export async function updateChatVisiblityById({
    chatId,
    visibility,
}: {
    chatId: string;
    visibility: 'private' | 'public';
}) {
    try {
        return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
    } catch (error) {
        console.error('Failed to update chat visibility in database');
        throw error;
    }
}

export async function updateChatTitleById({
    chatId,
    title,
}: {
    chatId: string;
    title: string;
}) {
    try {
        return await db.update(chat).set({ title }).where(eq(chat.id, chatId));
    } catch (error) {
        console.error('Failed to update chat title in database');
        throw error;
    }
}




// get count of messages sent this month by user from all chats.
export async function getMessagesCountByUserId(): Promise<number> {
    try {
        // gets subscription time and convert date object accordingly.
        const startTimestamp = new Date() || null;
        let startDate = new Date(0);

        // default timeframe for free users.
        const currentDate = new Date();
        const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1,
        );

        const [{ count: messageCount }] = await db
            .select({ count: count(message.id) })
            .from(message)
            .where(
                and(
                    eq(message.role, 'assistant'),
                    // apply correct start time based on plan.
                    gte(message.createdAt, startTimestamp ? startDate : startOfMonth),
                ),
            )
            .innerJoin(chat, eq(chat.id, message.chatId));

        return messageCount;
    } catch (error) {
        console.error('Failed to get messages count by user id from database');
        return 0;
    }
}

export async function LikeMessage({
    messageId
}: {
    messageId: string;
}) {
    try {
        return await db.insert(Likes).values({
            messageId,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error('Failed to save document in database');
        throw error;
    }
}

export async function GetLike({
    messageId
}: {
    messageId: string;
}) {
    try {
        return await db
            .select()
            .from(Likes)
            .where(eq(Likes.messageId, messageId));
    } catch (error) {
        console.error('Failed to get like by message id from database');
        throw error;
    }
}

export async function getPortfolioVanity(vanity: string) {
    try {
        const [selectedPortfolio] = await db
            .select()
            .from(portfolio)
            .where(eq(portfolio.vanity, vanity));
        return selectedPortfolio ?? null;
    } catch (error) {
        console.error('Failed to get portfolio vanity from database');
        throw error;
    }
}

export async function getPortfolioByUserId(userId: string) {
    try {
        const [selectedPortfolio] = await db
            .select()
            .from(portfolio)
            .where(eq(portfolio.userId, userId));
        return selectedPortfolio ?? null;
    } catch (error) {
        console.error('Failed to get portfolio vanity from database');
        throw error;
    }
}

export async function savePortfolio({
    userId,
    vanity,
    photo,
    title,
    description,
    theme,
    config
}: {
    userId: string;
    vanity: string;
    photo: string;
    title: string;
    description: string;
    theme: string;
    config: any;
}) {
    try {
        const isTaken = await getPortfolioVanity(vanity);
        if (isTaken) {
            throw new Error('Portfolio vanity already created');
        }
        return await db.insert(portfolio).values({
            userId,
            vanity,
            photo,
            title,
            description,
            theme,
            config,
            createdAt: new Date()
        });
    } catch (error) {
        console.error('Failed to save portfolio in database');
        throw error;
    }
}

export async function updatePortfolio({
    userId,
    vanity,
    photo,
    title,
    description,
    theme,
    config
}: {
    userId: string;
    vanity: string;
    photo: string;
    title: string;
    description: string;
    theme: string;
    config: any;
}) {
    try {
        const isTaken = await getPortfolioVanity(vanity);
        if (isTaken) {
            throw new Error('Portfolio vanity already created');
        }
        return await db.update(portfolio).set({
            userId,
            vanity,
            photo,
            title,
            description,
            theme,
            config,
        }).where(eq(portfolio.userId, userId));
    } catch (error) {
        console.error('Failed to save portfolio in database');
        throw error;
    }
}

// ── Sources ─────────────────────────────────────────────────────────

/**
 * Loads `ready` sources owned by the user and concatenates
 * all `source_chunks` in order for chat / RAG context.
 */
export async function getSourcesByIdsForUser({
    userId,
    ids,
}: {
    userId: string;
    ids: string[];
}): Promise<{ title: string; content: string }[]> {
    if (ids.length === 0) {
        return [];
    }
    try {
        const chunkRows = await db
            .select({
                sourceId: source.id,
                sourceName: source.name,
                chunkIndex: sourceChunk.chunkIndex,
                content: sourceChunk.content,
            })
            .from(sourceChunk)
            .innerJoin(source, eq(sourceChunk.sourceId, source.id))
            .where(
                and(
                    inArray(source.id, ids),
                    eq(source.status, 'ready'),
                    eq(source.userId, userId),
                ),
            )
            .orderBy(asc(source.id), asc(sourceChunk.chunkIndex));

        const bySource = new Map<string, { name: string; parts: string[] }>();
        for (const row of chunkRows) {
            const key = row.sourceId;
            if (!bySource.has(key)) {
                bySource.set(key, { name: row.sourceName, parts: [] });
            }
            bySource.get(key)!.parts.push(row.content);
        }

        return [...bySource.values()].map((v) => ({
            title: v.name,
            content: v.parts.join('\n\n'),
        }));
    } catch (_error) {
        throw new Error('Failed to get sources');
    }
}

export async function getReadySourcesForUser({
    userId,
}: {
    userId: string;
}): Promise<{ title: string; content: string }[]> {
    try {
        const chunkRows = await db
            .select({
                sourceId: source.id,
                sourceName: source.name,
                chunkIndex: sourceChunk.chunkIndex,
                content: sourceChunk.content,
            })
            .from(sourceChunk)
            .innerJoin(source, eq(sourceChunk.sourceId, source.id))
            .where(
                and(
                    eq(source.status, 'ready'),
                    eq(source.userId, userId),
                ),
            )
            .orderBy(asc(source.id), asc(sourceChunk.chunkIndex));

        const bySource = new Map<string, { name: string; parts: string[] }>();
        for (const row of chunkRows) {
            const key = row.sourceId;
            if (!bySource.has(key)) {
                bySource.set(key, { name: row.sourceName, parts: [] });
            }
            bySource.get(key)!.parts.push(row.content);
        }

        return [...bySource.values()].map((v) => ({
            title: v.name,
            content: v.parts.join('\n\n'),
        }));
    } catch (_error) {
        throw new Error('Failed to get ready sources');
    }
}

export async function getTopKChunksByEmbedding({
    userId,
    embedding,
    topK = 5,
}: {
    userId: string;
    embedding: number[];
    topK?: number;
}): Promise<{ content: string; title: string }[]> {
    try {
        const vectorLiteral = `[${embedding.join(',')}]`;

        const rows = await db
            .select({
                content: sourceChunk.content,
                title: source.name,
                distance: sql<number>`${sourceChunk.embedding} <=> ${sql.raw(`'${vectorLiteral}'`)}::vector`,
            })
            .from(sourceChunk)
            .innerJoin(source, eq(sourceChunk.sourceId, source.id))
            .where(
                and(
                    eq(source.status, 'ready'),
                    eq(source.userId, userId),
                ),
            )
            .orderBy(
                asc(sql`${sourceChunk.embedding} <=> ${sql.raw(`'${vectorLiteral}'`)}::vector`),
            )
            .limit(topK);

        return rows.map((r) => ({ content: r.content, title: r.title }));
    } catch (error) {
        throw new Error('Failed to retrieve similar chunks');
    }
}

export async function getSourcesForUser({
    userId,
    type,
    limit = 50,
}: {
    userId: string;
    type?: Source['type'];
    limit?: number;
}): Promise<Source[]> {
    const conditions = [eq(source.userId, userId)];
    if (type) {
        conditions.push(eq(source.type, type));
    }
    try {
        return await db
            .select()
            .from(source)
            .where(and(...conditions))
            .orderBy(desc(source.createdAt))
            .limit(limit);
    } catch (_error) {
        throw new Error('Failed to list sources');
    }
}

export async function insertUserSource({
    userId,
    type,
    name,
    metadata,
}: {
    userId: string;
    type: Source['type'];
    name: string;
    metadata: Record<string, unknown>;
}): Promise<Source | null> {
    try {
        const [row] = await db
            .insert(source)
            .values({
                userId,
                type,
                name,
                status: 'pending',
                metadata,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();
        return row ?? null;
    } catch (_error) {
        throw new Error('Failed to insert source');
    }
}

export async function deleteSourceForOwner({
    sourceId,
    userId,
}: {
    sourceId: string;
    userId: string;
}): Promise<boolean> {
    try {
        const match = await db
            .select({ id: source.id })
            .from(source)
            .where(and(eq(source.id, sourceId), eq(source.userId, userId)))
            .limit(1);
        if (!match[0]) {
            return false;
        }
        await db.delete(source).where(eq(source.id, sourceId));
        return true;
    } catch (_error) {
        throw new Error('Failed to delete source');
    }
}

export async function listSourcesForTraining({
    userId,
}: {
    userId: string;
}): Promise<Source[]> {
    return db
        .select()
        .from(source)
        .where(and(eq(source.userId, userId), ne(source.status, 'failed')))
        .orderBy(asc(source.createdAt));
}

export async function deleteChunksForSource(sourceId: string) {
    await db.delete(sourceChunk).where(eq(sourceChunk.sourceId, sourceId));
}

export async function insertSourceChunksBatch(
    rows: {
        sourceId: string;
        content: string;
        embedding: number[] | null;
        chunkIndex: number;
        metadata?: Record<string, unknown>;
    }[],
) {
    const batchSize = 30;
    for (let i = 0; i < rows.length; i += batchSize) {
        const slice = rows.slice(i, i + batchSize);
        await db.insert(sourceChunk).values(
            slice.map((r) => ({
                sourceId: r.sourceId,
                content: r.content,
                embedding: r.embedding ?? null,
                chunkIndex: r.chunkIndex,
                metadata: r.metadata ?? {},
                createdAt: new Date(),
            })),
        );
    }
}

export async function updateSourceStatus(
    sourceId: string,
    status: Source['status'],
) {
    await db
        .update(source)
        .set({ status, updatedAt: new Date() })
        .where(eq(source.id, sourceId));
}

export async function updateSourceMetadata(
    sourceId: string,
    metadata: Record<string, unknown>,
) {
    await db
        .update(source)
        .set({ metadata, updatedAt: new Date() })
        .where(eq(source.id, sourceId));
}

/** Clears chunk embeddings and marks all sources for a user as pending (retrain needed). */
export async function resetUserSourcesTraining(userId: string) {
    const srcIds = await db.select({ id: source.id }).from(source).where(eq(source.userId, userId));
    for (const { id } of srcIds) {
        await db.delete(sourceChunk).where(eq(sourceChunk.sourceId, id));
    }
    if (srcIds.length > 0) {
        await db
            .update(source)
            .set({ status: 'pending', updatedAt: new Date() })
            .where(eq(source.userId, userId));
    }
}
