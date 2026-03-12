import { useState } from "react";
import { Link } from "react-router";
import {
	SignInButton,
	SignedIn,
	SignedOut,
	UserButton,
	useUser,
} from "@clerk/react-router";
import { Menu, X, Box } from "lucide-react";

const NAV_LINKS = [
	{ to: "/product", label: "Product" },
	{ to: "/pricing", label: "Pricing" },
	{ to: "/community", label: "Community" },
	{ to: "/enterprise", label: "Enterprise" },
];

export default function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const { user } = useUser();
	const isAdmin = user?.publicMetadata?.role === "admin";

	return (
		<nav className="navbar">
			<div className="inner">
				<div className="left">
					<Link to="/" className="brand">
						<Box className="logo" />
						<span className="name">Roomify</span>
					</Link>

					<div className="links">
						{NAV_LINKS.map((link) => (
							<Link key={link.to} to={link.to}>
								{link.label}
							</Link>
						))}
						{isAdmin && <Link to="/admin">Admin</Link>}
					</div>
				</div>

				<div className="actions">
					<SignedOut>
						<SignInButton mode="modal">
							<button className="btn btn--ghost btn--sm" type="button">
								Sign In
							</button>
						</SignInButton>
						<SignInButton mode="modal">
							<button className="btn btn--primary btn--sm" type="button">
								Get Started
							</button>
						</SignInButton>
					</SignedOut>

					<SignedIn>
						<Link to="/profile" className="btn btn--ghost btn--sm">
							Profile
						</Link>
						<UserButton
							appearance={{
								elements: { avatarBox: "w-8 h-8" },
							}}
						/>
					</SignedIn>
				</div>

				<button
					type="button"
					className="mobile-toggle"
					onClick={() => setMobileOpen(!mobileOpen)}
					aria-label="Toggle menu"
				>
					{mobileOpen ?
						<X size={20} />
					:	<Menu size={20} />}
				</button>
			</div>

			{mobileOpen && (
				<div className="mobile-menu">
					{NAV_LINKS.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							onClick={() => setMobileOpen(false)}
						>
							{link.label}
						</Link>
					))}
					{isAdmin && (
						<Link to="/admin" onClick={() => setMobileOpen(false)}>
							Admin
						</Link>
					)}

					<div className="mobile-actions">
						<SignedOut>
							<SignInButton mode="modal">
								<button
									className="btn btn--primary btn--md btn--full"
									type="button"
								>
									Get Started
								</button>
							</SignInButton>
						</SignedOut>

						<SignedIn>
							<Link
								to="/profile"
								className="btn btn--secondary btn--md btn--full"
								onClick={() => setMobileOpen(false)}
							>
								Profile
							</Link>
						</SignedIn>
					</div>
				</div>
			)}
		</nav>
	);
}
