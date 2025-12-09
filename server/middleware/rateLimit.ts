import { RequestHandler } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
  skipFailedRequests?: boolean;
  message?: string;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export function createRateLimiter(config: RateLimitConfig): RequestHandler {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => {
      const user = req.user as any;
      if (user?.claims?.sub) {
        return `user:${user.claims.sub}`;
      }
      const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
      return `ip:${ip}`;
    },
    message = "Too many requests, please try again later.",
  } = config;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }

    const remaining = Math.max(0, maxRequests - entry.count);
    const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));

    if (entry.count > maxRequests) {
      res.setHeader("Retry-After", resetSeconds);
      return res.status(429).json({
        error: message,
        retryAfter: resetSeconds,
      });
    }

    next();
  };
}

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: "Too many requests. Please wait a minute before trying again.",
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyGenerator: (req) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    return `auth:${ip}`;
  },
  message: "Too many authentication attempts. Please wait 15 minutes.",
});

export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 200,
  keyGenerator: (req) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    return `webhook:${ip}`;
  },
  message: "Too many webhook requests.",
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: "Too many AI processing requests. Please wait a minute.",
});

export const suggestionRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: "Too many suggestion operations. Please slow down.",
});

interface PlanLimits {
  requestsPerMinute: number;
  suggestionsPerMonth: number;
  sourcesLimit: number;
  seatsLimit: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  starter: {
    requestsPerMinute: 60,
    suggestionsPerMonth: 100,
    sourcesLimit: 3,
    seatsLimit: 5,
  },
  growth: {
    requestsPerMinute: 120,
    suggestionsPerMonth: 500,
    sourcesLimit: 10,
    seatsLimit: 15,
  },
  scale: {
    requestsPerMinute: 200,
    suggestionsPerMonth: 2000,
    sourcesLimit: -1,
    seatsLimit: 50,
  },
  pro_scale: {
    requestsPerMinute: 300,
    suggestionsPerMonth: 5000,
    sourcesLimit: -1,
    seatsLimit: 100,
  },
  enterprise: {
    requestsPerMinute: 1000,
    suggestionsPerMonth: -1,
    sourcesLimit: -1,
    seatsLimit: -1,
  },
};

export function getPlanLimits(planId: string | null | undefined): PlanLimits {
  if (!planId) {
    return PLAN_LIMITS.starter;
  }
  return PLAN_LIMITS[planId] || PLAN_LIMITS.starter;
}

export function createPlanBasedRateLimiter(
  getPlanId: (req: any) => Promise<string | null>
): RequestHandler {
  const userLimits = new Map<string, { plan: string; limiter: RequestHandler }>();

  return async (req, res, next) => {
    const user = req.user as any;
    if (!user?.claims?.sub) {
      return apiRateLimiter(req, res, next);
    }

    const userId = user.claims.sub;
    const planId = await getPlanId(req);
    const limits = getPlanLimits(planId);

    let cached = userLimits.get(userId);
    if (!cached || cached.plan !== (planId || "starter")) {
      cached = {
        plan: planId || "starter",
        limiter: createRateLimiter({
          windowMs: 60 * 1000,
          maxRequests: limits.requestsPerMinute,
        }),
      };
      userLimits.set(userId, cached);
    }

    return cached.limiter(req, res, next);
  };
}
