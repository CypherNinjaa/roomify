import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import { ClerkProvider } from "@clerk/react-router";
import { rootAuthLoader } from "@clerk/react-router/ssr.server";
import "./app.css";

export async function loader(args: Route.LoaderArgs) {
	return rootAuthLoader(args);
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
					rel="stylesheet"
				/>
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

export default function App({ loaderData }: Route.ComponentProps) {
	return (
		<ClerkProvider loaderData={loaderData}>
			<Outlet />
		</ClerkProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let title = "Something went wrong";
	let detail = "An unexpected error occurred. Please try again.";
	let code = "500";

	if (isRouteErrorResponse(error)) {
		code = String(error.status);
		title = error.status === 404 ? "Page not found" : "Error";
		detail =
			error.status === 404 ?
				"The page you're looking for doesn't exist or has been moved."
			:	(error.statusText ?? detail);
	} else if (error instanceof Error) {
		detail = error.message;
	}

	return (
		<div className="error-page">
			<div className="error-content">
				<p className="error-code">{code}</p>
				<h1 className="error-title">{title}</h1>
				<p className="error-detail">{detail}</p>
				<div className="error-actions">
					<a href="/" className="error-home-btn btn btn--primary btn--lg">
						Back to Home
					</a>
				</div>
			</div>
		</div>
	);
}
