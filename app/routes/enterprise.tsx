import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Building2, Shield, Users, Headphones, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "../../lib/useScrollAnimation";

export default function Enterprise() {
	useScrollAnimation();
	return (
		<div className="page enterprise-page page-transition">
			<Navbar />

			<section className="page-hero">
				<h1>Roomify for Enterprise</h1>
				<p className="page-subtitle">
					Scalable AI visualization for architecture firms, real estate
					agencies, and construction companies. Custom solutions for teams of
					any size.
				</p>
			</section>

			<section className="features-grid">
				<div className="feature-card">
					<div className="feature-icon">
						<Building2 className="icon" />
					</div>
					<h3>Custom Deployment</h3>
					<p>
						On-premise or private cloud deployment options to meet your security
						and compliance requirements.
					</p>
				</div>

				<div className="feature-card">
					<div className="feature-icon">
						<Users className="icon" />
					</div>
					<h3>Unlimited Team Members</h3>
					<p>
						Add your entire organization with role-based access control, shared
						workspaces, and team analytics.
					</p>
				</div>

				<div className="feature-card">
					<div className="feature-icon">
						<Shield className="icon" />
					</div>
					<h3>Enterprise Security</h3>
					<p>
						SSO integration, data encryption at rest and in transit, audit logs,
						and SOC 2 compliance.
					</p>
				</div>

				<div className="feature-card">
					<div className="feature-icon">
						<Headphones className="icon" />
					</div>
					<h3>Dedicated Support</h3>
					<p>
						24/7 priority support with a dedicated account manager and custom
						SLAs for your team.
					</p>
				</div>
			</section>

			<section className="page-cta">
				<h2>Ready to scale your visualization workflow?</h2>
				<p className="cta-subtitle">
					Talk to our sales team to get a tailored plan for your organization.
				</p>
				<a href="mailto:enterprise@roomify.com" className="cta-btn">
					Contact Sales <ArrowRight className="icon" />
				</a>
			</section>

			<Footer />
		</div>
	);
}
