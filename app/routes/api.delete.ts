import type { Route } from "./+types/api.delete";
import { deleteImage } from "~/lib/cloudinary";
import { getAuth } from "@clerk/react-router/ssr.server";

export async function action(args: Route.ActionArgs) {
	const { request } = args;
	if (request.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	try {
		const auth = await getAuth(args);
		const userId = "userId" in auth ? auth.userId : null;
		if (!userId) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		const body = await request.json();
		const { publicId } = body;

		if (!publicId) {
			return new Response(JSON.stringify({ error: "Missing publicId" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Validate that the publicId belongs to the authenticated user
		const expectedPrefix = `roomify/projects/${userId}`;
		if (!publicId.startsWith(expectedPrefix)) {
			return new Response(JSON.stringify({ error: "Forbidden" }), {
				status: 403,
				headers: { "Content-Type": "application/json" },
			});
		}

		await deleteImage(publicId);

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Delete error:", error);
		return new Response(JSON.stringify({ error: "Delete failed" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
