import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
	useUser,
	SignInButton,
	SignedIn,
	SignedOut,
} from "@clerk/react-router";
import { ArrowUpRight, FolderOpen, LogIn } from "lucide-react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { ProjectCardSkeleton } from "~/components/Skeleton";
import { formatDate } from "~/lib/utils";

export default function Profile() {
	const { user, isSignedIn } = useUser();
	const [projects, setProjects] = useState<DesignItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (isSignedIn && user) {
			fetchProjects();
		} else {
			setLoading(false);
		}
	}, [isSignedIn, user]);

	const fetchProjects = async () => {
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
	};

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
						</div>
					</div>
				</section>

				<div className="profile-projects">
					{loading ?
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3].map((i) => (
								<ProjectCardSkeleton key={i} />
							))}
						</div>
					: projects.length > 0 ?
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{projects.map((project) => (
								<Link
									key={project.id}
									to={`/visualizer/${project.id}`}
									state={{
										sourceImage: project.sourceImage,
										projectName: project.name,
									}}
									className="project-card group"
								>
									<div className="preview">
										<img
											src={project.renderedImage ?? project.sourceImage}
											alt={project.name}
										/>
										{project.renderedImage && (
											<div className="badge">
												<span>Rendered</span>
											</div>
										)}
									</div>
									<div className="card-body">
										<div className="card-info">
											<h3>{project.name}</h3>
											<div className="meta">
												<span>{formatDate(project.timestamp)}</span>
											</div>
										</div>
										<div className="arrow">
											<ArrowUpRight size={16} />
										</div>
									</div>
								</Link>
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
