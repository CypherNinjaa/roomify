import type { Route } from "./+types/api.admin-stats";
import { getAuth } from "@clerk/react-router/ssr.server";
import { createClerkClient } from "@clerk/react-router/api.server";
import { cloudinary } from "~/lib/cloudinary";

export async function loader(args: Route.LoaderArgs) {
	try {
		const auth = await getAuth(args);
		const userId = "userId" in auth ? auth.userId : null;
		if (!userId) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Verify admin role via Clerk session claims
		const claims = "sessionClaims" in auth ? auth.sessionClaims : null;
		const role = (claims?.publicMetadata as { role?: string })?.role ?? null;
		if (role !== "admin") {
			return new Response(JSON.stringify({ error: "Forbidden" }), {
				status: 403,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Fetch real stats in parallel
		const [clerkStats, cloudinaryStats] = await Promise.all([
			fetchClerkStats(),
			fetchCloudinaryStats(),
		]);

		const stats: AdminStats = {
			totalUsers: clerkStats.totalUsers,
			totalProjects: cloudinaryStats.totalProjects,
			totalRenders: cloudinaryStats.totalRenders,
			storageUsedMB: cloudinaryStats.storageUsedMB,
		};

		return new Response(JSON.stringify(stats), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Admin stats error:", error);
		return new Response(JSON.stringify({ error: "Failed to fetch stats" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

async function fetchClerkStats(): Promise<{ totalUsers: number }> {
	try {
		const clerk = createClerkClient({
			secretKey: process.env.CLERK_SECRET_KEY!,
		});
		const userCount = await clerk.users.getCount();
		return { totalUsers: userCount };
	} catch (error) {
		console.error("Clerk stats error:", error);
		return { totalUsers: 0 };
	}
}

async function fetchCloudinaryStats(): Promise<{
	totalProjects: number;
	totalRenders: number;
	storageUsedMB: number;
}> {
	try {
		// Search for all source images in roomify/projects folder
		const sourceResult = await cloudinary.search
			.expression("folder:roomify/projects/* AND resource_type:image")
			.max_results(500)
			.aggregate("folder")
			.execute();

		const totalImages = sourceResult.total_count ?? 0;

		// Count rendered images specifically
		const renderResult = await cloudinary.search
			.expression(
				"folder:roomify/projects/* AND filename:rendered_* AND resource_type:image",
			)
			.max_results(1)
			.execute();

		const totalRenders = renderResult.total_count ?? 0;
		const totalProjects = totalImages - totalRenders;

		// Get storage usage from account details
		let storageUsedMB = 0;
		try {
			const usage = await cloudinary.api.usage();
			const storageBytes = usage.storage?.usage ?? 0;
			storageUsedMB = Math.round(storageBytes / (1024 * 1024));
		} catch {
			// Fallback: estimate from image count
			storageUsedMB = Math.round(totalImages * 0.5);
		}

		return {
			totalProjects: Math.max(0, totalProjects),
			totalRenders,
			storageUsedMB,
		};
	} catch (error) {
		console.error("Cloudinary stats error:", error);
		return { totalProjects: 0, totalRenders: 0, storageUsedMB: 0 };
	}
}
