import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowUpRight, Users, Eye } from "lucide-react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { ProjectCardSkeleton } from "~/components/Skeleton";
import { useScrollAnimation } from "~/lib/useScrollAnimation";

interface CommunityProject {
	id: string;
	name: string;
	sourceImage: string;
	renderedImage: string | null;
	ownerName: string;
	style: string;
	createdAt: string;
}

export default function Community() {
	const [projects, setProjects] = useState<CommunityProject[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<string>("all");
	useScrollAnimation();

	useEffect(() => {
		fetchCommunityProjects();
	}, []);

	const fetchCommunityProjects = async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/community");
			if (res.ok) {
				const data = (await res.json()) as {
					projects: CommunityProject[];
				};
				setProjects(data.projects);
			}
		} catch (error) {
			console.error("Failed to fetch community projects:", error);
		} finally {
			setLoading(false);
		}
	};

	const styles = [
		"all",
		"modern",
		"rustic",
		"minimalist",
		"industrial",
		"scandinavian",
	];
	const filtered =
		filter === "all" ? projects : projects.filter((p) => p.style === filter);

	return (
		<div className="page">
			<Navbar />

			<section className="page-hero">
				<h1>Community Gallery</h1>
				<p className="page-subtitle">
					Explore stunning 3D renders created by architects and designers around
					the world.
				</p>
			</section>

			<div className="community-grid-section">
				{/* Style Filter */}
				{projects.length > 0 && (
					<div className="community-filters animate-on-scroll">
						{styles.map((s) => (
							<button
								key={s}
								type="button"
								className={`filter-btn ${filter === s ? "active" : ""}`}
								onClick={() => setFilter(s)}
							>
								{s === "all" ?
									"All Styles"
								:	s.charAt(0).toUpperCase() + s.slice(1)}
							</button>
						))}
					</div>
				)}

				{loading ?
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<ProjectCardSkeleton key={i} />
						))}
					</div>
				: filtered.length > 0 ?
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{filtered.map((project) => (
							<div key={project.id} className="project-card group">
								<div className="preview">
									<img
										src={project.renderedImage ?? project.sourceImage}
										alt={project.name}
									/>
									{project.style && (
										<div className="badge">
											<span>{project.style}</span>
										</div>
									)}
								</div>
								<div className="card-body">
									<div className="card-info">
										<h3>{project.name}</h3>
										<div className="meta">
											<span>
												{new Date(project.createdAt).toLocaleDateString(
													"en-US",
													{ month: "short", day: "numeric", year: "numeric" },
												)}
											</span>
											{project.ownerName && <span>by {project.ownerName}</span>}
										</div>
									</div>
									<div className="arrow">
										<Eye size={16} />
									</div>
								</div>
							</div>
						))}
					</div>
				:	<div className="empty-state animate-on-scroll">
						<Users size={48} className="mx-auto mb-4 text-stone-300" />
						<p>
							{filter !== "all" ?
								`No ${filter} style projects yet.`
							:	"No community projects yet. Be the first to share your render!"}
						</p>
						<Link to="/" className="cta-link">
							Create & Share
						</Link>
					</div>
				}
			</div>

			<Footer />
		</div>
	);
}
