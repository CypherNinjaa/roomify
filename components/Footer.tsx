import { Box } from "lucide-react";
import { Link } from "react-router";

const Footer = () => {
	return (
		<footer className="footer">
			<div className="footer-inner">
				<div className="footer-grid">
					<div className="footer-brand">
						<div className="brand">
							<Box className="logo" />
							<span className="name">Roomify</span>
						</div>
						<p className="tagline">
							AI-powered architectural visualization. Transform 2D floor plans
							into photorealistic 3D renders.
						</p>
					</div>

					<div className="footer-col">
						<h4>Product</h4>
						<ul>
							<li>
								<Link to="/product">Features</Link>
							</li>
							<li>
								<Link to="/pricing">Pricing</Link>
							</li>
							<li>
								<Link to="/enterprise">Enterprise</Link>
							</li>
						</ul>
					</div>

					<div className="footer-col">
						<h4>Community</h4>
						<ul>
							<li>
								<Link to="/community">Gallery</Link>
							</li>
							<li>
								<a
									href="https://discord.com/invite/n6EdbFJ"
									target="_blank"
									rel="noopener noreferrer"
								>
									Discord
								</a>
							</li>
							<li>
								<a
									href="https://github.com/adrianhajdin/roomify"
									target="_blank"
									rel="noopener noreferrer"
								>
									GitHub
								</a>
							</li>
						</ul>
					</div>

					<div className="footer-col">
						<h4>Account</h4>
						<ul>
							<li>
								<Link to="/profile">Profile</Link>
							</li>
							<li>
								<a
									href="https://puter.com"
									target="_blank"
									rel="noopener noreferrer"
								>
									Puter Dashboard
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="footer-bottom">
					<p>
						&copy; {new Date().getFullYear()} Roomify. Built with Puter &amp;
						AI.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
