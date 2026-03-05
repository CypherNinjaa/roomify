import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useOutletContext, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { getProjects } from "../../lib/puter.action";
import { Clock, ArrowUpRight, User, LogIn } from "lucide-react";
import Button from "../../components/ui/Button";

export default function Profile() {
	const { isSignedIn, userName, userId, signIn } =
		useOutletContext<AuthContext>();
	const navigate = useNavigate();
	const [projects, setProjects] = useState<DesignItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!isSignedIn) {
			setIsLoading(false);
			return;
		}

		const fetchMyProjects = async () => {
			setIsLoading(true);
			const items = await getProjects();
			setProjects(items);
			setIsLoading(false);
		};
		fetchMyProjects();
	}, [isSignedIn]);

	if (!isSignedIn) {
		return (
			<div className="page profile-page">
				<Navbar />
				<section className="page-hero">
					<h1>Your Profile</h1>
					<p className="page-subtitle">
						Sign in to view your projects and account details.
					</p>
					<Button size="lg" onClick={() => signIn()} className="sign-in-btn">
						<LogIn className="w-4 h-4 mr-2" /> Sign In with Puter
					</Button>
				</section>

				<Footer />
			</div>
		);
	}

	return (
		<div className="page profile-page">
			<Navbar />

			<section className="page-hero">
				<div className="profile-avatar">
					<User className="avatar-icon" />
				</div>
				<h1>{userName || "Your Profile"}</h1>
				<p className="page-subtitle">
					{projects.length} project{projects.length !== 1 ? "s" : ""} created
				</p>
			</section>

			<section className="profile-projects">
				{isLoading ?
					<p className="loading-text">Loading your projects...</p>
				: projects.length === 0 ?
					<div className="empty-state">
						<p>You haven't created any projects yet.</p>
						<a href="/#upload" className="cta-link">
							Upload your first floor plan
						</a>
					</div>
				:	<div className="profile-grid">
						{projects.map(
							({ id, name, renderedImage, sourceImage, timestamp }) => (
								<div
									key={id}
									className="project-card group"
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
