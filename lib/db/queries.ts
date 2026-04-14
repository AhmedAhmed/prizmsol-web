import 'server-only';

import { and, asc, count, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { aiCreditUsageEvent, chat, CollectionItems, Collections, DBMessage, Documents, Likes, message, user, User } from './schema';

export async function getUser(email: string): Promise<User[]> {
    try {
        return await db.select().from(user).where(eq(user.email, email));
    } catch (_error) {
        throw new Error("Failed to get user");
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
        const [selectedUser] = await db.select().from(user).where(eq(user.id, id));
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
    plan: "free" | "pro" | "plus";
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
}: {
    id: string;
    title: string;
}) {
    try {
        return await db.insert(chat).values({
            id,
            createdAt: new Date(),
            title,
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
}: {
    page?: number;
    limit?: number;
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
                and(eq(chat.isDeleted, false)),
            );

        const totalPages = Math.ceil(totalCount / limit);

        // Get the chats for the requested page
        const chats = await db
            .select()
            .from(chat)
            .where(
                and(eq(chat.isDeleted, false)),
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

export async function saveDocument({
    id,
    chatId,
    title,
    content,
    type,
    media,
}: {
    id: string;
    chatId: string;
    content: string;
    title: string;
    type: 'text' | 'image' | 'code' | 'speech' | 'sheet';
    media: string;
}) {
    try {
        return await db.insert(Documents).values({
            id,
            chatId,
            content,
            title,
            type,
            media,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error('Failed to save document in database');
        throw error;
    }
}
export async function getDocumentsByChatId({
    chatId,
}: {
    chatId: string;
}) {
    try {
        return await db
            .select()
            .from(Documents)
            .where(eq(Documents.chatId, chatId))
            .orderBy(asc(Documents.createdAt));
    } catch (error) {
        console.error('Failed to get document by message id from database');
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

export async function saveCollection({
    name,
    description
}: {
    name: string;
    description: string;
}) {
    try {
        return await db.insert(Collections).values({
            name: name,
            description: description,
            createdAt: new Date()
        });
    } catch (error) {
        console.error('Failed to save collection in database');
        throw error;
    }
}

export async function updateCollectionDataById({
    id,
    name,
    description
}: {
    id: string;
    name: string;
    description: string;
}) {
    try {
        return await db.update(Collections).set({ name, description }).where(eq(Collections.id, id));
    } catch (error) {
        console.error('Failed to update collection data in database');
        throw error;
    }
}

export async function deleteCollection({
    id
}: {
    id: string;
}) {
    try {
        await db.delete(CollectionItems).where(eq(CollectionItems.collectionId, id))
        return await db.delete(Collections).where(eq(Collections.id, id));
    } catch (error: any) {
        console.log("Failed to delete collection in database");
        throw error;
    }
}

export async function getCollections() {
    try {
        return await db.select().from(Collections);
    } catch (error: any) {
        console.log("Failed to fetch collections");
        throw error;
    }
}

export async function getCollection({
    id
}: {
    id: string;
}) {
    try {
        const [selectedCollection] = await db.select().from(Collections).where(eq(Collections.id, id));
        return selectedCollection;
    } catch (error: any) {
        console.log("Failed to fetch the collection");
        throw error;
    }
}

export async function addToCollection({
    collectionId,
    chatId
}: {
    collectionId: string;
    chatId: string;
}) {
    try {
        return await db.insert(CollectionItems).values({
            collectionId: collectionId,
            chatId: chatId,
            createdAt: new Date(),
        });
    } catch (error: any) {
        console.log("Failed to add chat to the collection");
        throw error;
    }
}

export async function removeFromCollection({
    chatId,
    collectionId
}: {
    chatId: string;
    collectionId: string;
}) {
    try {
        return await db.delete(CollectionItems).where(
            and(
                eq(CollectionItems.id, collectionId),
                eq(chat.id, chatId)
            )
        )
    } catch (error: any) {
        console.log("Failed to remove chat from collection");
        throw error;
    }
}

export async function getChatsFromCollection({
    id
}: {
    id: string;
}) {
    try {
        return await db
            .select({
                id: chat.id,
                title: chat.title,
                visibility: chat.visibility,
                isDeleted: chat.isDeleted,
                createdAt: chat.createdAt,
            })
            .from(chat)
            .innerJoin(CollectionItems, eq(chat.id, CollectionItems.chatId))
            .where(
                and(
                    eq(CollectionItems.collectionId, id),
                    eq(chat.isDeleted, false)
                )
            );
    } catch (error: any) {
        console.log("Failed to remove chat from collection");
        throw error;
    }
}
