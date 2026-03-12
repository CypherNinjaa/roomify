import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
	useUser,
	SignInButton,
	SignedIn,
	SignedOut,
} from "@clerk/react-router";
import {
	ArrowUpRight,
	FolderOpen,
	LogIn,
	Trash2,
	Pencil,
	Check,
	X,
	Globe,
	Lock,
	Loader2,
	Image,
	RefreshCw,
} from "lucide-react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { ProjectCardSkeleton } from "~/components/Skeleton";
import { formatDate } from "~/lib/utils";

export default function Profile() {
	const { user, isSignedIn } = useUser();
	const [projects, setProjects] = useState<DesignItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [renamingId, setRenamingId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

	const fetchProjects = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/projects");
			if (res.ok) {
				const data = (await res.json()) as { projects: DesignItem[] };
				setProjects(data.projects);
			}
		} catch {
			/* ignore */
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (isSignedIn && user) {
			fetchProjects();
		} else {
			setLoading(false);
		}
	}, [isSignedIn, user, fetchProjects]);

	const handleRename = async (projectId: string) => {
		const newName = renameValue.trim();
		if (!newName) return;

		setActionLoading(projectId);
		try {
			const res = await fetch("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "rename",
					projectId,
					data: { name: newName },
				}),
			});
			if (res.ok) {
				setProjects((prev) =>
					prev.map((p) => (p.id === projectId ? { ...p, name: newName } : p)),
				);
			}
		} catch {
			/* ignore */
		} finally {
			setActionLoading(null);
			setRenamingId(null);
		}
	};

	const handleDelete = async (projectId: string) => {
		setActionLoading(projectId);
		try {
			const res = await fetch("/api/projects", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ projectId }),
			});
			if (res.ok) {
				setProjects((prev) => prev.filter((p) => p.id !== projectId));
			}
		} catch {
			/* ignore */
		} finally {
			setActionLoading(null);
			setDeleteConfirmId(null);
		}
	};

	const handleTogglePublish = async (project: DesignItem) => {
		setActionLoading(project.id);
		try {
			if (project.isPublic) {
				// Unpublish: remove roomify_public tag
				const res = await fetch("/api/projects", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "unpublish",
						projectId: project.id,
					}),
				});
				if (res.ok) {
					setProjects((prev) =>
						prev.map((p) =>
							p.id === project.id ? { ...p, isPublic: false } : p,
						),
					);
				}
			} else {
				// Publish: must have a render and a name
				if (!project.renderedImage) return;
				if (!project.name || project.name === "Untitled") return;

				const res = await fetch("/api/community", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						renderedImage: project.renderedImage,
						projectName: project.name,
						ownerName: user?.fullName ?? user?.username ?? "User",
						style: project.style ?? "modern",
						sourceImage: project.sourceImage,
					}),
				});

				if (res.ok) {
					// Also tag the source as public
					await fetch("/api/projects", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							action: "publish",
							projectId: project.id,
						}),
					});
					setProjects((prev) =>
						prev.map((p) =>
							p.id === project.id ? { ...p, isPublic: true } : p,
						),
					);
				}
			}
		} catch {
			/* ignore */
		} finally {
			setActionLoading(null);
		}
	};

	const renderCount = projects.filter((p) => p.renderedImage).length;
	const publicCount = projects.filter((p) => p.isPublic).length;

	return (
		<div className="page">
			<Navbar />

			<SignedOut>
				<div className="auth-gate">
					<div className="auth-icon">
						<LogIn size={28} className="text-primary" />
					</div>
					<h2>Sign In to Continue</h2>
					<p>Access your projects, renders, and settings.</p>
					<SignInButton mode="modal">
						<button className="btn btn--primary btn--md" type="button">
							Sign In
						</button>
					</SignInButton>
				</div>
			</SignedOut>

			<SignedIn>
				<section className="page-hero">
					<div className="profile-header">
						<h1>{user?.fullName ?? user?.username ?? "Your Profile"}</h1>
						<div className="profile-stats">
							<div className="stat">
								<FolderOpen size={14} />
								<span className="stat-value">{projects.length}</span> projects
							</div>
							<div className="stat">
								<Image size={14} />
								<span className="stat-value">{renderCount}</span> renders
							</div>
							<div className="stat">
								<Globe size={14} />
								<span className="stat-value">{publicCount}</span> published
							</div>
						</div>
					</div>
				</section>

				<div className="profile-projects">
					<div className="profile-toolbar">
						<span className="profile-count">
							{projects.length} project{projects.length !== 1 ? "s" : ""}
						</span>
						<button
							type="button"
							className="btn btn--ghost btn--sm"
							onClick={fetchProjects}
							disabled={loading}
						>
							<RefreshCw size={14} className={loading ? "animate-spin" : ""} />
							Refresh
						</button>
					</div>

					{loading ?
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3].map((i) => (
								<ProjectCardSkeleton key={i} />
							))}
						</div>
					: projects.length > 0 ?
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{projects.map((project) => (
								<div key={project.id} className="profile-card">
									{/* Image Preview — clickable to open visualizer */}
									<Link
										to={`/visualizer/${project.id}`}
										state={{
											sourceImage: project.sourceImage,
											projectName: project.name,
										}}
										className="profile-card-preview"
									>
										<img
											src={project.renderedImage ?? project.sourceImage}
											alt={project.name}
										/>
										<div className="profile-card-badges">
											{project.renderedImage && (
												<span className="badge-rendered">
													<Image size={10} />
													Rendered
												</span>
											)}
											{project.isPublic && (
												<span className="badge-public">
													<Globe size={10} />
													Public
												</span>
											)}
										</div>
									</Link>

									{/* Card Body */}
									<div className="profile-card-body">
										{renamingId === project.id ?
											<div className="profile-rename-row">
												<input
													className="profile-rename-input"
													value={renameValue}
													onChange={(e) => setRenameValue(e.target.value)}
													onKeyDown={(e) =>
														e.key === "Enter" && handleRename(project.id)
													}
													autoFocus
												/>
												<button
													type="button"
													className="profile-action-btn"
													onClick={() => handleRename(project.id)}
													disabled={actionLoading === project.id}
												>
													{actionLoading === project.id ?
														<Loader2 size={14} className="animate-spin" />
													:	<Check size={14} />}
												</button>
												<button
													type="button"
													className="profile-action-btn"
													onClick={() => setRenamingId(null)}
												>
													<X size={14} />
												</button>
											</div>
										:	<div className="profile-card-info">
												<h3>{project.name}</h3>
												<span className="profile-card-date">
													{formatDate(project.timestamp)}
												</span>
											</div>
										}

										{/* Actions */}
										<div className="profile-card-actions">
											{deleteConfirmId === project.id ?
												<div className="profile-delete-confirm">
													<span>Delete?</span>
													<button
														type="button"
														className="profile-action-btn danger"
														onClick={() => handleDelete(project.id)}
														disabled={actionLoading === project.id}
													>
														{actionLoading === project.id ?
															<Loader2 size={14} className="animate-spin" />
														:	<Check size={14} />}
													</button>
													<button
														type="button"
														className="profile-action-btn"
														onClick={() => setDeleteConfirmId(null)}
													>
														<X size={14} />
													</button>
												</div>
											:	<>
													<button
														type="button"
														className="profile-action-btn"
														title="Rename"
														onClick={() => {
															setRenameValue(project.name);
															setRenamingId(project.id);
														}}
													>
														<Pencil size={14} />
													</button>

													<button
														type="button"
														className={`profile-action-btn ${project.isPublic ? "active" : ""}`}
														title={
															project.isPublic ? "Unpublish from Community"
															: !project.renderedImage ?
																"Generate a render first"
															: project.name === "Untitled" ?
																"Name your project first"
															:	"Publish to Community"
														}
														onClick={() => handleTogglePublish(project)}
														disabled={
															actionLoading === project.id ||
															(!project.isPublic &&
																(!project.renderedImage ||
																	!project.name ||
																	project.name === "Untitled"))
														}
													>
														{actionLoading === project.id ?
															<Loader2 size={14} className="animate-spin" />
														: project.isPublic ?
															<Lock size={14} />
														:	<Globe size={14} />}
													</button>

													<Link
														to={`/visualizer/${project.id}`}
														state={{
															sourceImage: project.sourceImage,
															projectName: project.name,
														}}
														className="profile-action-btn"
														title="Open in Visualizer"
													>
														<ArrowUpRight size={14} />
													</Link>

													<button
														type="button"
														className="profile-action-btn danger"
														title="Delete Project"
														onClick={() => setDeleteConfirmId(project.id)}
													>
														<Trash2 size={14} />
													</button>
												</>
											}
										</div>
									</div>
								</div>
							))}
						</div>
					:	<div className="empty-state">
							<FolderOpen size={48} className="mx-auto mb-4 text-stone-300" />
							<p>No projects yet. Upload your first floor plan!</p>
							<Link to="/" className="cta-link">
								Get Started
							</Link>
						</div>
					}
				</div>
			</SignedIn>

			<Footer />
		</div>
	);
}
