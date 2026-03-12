import type { Route } from "./+types/api.upload";
import { uploadImage, cloudinary } from "~/lib/cloudinary";
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
		const { imageBase64, folder, projectName } = body;

		if (!imageBase64 || !folder) {
			return new Response(
				JSON.stringify({ error: "Missing imageBase64 or folder" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		// Validate folder path belongs to the authenticated user
		const expectedPrefix = `roomify/projects/${userId}`;
		if (!folder.startsWith(expectedPrefix)) {
			return new Response(JSON.stringify({ error: "Forbidden" }), {
				status: 403,
				headers: { "Content-Type": "application/json" },
			});
		}

		const result = await uploadImage(imageBase64, folder);

		// Tag and add context metadata to the source image
		try {
			await cloudinary.uploader.add_tag("roomify_source", [result.public_id]);
			const contextParts = [`owner_id=${userId}`];
			if (projectName) contextParts.push(`name=${projectName}`);
			// Extract projectId from folder path
			const folderParts = folder.split("/");
			const projectId = folderParts[3] ?? "";
			if (projectId) contextParts.push(`project_id=${projectId}`);
			await cloudinary.uploader.add_context(contextParts.join("|"), [
				result.public_id,
			]);
		} catch {
			// Non-critical: metadata tagging failed but upload succeeded
		}

		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Upload error:", error);
		return new Response(JSON.stringify({ error: "Upload failed" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
