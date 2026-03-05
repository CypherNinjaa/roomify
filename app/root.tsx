import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { useEffect, useState } from "react";
import {
	getCurrentUser,
	signIn as puterSignIn,
	signOut as puterSignOut,
} from "../lib/puter.action";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

const DEFAULT_AUTH_STATE: AuthState = {
	isSignedIn: false,
	userName: null,
	userId: null,
};

export default function App() {
	const [authState, setAuthState] = useState<AuthState>(DEFAULT_AUTH_STATE);

	const refreshAuth = async () => {
		try {
			const user = await getCurrentUser();

			setAuthState({
				isSignedIn: !!user,
				userName: user?.username || null,
				userId: user?.uuid || null,
			});

			return !!user;
		} catch {
			setAuthState(DEFAULT_AUTH_STATE);
			return false;
		}
	};

	useEffect(() => {
		refreshAuth();
	}, []);

	const signIn = async () => {
		await puterSignIn();
		return await refreshAuth();
	};

	const signOut = async () => {
		puterSignOut();
		return await refreshAuth();
	};

	return (
		<main className="min-h-screen bg-background text-foreground relative z-10">
			<Outlet context={{ ...authState, refreshAuth, signIn, signOut }} />;
		</main>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;
	let is404 = false;

	if (isRouteErrorResponse(error)) {
		is404 = error.status === 404;
		message = is404 ? "404" : `${error.status}`;
		details =
			is404 ?
				"The page you're looking for doesn't exist or has been moved."
			:	error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="error-page">
			<div className="error-content">
				<span className="error-code">{message}</span>
				<h1 className="error-title">
					{is404 ? "Page Not Found" : "Something Went Wrong"}
				</h1>
				<p className="error-detail">{details}</p>
				<div className="error-actions">
					<a href="/" className="error-home-btn">
						Back to Home
					</a>
				</div>
				{stack && (
					<pre className="error-stack">
						<code>{stack}</code>
					</pre>
				)}
			</div>
		</main>
	);
}
