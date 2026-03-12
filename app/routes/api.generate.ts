import type { Route } from "./+types/api.generate";
import { getAuth } from "@clerk/react-router/ssr.server";
import { generate3DView } from "~/lib/ai.action";

// In-memory rate limiter: userId -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = 10; // max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): {
	allowed: boolean;
	remaining: number;
} {
	const now = Date.now();
	const entry = rateLimitMap.get(userId);

	if (!entry || now > entry.resetTime) {
		rateLimitMap.set(userId, {
			count: 1,
			resetTime: now + RATE_LIMIT_WINDOW_MS,
		});
		return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
	}

	if (entry.count >= RATE_LIMIT_MAX) {
		return { allowed: false, remaining: 0 };
	}

	entry.count++;
	return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

export async function action(args: Route.ActionArgs) {
	const { request } = args;
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	try {
		// Auth check
		const auth = await getAuth(args);
		const userId = "userId" in auth ? auth.userId : null;
		if (!userId) {
			return new Response(
				JSON.stringify({ error: "Sign in to generate renders" }),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Rate limit check
		const { allowed, remaining } = checkRateLimit(userId);
		if (!allowed) {
			return new Response(
				JSON.stringify({
					error:
						"Rate limit exceeded. You can generate up to 10 renders per hour.",
				}),
				{
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": "3600",
						"X-RateLimit-Remaining": "0",
					},
				},
			);
		}

		const body = await request.json();
		const { sourceImageBase64, mimeType, style } = body;

		if (!sourceImageBase64 || !mimeType) {
			return new Response(JSON.stringify({ error: "Missing image data" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const result = await generate3DView({
			sourceImageBase64,
			mimeType,
			style: style ?? "modern",
		});

		if (!result) {
			return new Response(JSON.stringify({ error: "Generation failed" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"X-RateLimit-Remaining": String(remaining),
			},
		});
	} catch (error) {
		console.error("API generate error:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
