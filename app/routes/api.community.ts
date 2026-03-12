import type { Route } from "./+types/api.community";
import { getAuth } from "@clerk/react-router/ssr.server";
import { cloudinary } from "~/lib/cloudinary";

// GET - Fetch all public community projects
export async function loader(_args: Route.LoaderArgs) {
	try {
		const result = await cloudinary.search
			.expression("tags=roomify_public AND resource_type:image")
			.sort_by("created_at", "desc")
			.max_results(50)
			.with_field("tags")
			.with_field("context")
			.execute();

		const projects: Array<{
			id: string;
			name: string;
			sourceImage: string;
			renderedImage: string | null;
			ownerName: string;
			style: string;
			createdAt: string;
		}> = [];

		const resources = result.resources ?? [];
		for (const resource of resources) {
			const ctx = resource.context?.custom ?? {};
			projects.push({
				id: resource.public_id,
				name: ctx.project_name ?? "Untitled",
				sourceImage: ctx.source_url ?? "",
				renderedImage: resource.secure_url,
				ownerName: ctx.owner_name ?? "Anonymous",
				style: ctx.style ?? "modern",
				createdAt: resource.created_at,
			});
		}

		return new Response(JSON.stringify({ projects }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Community fetch error:", error);
		return new Response(JSON.stringify({ projects: [] }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}
}

// POST - Publish a rendered project to the community gallery
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
		const { renderedImage, projectName, ownerName, style, sourceImage } = body;

		if (!renderedImage) {
			return new Response(
				JSON.stringify({ error: "No rendered image to share" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		if (
			!projectName ||
			projectName.trim() === "" ||
			projectName === "Untitled"
		) {
			return new Response(
				JSON.stringify({ error: "Project must have a name before publishing" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}

		// Upload the rendered image to community folder with public tag
		const folder = `roomify/community/${userId}`;
		const result = await cloudinary.uploader.upload(renderedImage, {
			folder,
			resource_type: "image",
			tags: ["roomify_public"],
			context: {
				project_name: projectName ?? "Untitled",
				owner_name: ownerName ?? "Anonymous",
				style: style ?? "modern",
				source_url: sourceImage ?? "",
				user_id: userId,
			},
		});

		return new Response(
			JSON.stringify({
				success: true,
				publicId: result.public_id,
				url: result.secure_url,
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } },
		);
	} catch (error) {
		console.error("Community publish error:", error);
		return new Response(JSON.stringify({ error: "Publish failed" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
