import { createGateway } from '@ai-sdk/gateway';
import { createOpenAI } from '@ai-sdk/openai';

const apiKey = process.env.AI_GATEWAY_API_KEY ?? process.env.VERCEL_OIDC_TOKEN ?? '';

const _gateway = createGateway({ apiKey });

export const chatModel = _gateway('moonshotai/kimi-k2.5');
export const fastModel = _gateway('moonshotai/kimi-k2.5');
export const titleModel = _gateway('moonshotai/kimi-k2.5');

const _gatewayOpenAI = createOpenAI({
  apiKey,
  baseURL: 'https://ai-gateway.vercel.sh/v1',
});

export const imageModel = _gatewayOpenAI.image('dall-e-3');
