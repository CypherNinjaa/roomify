import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Box, Layers, Sparkles, Zap, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "../../lib/useScrollAnimation";

export default function Product() {
	useScrollAnimation();
	return (
		<div className="page product-page page-transition">
			<Navbar />

			<section className="page-hero">
				<h1>Transform floor plans into stunning 3D renders</h1>
				<p className="page-subtitle">
					Roomify uses state-of-the-art AI models to convert your 2D
					architectural sketches into photorealistic 3D visualizations in
					seconds.
				</p>
			</section>

			<section className="features-grid">
				<div className="feature-card animate-on-scroll">
					<div className="feature-icon">
						<Sparkles className="icon" />
					</div>
					<h3>AI-Powered Rendering</h3>
					<p>
						Gemini and Claude models transform flat floor plans into
						photorealistic 3D scenes with realistic lighting, materials, and
						furniture.
					</p>
				</div>

				<div className="feature-card animate-on-scroll delay-1">
					<div className="feature-icon">
						<Layers className="icon" />
					</div>
					<h3>Side-by-Side Compare</h3>
					<p>
						Interactive slider lets you compare your original floor plan with
						the AI-generated 3D render instantly.
					</p>
				</div>

				<div className="feature-card animate-on-scroll delay-2">
					<div className="feature-icon">
						<Box className="icon" />
					</div>
					<h3>Persistent Storage</h3>
					<p>
						Every project is saved to the cloud with permanent hosting. Your
						renders are always accessible from any device.
					</p>
				</div>

				<div className="feature-card animate-on-scroll delay-3">
					<div className="feature-icon">
						<Zap className="icon" />
					</div>
					<h3>Instant Export</h3>
					<p>
						Download high-resolution renders as PNG files ready for
						presentations, portfolios, and client proposals.
					</p>
				</div>
			</section>

			<section className="page-cta animate-on-scroll">
				<h2>Ready to visualize your designs?</h2>
				<a href="/#upload" className="cta-btn">
					Start Building <ArrowRight className="icon" />
				</a>
			</section>

			<Footer />
		</div>
	);
}
