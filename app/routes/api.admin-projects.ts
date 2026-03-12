import type { Route } from "./+types/api.admin-projects";
import { getAuth } from "@clerk/react-router/ssr.server";
import { createClerkClient } from "@clerk/react-router/api.server";
import { cloudinary } from "~/lib/cloudinary";

async function verifyAdmin(args: Route.LoaderArgs | Route.ActionArgs) {
	const auth = await getAuth(args);
	const userId = "userId" in auth ? auth.userId : null;
	if (!userId) return false;
	const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
	const user = await clerk.users.getUser(userId);
	const role = (user.publicMetadata as { role?: string })?.role;
	return role === "admin";
}

// GET — list all projects across all users
export async function loader(args: Route.LoaderArgs) {
	try {
		if (!(await verifyAdmin(args))) {
			return Response.json({ error: "Forbidden" }, { status: 403 });
		}

		const url = new URL(args.request.url);
		const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
		const limit = Math.min(
			Number.parseInt(url.searchParams.get("limit") ?? "20", 10),
			50,
		);

		// Fetch all source images in the roomify/projects tree
		const result = await cloudinary.search
			.expression("folder:roomify/projects/* AND resource_type:image")
			.with_field("context")
			.with_field("tags")
			.sort_by("created_at", "desc")
			.max_results(500)
			.execute();

		if (!result.resources?.length) {
			return Response.json({
				projects: [],
				total: 0,
				page: 1,
				totalPages: 0,
			});
		}

		// Group by project (userId/projectId)
		const projectMap = new Map<
			string,
			{
				ownerId: string;
				projectId: string;
				source?: AdminProjectResource;
				renders: AdminProjectResource[];
				latestTimestamp: string;
			}
		>();

		for (const resource of result.resources as AdminProjectResource[]) {
			const parts = resource.public_id.split("/");
			// roomify/projects/{userId}/{projectId}/...
			const ownerId = parts[2] ?? "";
			const projectId = parts[3] ?? "";
			if (!ownerId || !projectId) continue;

			const key = `${ownerId}/${projectId}`;
			if (!projectMap.has(key)) {
				projectMap.set(key, {
					ownerId,
					projectId,
					renders: [],
					latestTimestamp: resource.created_at,
				});
			}

			const entry = projectMap.get(key)!;
			const tags = resource.tags ?? [];

			if (tags.includes("roomify_source") || !entry.source) {
				if (tags.includes("roomify_source")) {
					entry.source = resource;
				} else if (!entry.source) {
					entry.source = resource;
				}
			}
			if (tags.includes("roomify_rendered")) {
				entry.renders.push(resource);
			}

			if (resource.created_at > entry.latestTimestamp) {
				entry.latestTimestamp = resource.created_at;
			}
		}

		const allProjects = Array.from(projectMap.values()).map((data) => {
			const context = data.source?.context?.custom ?? {};
			const latestRender = data.renders[0];

			return {
				id: data.projectId,
				ownerId: data.ownerId,
				name:
					context.name ??
					context.project_name ??
					data.source?.filename ??
					"Untitled",
				sourceImage: data.source?.secure_url ?? "",
				sourcePublicId: data.source?.public_id ?? "",
				renderedImage: latestRender?.secure_url ?? null,
				renderCount: data.renders.length,
				timestamp: new Date(data.latestTimestamp).getTime(),
				isPublic: (data.source?.tags ?? []).includes("roomify_public"),
				totalBytes: data.source?.bytes ?? 0,
			};
		});

		// Sort by newest
		allProjects.sort((a, b) => b.timestamp - a.timestamp);

		// Paginate
		const start = (page - 1) * limit;
		const paginated = allProjects.slice(start, start + limit);

		return Response.json({
			projects: paginated,
			total: allProjects.length,
			page,
			totalPages: Math.ceil(allProjects.length / limit),
		});
	} catch (error) {
		console.error("Admin projects error:", error);
		return Response.json(
			{ error: "Failed to fetch projects" },
			{ status: 500 },
		);
	}
}

// DELETE — remove a project by ownerId + projectId
export async function action(args: Route.ActionArgs) {
	const { request } = args;

	try {
		if (!(await verifyAdmin(args))) {
			return Response.json({ error: "Forbidden" }, { status: 403 });
		}

		if (request.method !== "DELETE") {
			return Response.json({ error: "Method not allowed" }, { status: 405 });
		}

		const body = await request.json();
		const { ownerId, projectId } = body as {
			ownerId: string;
			projectId: string;
		};

		if (!ownerId || !projectId) {
			return Response.json(
				{ error: "Missing ownerId or projectId" },
				{ status: 400 },
			);
		}

		const folder = `roomify/projects/${ownerId}/${projectId}`;
		const searchResult = await cloudinary.search
			.expression(`folder:${folder}/* AND resource_type:image`)
			.max_results(50)
			.execute();

		const publicIds = (searchResult.resources as { public_id: string }[]).map(
			(r) => r.public_id,
		);

		if (publicIds.length > 0) {
			await cloudinary.api.delete_resources(publicIds);
		}

		try {
			await cloudinary.api.delete_folder(folder);
		} catch {
			/* folder may not exist */
		}

		return Response.json({ success: true });
	} catch (error) {
		console.error("Admin projects delete error:", error);
		return Response.json({ error: "Delete failed" }, { status: 500 });
	}
}

interface AdminProjectResource {
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
