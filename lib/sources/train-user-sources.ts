import 'server-only';

import { createOpenAI } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import type { Source } from '@/lib/db/schema';
import {
    deleteChunksForSource,
    getUserById,
    getUserAiCreditUsageTotal,
    incrementUserAiCreditUsage,
    insertSourceChunksBatch,
    listSourcesForTraining,
    updateSourceStatus,
} from '@/lib/db/queries';
import { chunkText } from '@/lib/sources/chunk-text';
import { extractTextFromRemoteFile } from '@/lib/sources/parse-remote-file';
import { getCreditLimitCents, getCurrentUsageWindow } from '@/lib/stripe/billing';

const gatewayOpenAI = createOpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_OIDC_TOKEN ?? '',
    baseURL: 'https://ai-gateway.vercel.sh/v1',
});

const EMBED_MODEL = gatewayOpenAI.embedding('openai/text-embedding-3-small');

function getMetadataContent(meta: unknown): string | null {
    if (!meta || typeof meta !== 'object') return null;
    const c = (meta as Record<string, unknown>).content;
    return typeof c === 'string' ? c : null;
}

function getMetadataFileUrl(meta: unknown): string | null {
    if (!meta || typeof meta !== 'object') return null;
    const u = (meta as Record<string, unknown>).fileUrl;
    return typeof u === 'string' ? u : null;
}

function getMetadataUrl(meta: unknown): string | null {
    if (!meta || typeof meta !== 'object') return null;
    const u = (meta as Record<string, unknown>).url;
    return typeof u === 'string' ? u : null;
}

async function resolveSourcePlainText(src: Source): Promise<string> {
    const fromMeta = getMetadataContent(src.metadata);
    if (fromMeta?.trim()) return fromMeta;

    if (src.type === 'file') {
        const url = getMetadataFileUrl(src.metadata);
        if (!url) throw new Error('File source missing fileUrl in metadata');
        const { text } = await extractTextFromRemoteFile(url);
        return text;
    }

    if (src.type === 'website') {
        const url = getMetadataFileUrl(src.metadata) ?? getMetadataUrl(src.metadata);
        if (url?.startsWith('http')) {
            const { text } = await extractTextFromRemoteFile(url);
            return text;
        }
    }

    throw new Error(`No indexable content for source ${src.id}`);
}

function estimateEmbeddingTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

function calculateEmbeddingCostCents(totalTokens: number): number {
    const pricePerMillionTokens = 0.02;
    return (totalTokens / 1_000_000) * pricePerMillionTokens * 100;
}

export type TrainUserSourcesResult =
    | { ok: true; trained: number }
    | { ok: false; error: string };

export async function trainUserSources({
    userId,
}: {
    userId: string;
}): Promise<TrainUserSourcesResult> {
    if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
        return { ok: false, error: 'AI_GATEWAY_API_KEY is not configured.' };
    }

    const sources = await listSourcesForTraining({ userId });
    if (sources.length === 0) return { ok: false, error: 'No sources to train.' };

    const selectedUser = await getUserById(userId);
    if (!selectedUser) return { ok: false, error: 'User not found.' };

    const usageWindow = getCurrentUsageWindow({
        billingPeriodStart: selectedUser.billingPeriodStart,
        billingPeriodEnd: selectedUser.billingPeriodEnd,
    });
    const usedInWindowCents = await getUserAiCreditUsageTotal({
        userId,
        from: usageWindow.from,
        to: usageWindow.to,
    });
    const currentLimitCents = getCreditLimitCents((selectedUser.plan ?? 'free') as 'free' | 'pro' | 'max');

    let estimatedTotalTokens = 0;
    for (const src of sources) {
        try {
            const plain = await resolveSourcePlainText(src);
            estimatedTotalTokens += estimateEmbeddingTokens(plain);
        } catch (e) {
            console.warn('Could not resolve source text for estimation', src.id, e);
        }
    }

    const estimatedCostCents = calculateEmbeddingCostCents(estimatedTotalTokens);
    const availableCredits = currentLimitCents - usedInWindowCents;

    if (estimatedCostCents > availableCredits && availableCredits > 0) {
        return { ok: false, error: 'AI credit limit reached for your current plan. Not enough credits to train sources.' };
    }

    let trained = 0;
    let totalCostCents = 0;

    for (const src of sources) {
        try {
            await updateSourceStatus(src.id, 'processing');
            await deleteChunksForSource(src.id);

            const plain = await resolveSourcePlainText(src);
            const parts = chunkText(plain);
            if (parts.length === 0) {
                await updateSourceStatus(src.id, 'failed');
                continue;
            }

            const { embeddings } = await embedMany({
                model: EMBED_MODEL,
                values: parts,
            });

            await insertSourceChunksBatch(
                parts.map((content, idx) => ({
                    sourceId: src.id,
                    content,
                    embedding: embeddings[idx] ?? null,
                    chunkIndex: idx,
                    metadata: {},
                })),
            );

            const sourceTokens = estimateEmbeddingTokens(plain);
            const sourceCostCents = calculateEmbeddingCostCents(sourceTokens);
            totalCostCents += sourceCostCents;

            await updateSourceStatus(src.id, 'ready');
            trained += 1;
        } catch (e) {
            console.error('train source failed', src.id, e);
            await updateSourceStatus(src.id, 'failed');
        }
    }

    if (totalCostCents > 0) {
        await incrementUserAiCreditUsage({
            userId,
            amountCents: Math.ceil(totalCostCents),
        });
    }

    return { ok: true, trained };
}
