import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
	useUser,
	SignInButton,
	SignedIn,
	SignedOut,
} from "@clerk/react-router";
import {
	ArrowRight,
	Sparkles,
	Upload as UploadIcon,
	Layers,
	Zap,
	Eye,
	Download,
	ArrowUpRight,
} from "lucide-react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import Upload from "~/components/Upload";
import { ProjectCardSkeleton } from "~/components/Skeleton";
import { fileToBase64, generateProjectId, formatDate } from "~/lib/utils";
import { useScrollAnimation } from "~/lib/useScrollAnimation";

const FEATURES = [
	{
		icon: Sparkles,
		title: "AI-Powered Rendering",
		desc: "Transform flat floor plans into photorealistic 3D interiors using Google Gemini AI.",
	},
	{
		icon: Eye,
		title: "Before & After Compare",
		desc: "Side-by-side slider to compare your original plan with the AI-generated render.",
	},
	{
		icon: Layers,
		title: "5 Design Styles",
		desc: "Modern, rustic, minimalist, industrial, and scandinavian — generate any style instantly.",
	},
	{
		icon: Download,
		title: "Instant Export",
		desc: "Download your renders in high resolution, ready for client presentations.",
	},
	{
		icon: Zap,
		title: "Cloud Storage",
		desc: "All projects stored securely on Cloudinary CDN with instant global delivery.",
	},
	{
		icon: UploadIcon,
		title: "Drag & Drop Upload",
		desc: "Simply drag your floor plan image and let AI do the rest. No complex setup needed.",
	},
];

export default function Home() {
	const { isSignedIn, user } = useUser();
	const navigate = useNavigate();
	const [projects, setProjects] = useState<DesignItem[]>([]);
	const [loading, setLoading] = useState(true);
	useScrollAnimation();

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

	const handleUploadComplete = async (file: File) => {
		if (!isSignedIn || !user) return;

		const base64 = await fileToBase64(file);
		const projectId = generateProjectId();
		const projectName = file.name.replace(/\.[^.]+$/, "");

		// Upload to Cloudinary
		let sourceUrl = base64;
		try {
			const folder = `roomify/projects/${user.id}/${projectId}/source`;
			const res = await fetch("/api/upload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ imageBase64: base64, folder, projectName }),
			});
			if (res.ok) {
				const result = (await res.json()) as CloudinaryUploadResult;
				sourceUrl = result.secure_url;
			}
		} catch {
			// Fall back to base64 if upload fails
		}

		navigate(`/visualizer/${projectId}`, {
			state: { sourceImage: sourceUrl, projectName },
		});
	};

	return (
		<div className="home">
			<Navbar />

			{/* Hero */}
			<section className="hero">
				<div className="badge">
					<span className="dot" />
					<span>AI-Powered Architecture</span>
				</div>

				<h1>
					Turn Floor Plans Into <span className="highlight">Stunning 3D</span>{" "}
					Renders
				</h1>

				<p className="subtitle">
					Upload any 2D floor plan and watch AI transform it into a
					photorealistic 3D visualization. Perfect for architects, designers,
					and real estate professionals.
				</p>

				<div className="hero-actions">
					<SignedOut>
						<SignInButton mode="modal">
							<button
								className="cta-primary btn btn--primary btn--lg"
								type="button"
							>
								Get Started Free <ArrowRight size={16} />
							</button>
						</SignInButton>
					</SignedOut>
					<SignedIn>
						<a href="#upload" className="cta-primary">
							Start Building <ArrowRight size={16} />
						</a>
					</SignedIn>
					<Link
						to="/product"
						className="cta-secondary btn btn--secondary btn--lg"
					>
						See How It Works
					</Link>
				</div>

				<div id="upload" className="upload-section">
					<div className="upload-wrapper">
						<div className="upload-header">
							<div className="upload-icon">
								<UploadIcon className="icon" />
							</div>
							<h3>Upload Your Floor Plan</h3>
							<p>Drag & drop or click to select your 2D plan</p>
						</div>

						<SignedIn>
							<Upload onComplete={handleUploadComplete} />
						</SignedIn>

						<SignedOut>
							<div className="auth-gate">
								<p>Sign in to start uploading floor plans</p>
								<SignInButton mode="modal">
									<button className="btn btn--primary btn--md" type="button">
										Sign In to Upload
									</button>
								</SignInButton>
							</div>
						</SignedOut>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="features">
				<div className="features-inner">
					<div className="features-header animate-on-scroll">
						<h2>Everything You Need</h2>
						<p>
							Powerful AI tools designed for architecture professionals and
							enthusiasts.
						</p>
					</div>

					<div className="features-grid">
						{FEATURES.map((feature, i) => (
							<div
								key={feature.title}
								className={`feature-card animate-on-scroll delay-${(i % 4) + 1}`}
							>
								<div className="feature-icon">
									<feature.icon className="icon" />
								</div>
								<h3>{feature.title}</h3>
								<p>{feature.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Recent Projects */}
			<SignedIn>
				<section className="projects">
					<div className="section-inner">
						<div className="section-header animate-on-scroll">
							<div>
								<h2>Your Projects</h2>
								<p>Recent floor plan visualizations</p>
							</div>
							{projects.length > 0 && (
								<Link to="/profile" className="btn btn--ghost btn--sm">
									View All <ArrowUpRight size={14} />
								</Link>
							)}
						</div>

						{loading ?
							<div className="projects-grid">
								{[1, 2, 3].map((i) => (
									<ProjectCardSkeleton key={i} />
								))}
							</div>
						: projects.length > 0 ?
							<div className="projects-grid">
								{projects.slice(0, 6).map((project) => (
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
								<p>
									No projects yet. Upload your first floor plan to get started!
								</p>
								<a href="#upload" className="cta-link">
									Upload Now
								</a>
							</div>
						}
					</div>
				</section>
			</SignedIn>

			<Footer />
		</div>
	);
}
