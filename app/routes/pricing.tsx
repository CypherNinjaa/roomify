import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Check, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "../../lib/useScrollAnimation";

const plans = [
	{
		name: "Free",
		price: "$0",
		period: "forever",
		description: "Perfect for trying out Roomify",
		features: [
			"3 renders per month",
			"Basic AI models",
			"720p export resolution",
			"Community support",
		],
		cta: "Get Started",
		highlighted: false,
	},
	{
		name: "Pro",
		price: "$19",
		period: "/month",
		description: "For architects and designers",
		features: [
			"Unlimited renders",
			"Premium AI models (Gemini + Claude)",
			"4K export resolution",
			"Priority rendering queue",
			"Project history & hosting",
			"Email support",
		],
		cta: "Start Free Trial",
		highlighted: true,
	},
	{
		name: "Team",
		price: "$49",
		period: "/month",
		description: "For studios and agencies",
		features: [
			"Everything in Pro",
			"5 team members included",
			"Shared project workspace",
			"Custom branding on exports",
			"API access",
			"Dedicated support",
		],
		cta: "Contact Sales",
		highlighted: false,
	},
];

export default function Pricing() {
	useScrollAnimation();
	return (
		<div className="page pricing-page page-transition">
			<Navbar />

			<section className="page-hero">
				<h1>Simple, transparent pricing</h1>
				<p className="page-subtitle">
					Start free, upgrade when you need more. No hidden fees.
				</p>
			</section>

			<section className="pricing-grid">
				{plans.map((plan, index) => (
					<div
						key={plan.name}
						className={`pricing-card animate-on-scroll delay-${index + 1} ${plan.highlighted ? "highlighted" : ""}`}
					>
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
									<span>{feature}</span>
								</li>
							))}
						</ul>

						<a
							href="/#upload"
							className={`pricing-cta ${plan.highlighted ? "primary" : ""}`}
						>
							{plan.cta} <ArrowRight className="icon" />
						</a>
					</div>
				))}
			</section>

			<Footer />
		</div>
	);
}
