import { Link } from "react-router";
import {
	Server,
	Users,
	Shield,
	HeadphonesIcon,
	BarChart3,
	Globe,
	ArrowRight,
} from "lucide-react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { useScrollAnimation } from "~/lib/useScrollAnimation";

const FEATURES = [
	{
		icon: Server,
		title: "Custom Deployment",
		desc: "On-premise or private cloud deployment options. Full control over your infrastructure with SLA guarantees.",
	},
	{
		icon: Users,
		title: "Unlimited Team Members",
		desc: "Scale your team without limits. Role-based access control, team workspaces, and collaborative project management.",
	},
	{
		icon: Shield,
		title: "Enterprise Security",
		desc: "SOC 2 compliance, SSO integration, data encryption at rest and in transit, and audit logging.",
	},
	{
		icon: HeadphonesIcon,
		title: "Dedicated Support",
		desc: "24/7 priority support with a dedicated account manager. Custom onboarding and training for your team.",
	},
	{
		icon: BarChart3,
		title: "Advanced Analytics",
		desc: "Detailed usage analytics, render quality metrics, and team productivity insights with exportable reports.",
	},
	{
		icon: Globe,
		title: "White-Label Solution",
		desc: "Custom branding, domain mapping, and client-facing portals. Make Roomify your own.",
	},
];

export default function Enterprise() {
	useScrollAnimation();

	return (
		<div className="page">
			<Navbar />

			<section className="page-hero">
				<h1>Enterprise Solutions</h1>
				<p className="page-subtitle">
					Tailored AI visualization for architecture firms, real estate
					developers, and design agencies.
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
				<h2>Ready for Enterprise?</h2>
				<p className="cta-subtitle">
					Contact our team for a custom demo and pricing.
				</p>
				<a
					href="mailto:enterprise@roomify.com"
					className="cta-btn btn btn--primary btn--lg"
				>
					Contact Sales <ArrowRight size={16} className="icon" />
				</a>
			</section>

			<Footer />
		</div>
	);
}
