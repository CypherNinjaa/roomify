import { Box, User, Menu, X } from "lucide-react";
import Button from "./ui/Button";
import { Link, useOutletContext } from "react-router";
import { useState } from "react";

const Navbar = () => {
	const { isSignedIn, userName, signIn, signOut } =
		useOutletContext<AuthContext>();
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleAuthClick = async () => {
		setMobileOpen(false);
		if (isSignedIn) {
			try {
				await signOut();
			} catch (e) {
				console.error(`Puter sign out failed: ${e}`);
			}

			return;
		}

		try {
			await signIn();
		} catch (e) {
			console.error(`Puter sign in failed: ${e}`);
		}
	};

	return (
		<header className="navbar">
			<nav className="inner">
				<div className="left">
					<div className="brand">
						<Box className="logo" />

						<span className="name">Roomify</span>
					</div>

					<ul className="links">
						<Link to="/product">Product</Link>
						<Link to="/pricing">Pricing</Link>
						<Link to="/community">Community</Link>
						<Link to="/enterprise">Enterprise</Link>
					</ul>
				</div>

				<div className="actions">
					{isSignedIn ?
						<>
							<Link to="/profile" className="greeting">
								{userName ? `Hi, ${userName}` : "Signed in"}
							</Link>

							<Button size="sm" onClick={handleAuthClick} className="btn">
								Log Out
							</Button>
						</>
					:	<>
							<Button onClick={handleAuthClick} size="sm" variant="ghost">
								Log In
							</Button>

							<a href="#upload" className="cta">
								Get Started
							</a>
						</>
					}
				</div>

				<button
					className="mobile-toggle"
					onClick={() => setMobileOpen(!mobileOpen)}
					aria-label="Toggle menu"
				>
					{mobileOpen ?
						<X className="w-5 h-5" />
					:	<Menu className="w-5 h-5" />}
				</button>
			</nav>

			{mobileOpen && (
				<div className="mobile-menu">
					<Link to="/product" onClick={() => setMobileOpen(false)}>
						Product
					</Link>
					<Link to="/pricing" onClick={() => setMobileOpen(false)}>
						Pricing
					</Link>
					<Link to="/community" onClick={() => setMobileOpen(false)}>
						Community
					</Link>
					<Link to="/enterprise" onClick={() => setMobileOpen(false)}>
						Enterprise
					</Link>

					<div className="mobile-actions">
						{isSignedIn ?
							<>
								<Link
									to="/profile"
									className="greeting"
									onClick={() => setMobileOpen(false)}
								>
									{userName ? `Hi, ${userName}` : "Signed in"}
								</Link>
								<Button size="sm" onClick={handleAuthClick} className="btn">
									Log Out
								</Button>
							</>
						:	<>
								<Button onClick={handleAuthClick} size="sm" variant="ghost">
									Log In
								</Button>
								<a
									href="#upload"
									className="cta"
									onClick={() => setMobileOpen(false)}
								>
									Get Started
								</a>
							</>
						}
					</div>
				</div>
			)}
		</header>
	);
};

export default Navbar;
