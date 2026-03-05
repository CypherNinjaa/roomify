import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";
import { getProjects } from "../../lib/puter.action";
import { Clock, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useScrollAnimation } from "../../lib/useScrollAnimation";

export default function Community() {
	const navigate = useNavigate();
	const [projects, setProjects] = useState<DesignItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	useScrollAnimation();

	useEffect(() => {
		const fetchCommunityProjects = async () => {
			setIsLoading(true);
			const items = await getProjects();
			const publicItems = items.filter((p) => p.isPublic);
			setProjects(publicItems);
			setIsLoading(false);
		};
		fetchCommunityProjects();
	}, []);

	return (
		<div className="page community-page page-transition">
			<Navbar />

			<section className="page-hero">
				<h1>Community Gallery</h1>
				<p className="page-subtitle">
					Explore architectural visualizations shared by the Roomify community.
					Get inspired, share your own, and see what AI can do.
				</p>
			</section>

			<section className="community-grid-section">
				{isLoading ?
					<p className="loading-text">Loading community projects...</p>
				: projects.length === 0 ?
					<div className="empty-state">
						<p>No community projects yet. Be the first to share!</p>
						<a href="/#upload" className="cta-link">
							Upload a floor plan
						</a>
					</div>
				:	<div className="community-grid">
						{projects.map(
							({
								id,
								name,
								renderedImage,
								sourceImage,
								timestamp,
								sharedBy,
							}) => (
								<div
									key={id}
									className="community-card group"
									onClick={() => navigate(`/visualizer/${id}`)}
								>
									<div className="preview">
										<img
											src={renderedImage || sourceImage}
											alt={name || "Project"}
										/>
									</div>
									<div className="card-body">
										<div>
											<h3>{name || `Project ${id}`}</h3>
											<div className="meta">
												<Clock size={12} />
												<span>{new Date(timestamp).toLocaleDateString()}</span>
												{sharedBy && <span>By {sharedBy}</span>}
											</div>
										</div>
										<div className="arrow">
											<ArrowUpRight size={18} />
										</div>
									</div>
								</div>
							),
						)}
					</div>
				}
			</section>

			<Footer />
		</div>
	);
}
