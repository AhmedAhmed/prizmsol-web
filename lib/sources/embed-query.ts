import 'server-only';
import { createOpenAI } from '@ai-sdk/openai';
import { embed } from 'ai';
 
const gatewayOpenAI = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_OIDC_TOKEN ?? '',
  baseURL: 'https://ai-gateway.vercel.sh/v1',
});
 
const EMBED_MODEL = gatewayOpenAI.embedding('openai/text-embedding-3-small');
 
export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: EMBED_MODEL, value: text });
  return embedding;
}
