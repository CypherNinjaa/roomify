import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("product", "./routes/product.tsx"),
	route("pricing", "./routes/pricing.tsx"),
	route("community", "./routes/community.tsx"),
	route("enterprise", "./routes/enterprise.tsx"),
	route("profile", "./routes/profile.tsx"),
	route("visualizer/:id", "./routes/visualizer.$id.tsx"),
	route("admin", "./routes/admin.tsx"),
	route("api/generate", "./routes/api.generate.ts"),
	route("api/upload", "./routes/api.upload.ts"),
	route("api/delete", "./routes/api.delete.ts"),
	route("api/admin-stats", "./routes/api.admin-stats.ts"),
	route("api/admin-users", "./routes/api.admin-users.ts"),
	route("api/admin-projects", "./routes/api.admin-projects.ts"),
	route("api/community", "./routes/api.community.ts"),
	route("api/projects", "./routes/api.projects.ts"),
] satisfies RouteConfig;
