import { Link } from "react-router";
import {
	Sparkles,
	Eye,
	Cloud,
	Download,
	Layers,
	Palette,
	ArrowRight,
} from "lucide-react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { useScrollAnimation } from "~/lib/useScrollAnimation";

const FEATURES = [
	{
		icon: Sparkles,
		title: "AI-Powered Rendering",
		desc: "Leverage Google Gemini AI to transform 2D blueprints into photorealistic 3D interiors. Our advanced model understands room layouts, dimensions, and spatial relationships.",
	},
	{
		icon: Eye,
		title: "Side-by-Side Comparison",
		desc: "Use the interactive comparison slider to see your original floor plan next to the AI-generated render. Perfect for client presentations and design reviews.",
	},
	{
		icon: Palette,
		title: "Multiple Design Styles",
		desc: "Choose from 5 curated styles — modern, rustic, minimalist, industrial, and scandinavian. Each generates a unique photorealistic interpretation of your space.",
	},
	{
		icon: Cloud,
		title: "Cloud-Powered Storage",
		desc: "All projects are securely stored on Cloudinary CDN. Access your renders from anywhere, share with clients, and never lose your work.",
	},
	{
		icon: Layers,
		title: "Style Gallery & Caching",
		desc: "Generate multiple style variants for the same floor plan. Previously generated styles are cached for instant switching and comparison.",
	},
	{
		icon: Download,
		title: "High-Res Export",
		desc: "Download your renders in full resolution, ready for print-quality presentations, marketing materials, and client portfolios.",
	},
];

export default function Product() {
	useScrollAnimation();

	return (
		<div className="page">
			<Navbar />

			<section className="page-hero">
				<h1>Built for Architects</h1>
				<p className="page-subtitle">
					Roomify combines cutting-edge AI with an intuitive interface to
					transform your workflow. Turn any floor plan into a stunning 3D
					visualization in seconds.
				</p>
			</section>

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

			<section className="page-cta animate-scale-on-scroll">
				<h2>Ready to Transform Your Designs?</h2>
				<p className="cta-subtitle">
					Upload your first floor plan and see the magic in action.
				</p>
				<Link to="/" className="cta-btn btn btn--primary btn--lg">
					Get Started <ArrowRight size={16} className="icon" />
				</Link>
			</section>

			<Footer />
		</div>
	);
}
