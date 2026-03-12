import type { Route } from "./+types/api.projects";
import { getAuth } from "@clerk/react-router/ssr.server";
import { cloudinary, uploadImage, deleteImage } from "~/lib/cloudinary";

// GET — list the current user's projects from Cloudinary
export async function loader(args: Route.LoaderArgs) {
	try {
		const auth = await getAuth(args);
		const userId = "userId" in auth ? auth.userId : null;
		if (!userId) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const projects = await getUserProjects(userId);
		return Response.json({ projects });
	} catch (error) {
		console.error("Projects loader error:", error);
		return Response.json(
			{ error: "Failed to fetch projects" },
			{ status: 500 },
		);
	}
}

// POST — save / update project metadata, DELETE — remove project
export async function action(args: Route.ActionArgs) {
	const { request } = args;

	try {
		const auth = await getAuth(args);
		const userId = "userId" in auth ? auth.userId : null;
		if (!userId) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (request.method === "DELETE") {
			const body = await request.json();
			const { projectId } = body as { projectId: string };
			if (!projectId) {
				return Response.json({ error: "Missing projectId" }, { status: 400 });
			}

			// Find and delete all resources in the project folder
			const folder = `roomify/projects/${userId}/${projectId}`;
			try {
				const searchResult = await cloudinary.search
					.expression(`folder:${folder}/* AND resource_type:image`)
					.max_results(50)
					.execute();

				const publicIds = (
					searchResult.resources as { public_id: string }[]
				).map((r) => r.public_id);
				if (publicIds.length > 0) {
					await cloudinary.api.delete_resources(publicIds);
				}
				// Try to delete the folder too
				try {
					await cloudinary.api.delete_folder(folder);
				} catch {
					/* folder may not exist */
				}
			} catch {
				/* ignore search failures */
			}

			return Response.json({ success: true });
		}

		if (request.method === "POST") {
			const body = await request.json();
			const {
				action: projectAction,
				projectId,
				data,
			} = body as {
				action: string;
				projectId: string;
				data?: {
					name?: string;
					renderedImage?: string;
					style?: string;
				};
			};

			if (!projectId) {
				return Response.json({ error: "Missing projectId" }, { status: 400 });
			}

			if (projectAction === "save-render" && data?.renderedImage) {
				// Upload rendered image to Cloudinary
				const folder = `roomify/projects/${userId}/${projectId}`;
				const styleSuffix = data.style ?? "modern";
				const result = await uploadImage(data.renderedImage, folder);

				// Tag the resource with project metadata
				await cloudinary.uploader.add_context(
					`project_id=${projectId}|owner_id=${userId}|type=rendered|style=${styleSuffix}|name=${data.name ?? ""}`,
					[result.public_id],
				);
				await cloudinary.uploader.add_tag("roomify_rendered", [
					result.public_id,
				]);

				return Response.json({
					success: true,
					public_id: result.public_id,
					secure_url: result.secure_url,
				});
			}

			if (projectAction === "rename" && data?.name) {
				// Update the context metadata on the source image
				const folder = `roomify/projects/${userId}/${projectId}`;
				const searchResult = await cloudinary.search
					.expression(
						`folder:${folder}/* AND resource_type:image AND tags=roomify_source`,
					)
					.max_results(1)
					.execute();

				if (searchResult.resources?.length > 0) {
					const publicId = (
						searchResult.resources as { public_id: string }[]
					)[0].public_id;
					await cloudinary.uploader.add_context(`name=${data.name}`, [
						publicId,
					]);
				}

				return Response.json({ success: true });
			}

			if (projectAction === "publish") {
				// Add roomify_public tag to the source image
				const folder = `roomify/projects/${userId}/${projectId}`;
				const searchResult = await cloudinary.search
					.expression(
						`folder:${folder}/* AND resource_type:image AND tags=roomify_source`,
					)
					.max_results(1)
					.execute();

				if (searchResult.resources?.length > 0) {
					const publicId = (
						searchResult.resources as { public_id: string }[]
					)[0].public_id;
					await cloudinary.uploader.add_tag("roomify_public", [publicId]);
				}

				return Response.json({ success: true });
			}

			if (projectAction === "unpublish") {
				// Remove roomify_public tag and delete community copy
				const folder = `roomify/projects/${userId}/${projectId}`;
				const searchResult = await cloudinary.search
					.expression(
						`folder:${folder}/* AND resource_type:image AND tags=roomify_source`,
					)
					.max_results(1)
					.execute();

				if (searchResult.resources?.length > 0) {
					const publicId = (
						searchResult.resources as { public_id: string }[]
					)[0].public_id;
					await cloudinary.uploader.remove_tag("roomify_public", [publicId]);
				}

				// Also remove from community folder
				try {
					const communityResult = await cloudinary.search
						.expression(
							`folder:roomify/community/${userId} AND tags=roomify_public AND resource_type:image`,
						)
						.with_field("context")
						.max_results(50)
						.execute();

					const toDelete = (
						communityResult.resources as {
							public_id: string;
							context?: { custom?: Record<string, string> };
						}[]
					)
						.filter((r) => {
							const ctx = r.context?.custom ?? {};
							return (
								ctx.project_name === projectId || ctx.project_id === projectId
							);
						})
						.map((r) => r.public_id);

					if (toDelete.length > 0) {
						await cloudinary.api.delete_resources(toDelete);
					}
				} catch {
					/* non-critical */
				}

				return Response.json({ success: true });
			}

			return Response.json({ error: "Unknown action" }, { status: 400 });
		}

		return Response.json({ error: "Method not allowed" }, { status: 405 });
	} catch (error) {
		console.error("Projects action error:", error);
		return Response.json({ error: "Operation failed" }, { status: 500 });
	}
}

// Fetch all projects for a user from Cloudinary
async function getUserProjects(userId: string): Promise<DesignItem[]> {
	try {
		const folder = `roomify/projects/${userId}`;

		// Search for all images in user's project folders
		const result = await cloudinary.search
			.expression(`folder:${folder}/* AND resource_type:image`)
			.with_field("context")
			.with_field("tags")
			.sort_by("created_at", "desc")
			.max_results(200)
			.execute();

		if (!result.resources?.length) return [];

		// Group resources by project folder
		const projectMap = new Map<
			string,
			{
				source?: CloudinaryResource;
				renders: CloudinaryResource[];
				latestTimestamp: number;
			}
		>();

		for (const resource of result.resources as CloudinaryResource[]) {
			// Extract project ID from folder path: roomify/projects/{userId}/{projectId}/...
			const parts = resource.public_id.split("/");
			const projectId = parts[3] ?? "";
			if (!projectId) continue;

			if (!projectMap.has(projectId)) {
				projectMap.set(projectId, {
					renders: [],
					latestTimestamp: 0,
				});
			}

			const entry = projectMap.get(projectId)!;
			const createdAt = new Date(resource.created_at).getTime();
			if (createdAt > entry.latestTimestamp) {
				entry.latestTimestamp = createdAt;
			}

			const tags = resource.tags ?? [];
			if (tags.includes("roomify_source")) {
				entry.source = resource;
			} else if (tags.includes("roomify_rendered")) {
				entry.renders.push(resource);
			} else {
				// Assume first image without tags is the source
				if (!entry.source) {
					entry.source = resource;
				} else {
					entry.renders.push(resource);
				}
			}
		}

		// Convert to DesignItem array
		const projects: DesignItem[] = [];
		for (const [projectId, data] of projectMap) {
			if (!data.source) continue;

			const context = data.source.context?.custom ?? {};
			const latestRender =
				data.renders.length > 0 ? data.renders[0] : undefined;
			const renderContext = latestRender?.context?.custom ?? {};

			projects.push({
				id: projectId,
				name:
					context.name ??
					context.project_name ??
					data.source.filename ??
					"Untitled",
				sourceImage: data.source.secure_url,
				sourcePublicId: data.source.public_id,
				renderedImage: latestRender?.secure_url ?? null,
				renderedPublicId: latestRender?.public_id ?? null,
				style: renderContext.style ?? null,
				timestamp: data.latestTimestamp,
				ownerId: userId,
				isPublic: (data.source.tags ?? []).includes("roomify_public"),
			});
		}

		// Sort newest first
		projects.sort((a, b) => b.timestamp - a.timestamp);
		return projects;
	} catch (error) {
		console.error("getUserProjects error:", error);
		return [];
	}
}

// Internal type for Cloudinary search results
interface CloudinaryResource {
	public_id: string;
	secure_url: string;
	created_at: string;
	filename: string;
	format: string;
	bytes: number;
	width: number;
	height: number;
	tags?: string[];
	context?: {
		custom?: Record<string, string>;
	};
}
