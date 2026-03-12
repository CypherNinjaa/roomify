import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/react-router";
import { useNavigate, Link } from "react-router";
import {
	Shield,
	Users,
	FolderOpen,
	Image,
	HardDrive,
	ArrowLeft,
	Box,
	RefreshCw,
	BarChart3,
	Search,
	ChevronLeft,
	ChevronRight,
	Ban,
	CheckCircle,
	Trash2,
	Crown,
	User,
	Globe,
	Lock,
	Loader2,
} from "lucide-react";

type AdminTab = "overview" | "users" | "projects";

export default function Admin() {
	const { user, isLoaded } = useUser();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<AdminTab>("overview");

	const isAdmin = user?.publicMetadata?.role === "admin";

	useEffect(() => {
		if (isLoaded && (!user || !isAdmin)) {
			navigate("/");
		}
	}, [isLoaded, user, isAdmin, navigate]);

	if (!isLoaded) {
		return (
			<div className="page">
				<div className="loading">
					<RefreshCw className="animate-spin" size={24} />
					<span>Loading...</span>
				</div>
			</div>
		);
	}

	if (!isAdmin) return null;

	return (
		<div className="admin">
			{/* Header */}
			<div className="admin-header">
				<div className="admin-header-left">
					<Link to="/" className="brand">
						<Box className="logo" />
						<span className="name">Roomify</span>
					</Link>
					<div className="admin-badge">
						<Shield size={14} />
						<span>Admin</span>
					</div>
				</div>
				<button
					type="button"
					className="btn btn--secondary btn--sm"
					onClick={() => navigate("/")}
				>
					<ArrowLeft size={14} />
					<span>Back to App</span>
				</button>
			</div>

			{/* Tab Navigation */}
			<div className="admin-tabs">
				<button
					type="button"
					className={`admin-tab ${activeTab === "overview" ? "active" : ""}`}
					onClick={() => setActiveTab("overview")}
				>
					<BarChart3 size={16} />
					<span>Overview</span>
				</button>
				<button
					type="button"
					className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
					onClick={() => setActiveTab("users")}
				>
					<Users size={16} />
					<span>Users</span>
				</button>
				<button
					type="button"
					className={`admin-tab ${activeTab === "projects" ? "active" : ""}`}
					onClick={() => setActiveTab("projects")}
				>
					<FolderOpen size={16} />
					<span>Projects</span>
				</button>
			</div>

			{/* Tab Content */}
			<div className="admin-content">
				{activeTab === "overview" && <OverviewTab />}
				{activeTab === "users" && <UsersTab />}
				{activeTab === "projects" && <ProjectsTab />}
			</div>
		</div>
	);
}

/* ─── Overview Tab ─── */
function OverviewTab() {
	const [stats, setStats] = useState<AdminStats>({
		totalUsers: 0,
		totalProjects: 0,
		totalRenders: 0,
		storageUsedMB: 0,
	});
	const [loading, setLoading] = useState(true);

	const loadStats = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/admin-stats");
			if (res.ok) {
				const data = (await res.json()) as AdminStats;
				setStats(data);
			}
		} catch (error) {
			console.error("Failed to load stats:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	const statCards = [
		{
			label: "Total Users",
			value: stats.totalUsers,
			icon: Users,
			color: "var(--color-primary)",
		},
		{
			label: "Total Projects",
			value: stats.totalProjects,
			icon: FolderOpen,
			color: "var(--color-secondary)",
		},
		{
			label: "Renders Generated",
			value: stats.totalRenders,
			icon: Image,
			color: "#16a34a",
		},
		{
			label: "Storage Used",
			value: `${stats.storageUsedMB} MB`,
			icon: HardDrive,
			color: "#9333ea",
		},
	];

	return (
		<>
			<div className="admin-stats">
				{statCards.map((card) => (
					<div className="stat-card" key={card.label}>
						<div className="stat-icon" style={{ color: card.color }}>
							<card.icon size={24} />
						</div>
						<div className="stat-info">
							<span className="stat-value">{loading ? "..." : card.value}</span>
							<span className="stat-label">{card.label}</span>
						</div>
					</div>
				))}
			</div>

			<div className="admin-section">
				<div className="admin-section-header">
					<h3>Platform Overview</h3>
					<button
						type="button"
						className="btn btn--primary btn--sm"
						onClick={loadStats}
						disabled={loading}
					>
						<RefreshCw size={14} className={loading ? "animate-spin" : ""} />
						{loading ? "Loading..." : "Refresh"}
					</button>
				</div>
				<p className="admin-section-desc">
					Live data from Clerk (users) and Cloudinary (projects, renders,
					storage). Click refresh to update.
				</p>
			</div>
		</>
	);
}

/* ─── Users Tab ─── */
function UsersTab() {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({ page: String(page), limit: "15" });
			if (search) params.set("query", search);

			const res = await fetch(`/api/admin-users?${params}`);
			if (res.ok) {
				const data = (await res.json()) as AdminUsersResponse;
				setUsers(data.users);
				setTotal(data.total);
				setTotalPages(data.totalPages);
			}
		} catch (error) {
			console.error("Failed to fetch users:", error);
		} finally {
			setLoading(false);
		}
	}, [page, search]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
		setSearch(searchInput);
	};

	const handleRoleChange = async (targetUserId: string, newRole: string) => {
		setActionLoading(targetUserId);
		try {
			const res = await fetch("/api/admin-users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "update-role",
					targetUserId,
					data: { role: newRole },
				}),
			});
			if (res.ok) {
				setUsers((prev) =>
					prev.map((u) =>
						u.id === targetUserId ? { ...u, role: newRole } : u,
					),
				);
			}
		} catch {
			/* ignore */
		} finally {
			setActionLoading(null);
		}
	};

	const handleBanToggle = async (targetUserId: string, isBanned: boolean) => {
		setActionLoading(targetUserId);
		try {
			const res = await fetch("/api/admin-users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: isBanned ? "unban" : "ban",
					targetUserId,
				}),
			});
			if (res.ok) {
				setUsers((prev) =>
					prev.map((u) =>
						u.id === targetUserId ? { ...u, banned: !isBanned } : u,
					),
				);
			}
		} catch {
			/* ignore */
		} finally {
			setActionLoading(null);
		}
	};

	const formatDate = (ts: number | null) => {
		if (!ts) return "Never";
		return new Date(ts).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<>
			{/* Search Bar */}
			<div className="admin-section">
				<div className="admin-section-header">
					<h3>User Management</h3>
					<span className="admin-count">{total} total users</span>
				</div>
				<form onSubmit={handleSearch} className="admin-search">
					<div className="admin-search-input">
						<Search size={16} />
						<input
							type="text"
							placeholder="Search by name or email..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
					</div>
					<button type="submit" className="btn btn--primary btn--sm">
						Search
					</button>
				</form>
			</div>

			{/* Users Table */}
			<div className="admin-section">
				{loading ?
					<div className="admin-loading">
						<Loader2 className="animate-spin" size={20} />
						<span>Loading users...</span>
					</div>
				: users.length === 0 ?
					<div className="admin-empty">
						<Users size={32} />
						<p>No users found</p>
					</div>
				:	<>
						<div className="admin-table-wrap">
							<table className="admin-table">
								<thead>
									<tr>
										<th>User</th>
										<th>Email</th>
										<th>Role</th>
										<th>Joined</th>
										<th>Last Sign In</th>
										<th>Status</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{users.map((u) => (
										<tr key={u.id} className={u.banned ? "banned-row" : ""}>
											<td>
												<div className="user-cell">
													<img
														src={u.imageUrl}
														alt={u.fullName}
														className="user-avatar"
													/>
													<span className="user-name">{u.fullName}</span>
												</div>
											</td>
											<td className="email-cell">{u.email}</td>
											<td>
												<span
													className={`role-badge ${u.role === "admin" ? "role-admin" : "role-user"}`}
												>
													{u.role === "admin" ?
														<Crown size={12} />
													:	<User size={12} />}
													{u.role}
												</span>
											</td>
											<td className="date-cell">{formatDate(u.createdAt)}</td>
											<td className="date-cell">
												{formatDate(u.lastSignInAt)}
											</td>
											<td>
												{u.banned ?
													<span className="status-badge status-banned">
														<Ban size={12} />
														Banned
													</span>
												:	<span className="status-badge status-active">
														<CheckCircle size={12} />
														Active
													</span>
												}
											</td>
											<td>
												<div className="action-buttons">
													{actionLoading === u.id ?
														<Loader2 className="animate-spin" size={16} />
													:	<>
															<button
																type="button"
																className="action-btn"
																title={
																	u.role === "admin" ?
																		"Demote to User"
																	:	"Promote to Admin"
																}
																onClick={() =>
																	handleRoleChange(
																		u.id,
																		u.role === "admin" ? "user" : "admin",
																	)
																}
															>
																{u.role === "admin" ?
																	<User size={14} />
																:	<Crown size={14} />}
															</button>
															<button
																type="button"
																className={`action-btn ${u.banned ? "action-unban" : "action-ban"}`}
																title={u.banned ? "Unban User" : "Ban User"}
																onClick={() => handleBanToggle(u.id, u.banned)}
															>
																{u.banned ?
																	<CheckCircle size={14} />
																:	<Ban size={14} />}
															</button>
														</>
													}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="admin-pagination">
								<button
									type="button"
									className="btn btn--ghost btn--sm"
									disabled={page <= 1}
									onClick={() => setPage((p) => p - 1)}
								>
									<ChevronLeft size={14} />
									Previous
								</button>
								<span className="pagination-info">
									Page {page} of {totalPages}
								</span>
								<button
									type="button"
									className="btn btn--ghost btn--sm"
									disabled={page >= totalPages}
									onClick={() => setPage((p) => p + 1)}
								>
									Next
									<ChevronRight size={14} />
								</button>
							</div>
						)}
					</>
				}
			</div>
		</>
	);
}

/* ─── Projects Tab ─── */
function ProjectsTab() {
	const [projects, setProjects] = useState<AdminProject[]>([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [loading, setLoading] = useState(true);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const fetchProjects = useCallback(async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				page: String(page),
				limit: "20",
			});

			const res = await fetch(`/api/admin-projects?${params}`);
			if (res.ok) {
				const data = (await res.json()) as AdminProjectsResponse;
				setProjects(data.projects);
				setTotal(data.total);
				setTotalPages(data.totalPages);
			}
		} catch (error) {
			console.error("Failed to fetch projects:", error);
		} finally {
			setLoading(false);
		}
	}, [page]);

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	const handleDelete = async (ownerId: string, projectId: string) => {
		if (
			!confirm(
				"Are you sure you want to delete this project? This cannot be undone.",
			)
		)
			return;

		setDeletingId(projectId);
		try {
			const res = await fetch("/api/admin-projects", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ownerId, projectId }),
			});
			if (res.ok) {
				setProjects((prev) => prev.filter((p) => p.id !== projectId));
				setTotal((t) => t - 1);
			}
		} catch {
			/* ignore */
		} finally {
			setDeletingId(null);
		}
	};

	const formatDate = (ts: number) =>
		new Date(ts).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});

	const formatBytes = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<>
			<div className="admin-section">
				<div className="admin-section-header">
					<h3>Project Management</h3>
					<div className="admin-section-actions">
						<span className="admin-count">{total} total projects</span>
						<button
							type="button"
							className="btn btn--secondary btn--sm"
							onClick={fetchProjects}
							disabled={loading}
						>
							<RefreshCw size={14} className={loading ? "animate-spin" : ""} />
							Refresh
						</button>
					</div>
				</div>
			</div>

			<div className="admin-section">
				{loading ?
					<div className="admin-loading">
						<Loader2 className="animate-spin" size={20} />
						<span>Loading projects...</span>
					</div>
				: projects.length === 0 ?
					<div className="admin-empty">
						<FolderOpen size={32} />
						<p>No projects found</p>
					</div>
				:	<>
						<div className="admin-projects-grid">
							{projects.map((project) => (
								<div className="admin-project-card" key={project.id}>
									<div className="project-thumb">
										<img
											src={project.renderedImage ?? project.sourceImage}
											alt={project.name}
										/>
										<div className="project-badges">
											{project.isPublic ?
												<span className="project-vis public">
													<Globe size={10} />
													Public
												</span>
											:	<span className="project-vis private">
													<Lock size={10} />
													Private
												</span>
											}
											{project.renderCount > 0 && (
												<span className="project-renders">
													<Image size={10} />
													{project.renderCount}
												</span>
											)}
										</div>
									</div>
									<div className="project-info">
										<h4>{project.name}</h4>
										<div className="project-meta">
											<span className="owner-id" title={project.ownerId}>
												<User size={12} />
												{project.ownerId.slice(0, 12)}...
											</span>
											<span>{formatDate(project.timestamp)}</span>
											<span>{formatBytes(project.totalBytes)}</span>
										</div>
									</div>
									<div className="project-actions">
										<button
											type="button"
											className="action-btn action-delete"
											title="Delete Project"
											onClick={() => handleDelete(project.ownerId, project.id)}
											disabled={deletingId === project.id}
										>
											{deletingId === project.id ?
												<Loader2 className="animate-spin" size={14} />
											:	<Trash2 size={14} />}
										</button>
									</div>
								</div>
							))}
						</div>

						{totalPages > 1 && (
							<div className="admin-pagination">
								<button
									type="button"
									className="btn btn--ghost btn--sm"
									disabled={page <= 1}
									onClick={() => setPage((p) => p - 1)}
								>
									<ChevronLeft size={14} />
									Previous
								</button>
								<span className="pagination-info">
									Page {page} of {totalPages}
								</span>
								<button
									type="button"
									className="btn btn--ghost btn--sm"
									disabled={page >= totalPages}
									onClick={() => setPage((p) => p + 1)}
								>
									Next
									<ChevronRight size={14} />
								</button>
							</div>
						)}
					</>
				}
			</div>
		</>
	);
}
