import type { Route } from "./+types/api.generate";
import { generate3DView } from "~/lib/ai.action";

export async function action({ request }: Route.ActionArgs) {
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	try {
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
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("API generate error:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
