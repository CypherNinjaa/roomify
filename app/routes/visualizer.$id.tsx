import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router";
import {
	useUser,
	SignedIn,
	SignedOut,
	SignInButton,
} from "@clerk/react-router";
import {
	ReactCompareSlider,
	ReactCompareSliderImage,
} from "react-compare-slider";
import {
	Box,
	ArrowLeft,
	RefreshCw,
	Download,
	Share2,
	Trash2,
	Pencil,
	Check,
	Loader2,
	ZoomIn,
	ZoomOut,
	Maximize2,
	Image,
	Paintbrush,
	LogIn,
} from "lucide-react";
import { VisualizerSkeleton } from "~/components/Skeleton";
import { ROOM_STYLES } from "~/lib/constants";
import { extractBase64Data, extractMimeType } from "~/lib/utils";

interface LocationState {
	sourceImage?: string;
	projectName?: string;
}

export default function Visualizer() {
	const { id } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const { user, isSignedIn } = useUser();

	const state = location.state as LocationState | null;
	const sourceImage = state?.sourceImage ?? null;

	const [projectName, setProjectName] = useState(
		state?.projectName ?? "Untitled Project",
	);
	const [isRenaming, setIsRenaming] = useState(false);
	const [renameValue, setRenameValue] = useState(projectName);
	const [selectedStyle, setSelectedStyle] = useState("modern");
	const [renderedImage, setRenderedImage] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [styleCache, setStyleCache] = useState<Record<string, string>>({});
	const [zoom, setZoom] = useState(100);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [publishStatus, setPublishStatus] = useState<
		"idle" | "success" | "error"
	>("idle");
	const renderAreaRef = useRef<HTMLDivElement>(null);

	// Auto-generate on first load
	useEffect(() => {
		if (sourceImage && !renderedImage && !isProcessing) {
			generateRender(selectedStyle);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sourceImage]);

	const generateRender = useCallback(
		async (style: string) => {
			if (!sourceImage) return;

			// Check cache first
			if (styleCache[style]) {
				setRenderedImage(styleCache[style]);
				setSelectedStyle(style);
				return;
			}

			setIsProcessing(true);
			setSelectedStyle(style);

			try {
				let base64Data: string;
				let mimeType: string;

				if (sourceImage.startsWith("data:")) {
					// Local base64 data URL
					base64Data = extractBase64Data(sourceImage);
					mimeType = extractMimeType(sourceImage);
				} else {
					// Cloudinary URL — fetch and convert to base64
					const imgResponse = await fetch(sourceImage);
					const blob = await imgResponse.blob();
					mimeType = blob.type || "image/png";
					const arrayBuffer = await blob.arrayBuffer();
					base64Data = btoa(
						String.fromCharCode(...new Uint8Array(arrayBuffer)),
					);
				}

				const response = await fetch("/api/generate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						sourceImageBase64: base64Data,
						mimeType,
						style,
					}),
				});

				if (!response.ok) throw new Error("Generation failed");

				const data = await response.json();

				if (data.renderedImage) {
					setRenderedImage(data.renderedImage);
					setStyleCache((prev) => ({ ...prev, [style]: data.renderedImage }));

					// Save rendered image to Cloudinary in background
					try {
						await fetch("/api/projects", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								action: "save-render",
								projectId: id,
								data: {
									renderedImage: data.renderedImage,
									style,
									name: projectName,
								},
							}),
						});
					} catch {
						/* non-critical: render is still cached locally */
					}
				}
			} catch (error) {
				console.error("Render generation failed:", error);
			} finally {
				setIsProcessing(false);
			}
		},
		[sourceImage, styleCache],
	);

	const handleExport = () => {
		const image = renderedImage ?? sourceImage;
		if (!image) return;

		const link = document.createElement("a");
		link.href = image;
		link.download = `${projectName}-${selectedStyle}.png`;
		link.click();
	};

	const handleShare = async () => {
		if (!renderedImage || !user) {
			// Just copy URL if no render yet
			try {
				await navigator.clipboard.writeText(window.location.href);
			} catch {
				/* clipboard may not be available */
			}
			return;
		}

		setIsPublishing(true);
		setPublishStatus("idle");
		try {
			const res = await fetch("/api/community", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					renderedImage,
					projectName,
					ownerName: user.fullName ?? user.username ?? "User",
					style: selectedStyle,
					sourceImage,
				}),
			});

			if (res.ok) {
				setPublishStatus("success");
				setTimeout(() => setPublishStatus("idle"), 3000);
			} else {
				setPublishStatus("error");
				setTimeout(() => setPublishStatus("idle"), 3000);
			}
		} catch {
			setPublishStatus("error");
			setTimeout(() => setPublishStatus("idle"), 3000);
		} finally {
			setIsPublishing(false);
		}
	};

	const handleRename = async () => {
		const newName = renameValue.trim();
		if (newName) {
			setProjectName(newName);
			// Persist rename to Cloudinary
			try {
				await fetch("/api/projects", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "rename",
						projectId: id,
						data: { name: newName },
					}),
				});
			} catch {
				/* non-critical */
			}
		}
		setIsRenaming(false);
	};

	const handleDelete = async () => {
		if (!user || !id) return;
		try {
			await fetch("/api/projects", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ projectId: id }),
			});
		} catch {
			/* ignore */
		}
		navigate("/");
	};

	// Auth gate
	if (!isSignedIn) {
		return (
			<div className="page">
				<div className="auth-gate">
					<div className="auth-icon">
						<LogIn size={28} className="text-primary" />
					</div>
					<h2>Sign In Required</h2>
					<p>Sign in to access the visualizer and your projects.</p>
					<SignInButton mode="modal">
						<button className="btn btn--primary btn--md" type="button">
							Sign In
						</button>
					</SignInButton>
				</div>
			</div>
		);
	}

	if (!sourceImage) {
		return (
			<div className="visualizer">
				<div className="topbar">
					<Link to="/" className="brand">
						<Box className="logo" />
						<span className="name">Roomify</span>
					</Link>
				</div>
				<div className="content">
					<div className="panel">
						<div className="panel-header">
							<div className="panel-meta">
								<h2>Project Not Found</h2>
								<p>Navigate back to upload a floor plan.</p>
							</div>
						</div>
						<div className="render-area">
							<div className="render-placeholder">
								<div className="text-center text-stone-400">
									<Image size={48} className="mx-auto mb-3 opacity-50" />
									<p className="text-sm font-medium">No floor plan loaded</p>
									<Link
										to="/"
										className="text-primary text-sm mt-2 inline-block hover:underline"
									>
										Go back & upload
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="visualizer">
			{/* Top Bar */}
			<div className="topbar">
				<Link to="/" className="brand">
					<Box className="logo" />
					<span className="name">Roomify</span>
				</Link>
				<button
					type="button"
					className="exit btn btn--ghost btn--sm"
					onClick={() => navigate("/")}
				>
					<ArrowLeft size={16} />
					<span className="hidden sm:inline">Back</span>
				</button>
			</div>

			<div className="content">
				{/* Main Render Panel */}
				<div className="panel">
					<div className="panel-header">
						<div className="panel-meta">
							<p>Project</p>
							{isRenaming ?
								<div className="rename-row">
									<input
										className="rename-input"
										value={renameValue}
										onChange={(e) => setRenameValue(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleRename()}
										autoFocus
									/>
									<button
										type="button"
										className="rename-save btn btn--primary btn--sm"
										onClick={handleRename}
									>
										<Check size={14} />
									</button>
								</div>
							:	<div className="name-row">
									<h2>{projectName}</h2>
									<button
										type="button"
										className="icon-btn"
										onClick={() => {
											setRenameValue(projectName);
											setIsRenaming(true);
										}}
										title="Rename"
									>
										<Pencil size={12} />
									</button>
									<button
										type="button"
										className="icon-btn danger"
										onClick={() => setShowDeleteModal(true)}
										title="Delete"
									>
										<Trash2 size={12} />
									</button>
								</div>
							}
						</div>

						<div className="panel-actions">
							<button
								type="button"
								className="regenerate btn btn--sm"
								onClick={() => generateRender(selectedStyle)}
								disabled={isProcessing}
							>
								<RefreshCw
									size={14}
									className={isProcessing ? "animate-spin" : ""}
								/>
								<span className="hidden sm:inline ml-1">Regenerate</span>
							</button>
							<button
								type="button"
								className="export btn btn--sm"
								onClick={handleExport}
								disabled={!renderedImage && !sourceImage}
							>
								<Download size={14} />
								<span className="hidden sm:inline ml-1">Export</span>
							</button>
							<button
								type="button"
								className="share btn btn--sm"
								onClick={handleShare}
								disabled={isPublishing}
								title={renderedImage ? "Publish to Community" : "Copy link"}
							>
								{isPublishing ?
									<Loader2 size={14} className="animate-spin" />
								:	<Share2 size={14} />}
								<span className="hidden sm:inline ml-1">
									{publishStatus === "success" ?
										"Published!"
									: publishStatus === "error" ?
										"Failed"
									: renderedImage ?
										"Publish"
									:	"Share"}
								</span>
							</button>
						</div>
					</div>

					{/* Style Selector */}
					<div className="style-selector">
						<div className="style-selector-header">
							<Paintbrush size={14} />
							<span>Design Style</span>
						</div>
						<div className="style-options">
							{ROOM_STYLES.map((style) => {
								const isCached = !!styleCache[style.id];
								const isActive = selectedStyle === style.id;
								return (
									<button
										type="button"
										key={style.id}
										className={`style-option ${isActive ? "active" : ""} ${isCached ? "cached" : ""}`}
										onClick={() => generateRender(style.id)}
										disabled={isProcessing}
									>
										<span className="style-label">
											{style.label}
											{isCached && !isActive && (
												<span className="cached-badge">✓</span>
											)}
										</span>
										<span className="style-desc">{style.description}</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Render Area */}
					<div
						className={`render-area ${isProcessing ? "is-processing" : ""}`}
						ref={renderAreaRef}
					>
						{isProcessing && (
							<div className="render-overlay">
								<div className="rendering-card">
									<Loader2 className="spinner" />
									<span className="title">Generating 3D Render</span>
									<span className="subtitle">
										Applying {selectedStyle} style...
									</span>
								</div>
							</div>
						)}

						{renderedImage ?
							<img
								className="render-img"
								src={renderedImage}
								alt="3D Render"
								style={{ transform: `scale(${zoom / 100})` }}
								draggable={false}
							/>
						: sourceImage ?
							<img
								className="render-img"
								src={sourceImage}
								alt="Source floor plan"
								style={{ transform: `scale(${zoom / 100})` }}
								draggable={false}
							/>
						:	<div className="render-placeholder">
								<VisualizerSkeleton />
							</div>
						}

						{/* Zoom Controls */}
						<div className="zoom-controls">
							<button
								type="button"
								onClick={() => setZoom((z) => Math.max(25, z - 25))}
								disabled={zoom <= 25}
							>
								<ZoomOut size={14} />
							</button>
							<span className="zoom-level">{zoom}%</span>
							<button
								type="button"
								onClick={() => setZoom((z) => Math.min(300, z + 25))}
								disabled={zoom >= 300}
							>
								<ZoomIn size={14} />
							</button>
							<button type="button" onClick={() => setZoom(100)}>
								<Maximize2 size={14} />
							</button>
						</div>
					</div>
				</div>

				{/* Before/After Comparison */}
				{renderedImage && sourceImage && (
					<div className="panel compare">
						<div className="panel-header">
							<div className="panel-meta">
								<h3>Before & After</h3>
							</div>
							<span className="hint">← Drag to compare →</span>
						</div>
						<div className="compare-stage">
							<ReactCompareSlider
								itemOne={
									<ReactCompareSliderImage
										src={sourceImage}
										alt="Original Floor Plan"
									/>
								}
								itemTwo={
									<ReactCompareSliderImage
										src={renderedImage}
										alt="3D Render"
									/>
								}
								style={{ height: "400px" }}
							/>
						</div>
					</div>
				)}

				{/* Style Gallery */}
				{Object.keys(styleCache).length > 1 && (
					<div className="panel style-gallery">
						<div className="panel-header">
							<div className="panel-meta">
								<h3>Style Gallery</h3>
							</div>
							<span className="hint">
								{Object.keys(styleCache).length} styles generated
							</span>
						</div>
						<div className="gallery-grid">
							{Object.entries(styleCache).map(([style, image]) => (
								<button
									key={style}
									type="button"
									className={`gallery-item ${selectedStyle === style ? "active" : ""}`}
									onClick={() => {
										setSelectedStyle(style);
										setRenderedImage(image);
									}}
								>
									<img src={image} alt={`${style} render`} />
									<span className="gallery-label">{style}</span>
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{showDeleteModal && (
				<div className="delete-modal-overlay">
					<div className="delete-modal">
						<h3>Delete Project?</h3>
						<p>
							This will permanently delete &quot;{projectName}&quot; and all its
							renders.
						</p>
						<div className="delete-modal-actions">
							<button
								type="button"
								className="btn btn--secondary btn--sm"
								onClick={() => setShowDeleteModal(false)}
							>
								Cancel
							</button>
							<button
								type="button"
								className="delete-confirm btn btn--sm"
								onClick={handleDelete}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
