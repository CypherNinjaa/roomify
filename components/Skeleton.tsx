const Skeleton = ({
	className = "",
	width,
	height,
}: {
	className?: string;
	width?: string;
	height?: string;
}) => {
	return <div className={`skeleton ${className}`} style={{ width, height }} />;
};

export const ProjectCardSkeleton = () => (
	<div className="project-card-skeleton">
		<Skeleton className="skeleton-image" />
		<div className="skeleton-body">
			<Skeleton width="60%" height="16px" />
			<Skeleton width="40%" height="12px" />
		</div>
	</div>
);

export const VisualizerSkeleton = () => (
	<div className="visualizer-skeleton">
		<div className="skeleton-header">
			<Skeleton width="80px" height="12px" />
			<Skeleton width="200px" height="28px" />
			<Skeleton width="120px" height="12px" />
		</div>
		<Skeleton className="skeleton-render" />
	</div>
);

export default Skeleton;
