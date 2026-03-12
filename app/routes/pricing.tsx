import { Link } from "react-router";
import { Check, ArrowRight } from "lucide-react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import { useScrollAnimation } from "~/lib/useScrollAnimation";

const PLANS = [
	{
		name: "Free",
		price: "$0",
		period: "forever",
		description: "Perfect for trying things out.",
		features: [
			"3 projects per month",
			"5 AI renders per month",
			"Basic styles (modern, minimalist)",
			"Standard resolution export",
			"Community gallery access",
		],
		highlighted: false,
	},
	{
		name: "Pro",
		price: "$19",
		period: "/month",
		description: "For professional architects & designers.",
		features: [
			"Unlimited projects",
			"50 AI renders per month",
			"All 5 design styles",
			"High resolution export",
			"Priority AI processing",
			"Cloud storage (10 GB)",
			"Before/after comparison",
		],
		highlighted: true,
	},
	{
		name: "Team",
		price: "$49",
		period: "/month",
		description: "For architecture firms & teams.",
		features: [
			"Everything in Pro",
			"Unlimited AI renders",
			"Team collaboration",
			"50 GB cloud storage",
			"Custom branding",
			"API access",
			"Dedicated support",
			"Admin dashboard",
		],
		highlighted: false,
	},
];

export default function Pricing() {
	useScrollAnimation();

	return (
		<div className="page">
			<Navbar />

			<section className="page-hero">
				<h1>Simple Pricing</h1>
				<p className="page-subtitle">
					Start free, upgrade when you need more. No hidden fees, cancel
					anytime.
				</p>
			</section>

			<div className="pricing-grid">
				{PLANS.map((plan, i) => (
					<div
						key={plan.name}
						className={`pricing-card animate-on-scroll delay-${i + 1} ${plan.highlighted ? "highlighted" : ""}`}
					>
						{plan.highlighted && (
							<span className="pricing-badge">Most Popular</span>
						)}

						<div className="pricing-header">
							<h3>{plan.name}</h3>
							<div className="price">
								<span className="amount">{plan.price}</span>
								<span className="period">{plan.period}</span>
							</div>
							<p>{plan.description}</p>
						</div>

						<ul className="pricing-features">
							{plan.features.map((feature) => (
								<li key={feature}>
									<Check className="check" />
									{feature}
								</li>
							))}
						</ul>

						<Link
							to="/"
							className={`pricing-cta btn btn--outline btn--md ${plan.highlighted ? "primary" : ""}`}
						>
							Get Started <ArrowRight size={14} className="icon" />
						</Link>
					</div>
				))}
			</div>

			<Footer />
		</div>
	);
}
