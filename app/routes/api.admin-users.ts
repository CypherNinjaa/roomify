import type { Route } from "./+types/api.admin-users";
import { getAuth } from "@clerk/react-router/ssr.server";
import { createClerkClient } from "@clerk/react-router/api.server";

const clerk = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY!,
});

// GET — list all users with search/filter/pagination
export async function loader(args: Route.LoaderArgs) {
	try {
		const auth = await getAuth(args);
		const userId = "userId" in auth ? auth.userId : null;
		if (!userId) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = "sessionClaims" in auth ? auth.sessionClaims : null;
		const role = (claims?.publicMetadata as { role?: string })?.role ?? null;
		if (role !== "admin") {
			return Response.json({ error: "Forbidden" }, { status: 403 });
		}

		const url = new URL(args.request.url);
		const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
		const limit = Math.min(
			Number.parseInt(url.searchParams.get("limit") ?? "20", 10),
			100,
		);
		const query = url.searchParams.get("query") ?? "";
		const offset = (page - 1) * limit;

		const params: {
			limit: number;
			offset: number;
			query?: string;
		} = { limit, offset };
		if (query) params.query = query;

		const [userList, totalCount] = await Promise.all([
			clerk.users.getUserList(params),
			clerk.users.getCount(query ? { query } : undefined),
		]);

		const users = userList.data.map((u) => ({
			id: u.id,
			email: u.emailAddresses[0]?.emailAddress ?? "",
			firstName: u.firstName,
			lastName: u.lastName,
			fullName:
				[u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown",
			imageUrl: u.imageUrl,
			role: (u.publicMetadata as { role?: string })?.role ?? "user",
			createdAt: u.createdAt,
			lastSignInAt: u.lastSignInAt,
			banned: u.banned,
		}));

		return Response.json({
			users,
			total: totalCount,
			page,
			totalPages: Math.ceil(totalCount / limit),
		});
	} catch (error) {
		console.error("Admin users error:", error);
		return Response.json({ error: "Failed to fetch users" }, { status: 500 });
	}
}

// POST — update user role or ban/unban
export async function action(args: Route.ActionArgs) {
	const { request } = args;

	try {
		const auth = await getAuth(args);
		const adminUserId = "userId" in auth ? auth.userId : null;
		if (!adminUserId) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = "sessionClaims" in auth ? auth.sessionClaims : null;
		const role = (claims?.publicMetadata as { role?: string })?.role ?? null;
		if (role !== "admin") {
			return Response.json({ error: "Forbidden" }, { status: 403 });
		}

		const body = await request.json();
		const {
			action: userAction,
			targetUserId,
			data,
		} = body as {
			action: string;
			targetUserId: string;
			data?: { role?: string };
		};

		if (!targetUserId) {
			return Response.json({ error: "Missing targetUserId" }, { status: 400 });
		}

		// Prevent admin from modifying themselves
		if (targetUserId === adminUserId && userAction === "update-role") {
			return Response.json(
				{ error: "Cannot change your own role" },
				{ status: 400 },
			);
		}

		if (userAction === "update-role" && data?.role) {
			const allowedRoles = ["user", "admin"];
			if (!allowedRoles.includes(data.role)) {
				return Response.json({ error: "Invalid role" }, { status: 400 });
			}
			await clerk.users.updateUserMetadata(targetUserId, {
				publicMetadata: { role: data.role },
			});
			return Response.json({ success: true });
		}

		if (userAction === "ban") {
			await clerk.users.banUser(targetUserId);
			return Response.json({ success: true });
		}

		if (userAction === "unban") {
			await clerk.users.unbanUser(targetUserId);
			return Response.json({ success: true });
		}

		return Response.json({ error: "Unknown action" }, { status: 400 });
	} catch (error) {
		console.error("Admin users action error:", error);
		return Response.json({ error: "Operation failed" }, { status: 500 });
	}
}
