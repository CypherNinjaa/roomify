export function Skeleton({
	width,
	height,
	className,
}: {
	width?: string;
	height?: string;
	className?: string;
}) {
	return (
		<div
			className={`skeleton ${className ?? ""}`}
			style={{ width: width ?? "100%", height: height ?? "20px" }}
		/>
	);
}

export function ProjectCardSkeleton() {
	return (
		<div className="project-card-skeleton">
			<div className="skeleton skeleton-image" />
			<div className="skeleton-body">
				<Skeleton height="16px" width="70%" />
				<Skeleton height="12px" width="40%" />
			</div>
		</div>
	);
}

export function VisualizerSkeleton() {
	return (
		<div className="visualizer-skeleton">
			<div className="skeleton-header">
				<Skeleton height="20px" width="200px" />
				<Skeleton height="14px" width="120px" />
			</div>
			<Skeleton className="skeleton-render" />
		</div>
	);
}
