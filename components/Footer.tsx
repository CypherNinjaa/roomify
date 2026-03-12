import { Link } from "react-router";
import { Box } from "lucide-react";

export default function Footer() {
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
							Transform 2D floor plans into stunning 3D renders with AI-powered
							visualization.
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
									href="https://github.com/CypherNinjaa/roomify"
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
						</ul>
					</div>
				</div>

				<div className="footer-bottom">
					<p>&copy; {new Date().getFullYear()} Roomify. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
