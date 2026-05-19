/**
 * Default monthly AI usage caps in USD when `FREE_AI_CREDIT_LIMIT_CENTS`,
 * `PRO_AI_CREDIT_LIMIT_CENTS`, or `MAX_AI_CREDIT_LIMIT_CENTS` are unset.
 * Limits are enforced in cents (USD × 100) in billing.
 */
export const PLAN_CREDIT_USD_DEFAULT = {
  free: 1,
  pro: 25,
  max: 250,
} as const;
