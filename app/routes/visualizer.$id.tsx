import { useNavigate, useOutletContext, useParams } from "react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { generate3DView } from "../../lib/ai.action";
import {
	Box,
	Download,
	RefreshCcw,
	Share2,
	X,
	Paintbrush,
	Images,
	Check,
	Trash2,
	Pencil,
	ZoomIn,
	ZoomOut,
	Maximize2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { ROOM_STYLES } from "../../lib/constants";
import {
	createProject,
	getProjectById,
	deleteProject,
} from "../../lib/puter.action";
import {
	ReactCompareSlider,
	ReactCompareSliderImage,
} from "react-compare-slider";
import { VisualizerSkeleton } from "../../components/Skeleton";

const VisualizerId = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { userId } = useOutletContext<AuthContext>();

	const hasInitialGenerated = useRef(false);

	const [project, setProject] = useState<DesignItem | null>(null);
	const [isProjectLoading, setIsProjectLoading] = useState(true);

	const [isProcessing, setIsProcessing] = useState(false);
	const [currentImage, setCurrentImage] = useState<string | null>(null);
	const [selectedStyle, setSelectedStyle] = useState<string>("modern");
	const [styleCache, setStyleCache] = useState<Record<string, string>>({});
	const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
	const [isRenaming, setIsRenaming] = useState(false);
	const [renameValue, setRenameValue] = useState("");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [zoomLevel, setZoomLevel] = useState(1);
	const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const panStart = useRef({ x: 0, y: 0 });
	const renderAreaRef = useRef<HTMLDivElement>(null);

	const handleBack = () => navigate("/");
	const handleExport = () => {
		if (!currentImage) return;

		const link = document.createElement("a");
		link.href = currentImage;
		link.download = `roomify-${id || "design"}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleShare = async () => {
		const shareUrl = window.location.href;
		try {
			await navigator.clipboard.writeText(shareUrl);
			setShareStatus("copied");
			setTimeout(() => setShareStatus("idle"), 1500);
		} catch {
			console.error("Failed to copy link");
		}
	};

	const handleStyleSelect = (styleId: string) => {
		setSelectedStyle(styleId);
		if (styleCache[styleId]) {
			setCurrentImage(styleCache[styleId]);
		}
	};

	const handleStartRename = () => {
		setRenameValue(project?.name || `Residence ${id}`);
		setIsRenaming(true);
	};

	const handleSaveRename = async () => {
		if (!project || !renameValue.trim()) return;
		const updated = { ...project, name: renameValue.trim() };
		setProject(updated);
		setIsRenaming(false);
		await createProject({ item: updated, visibility: "private" });
	};

	const handleDelete = async () => {
		if (!id) return;
		const success = await deleteProject({ id });
		if (success) navigate("/");
	};

	const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
	const handleZoomOut = () => {
		setZoomLevel((z) => {
			const next = Math.max(z - 0.25, 1);
			if (next === 1) setPanOffset({ x: 0, y: 0 });
			return next;
		});
	};
	const handleZoomReset = () => {
		setZoomLevel(1);
		setPanOffset({ x: 0, y: 0 });
	};

	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			if (zoomLevel <= 1) return;
			setIsPanning(true);
			panStart.current = {
				x: e.clientX - panOffset.x,
				y: e.clientY - panOffset.y,
			};
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
		},
		[zoomLevel, panOffset],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent) => {
			if (!isPanning) return;
			setPanOffset({
				x: e.clientX - panStart.current.x,
				y: e.clientY - panStart.current.y,
			});
		},
		[isPanning],
	);

	const handlePointerUp = useCallback(() => setIsPanning(false), []);

	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			if (!currentImage) return;
			e.preventDefault();
			const delta = e.deltaY < 0 ? 0.15 : -0.15;
			setZoomLevel((z) => {
				const next = Math.min(Math.max(z + delta, 1), 3);
				if (next === 1) setPanOffset({ x: 0, y: 0 });
				return next;
			});
		},
		[currentImage],
	);

	const runGeneration = async (item: DesignItem, style?: string) => {
		const activeStyle = style || selectedStyle;
		if (!id || !item.sourceImage) return;

		if (styleCache[activeStyle]) {
			setCurrentImage(styleCache[activeStyle]);
			return;
		}

		try {
			setIsProcessing(true);
			const result = await generate3DView({
				sourceImage: item.sourceImage,
				style: activeStyle,
			});

			if (result.renderedImage) {
				setCurrentImage(result.renderedImage);
				setStyleCache((prev) => ({
					...prev,
					[activeStyle]: result.renderedImage!,
				}));

				const updatedItem = {
					...item,
					renderedImage: result.renderedImage,
					renderedPath: result.renderedPath,
					timestamp: Date.now(),
					ownerId: item.ownerId ?? userId ?? null,
					isPublic: item.isPublic ?? false,
				};

				const saved = await createProject({
					item: updatedItem,
					visibility: "private",
				});

				if (saved) {
					setProject(saved);
					setCurrentImage(saved.renderedImage || result.renderedImage);
				}
			}
		} catch (error) {
			console.error("Generation failed: ", error);
		} finally {
			setIsProcessing(false);
		}
	};

	useEffect(() => {
		let isMounted = true;

		const loadProject = async () => {
			if (!id) {
				setIsProjectLoading(false);
				return;
			}

			setIsProjectLoading(true);

			const fetchedProject = await getProjectById({ id });

			if (!isMounted) return;

			setProject(fetchedProject);
			setCurrentImage(fetchedProject?.renderedImage || null);
			setIsProjectLoading(false);
			hasInitialGenerated.current = false;
		};

		loadProject();

		return () => {
			isMounted = false;
		};
	}, [id]);

	useEffect(() => {
		if (
			isProjectLoading ||
			hasInitialGenerated.current ||
			!project?.sourceImage
		)
			return;

		if (project.renderedImage) {
			setCurrentImage(project.renderedImage);
			hasInitialGenerated.current = true;
			return;
		}

		hasInitialGenerated.current = true;
		void runGeneration(project);
	}, [project, isProjectLoading]);

	return (
		<div className="visualizer">
			<nav className="topbar">
				<div className="brand">
					<Box className="logo" />

					<span className="name">Roomify</span>
				</div>
				<Button variant="ghost" size="sm" onClick={handleBack} className="exit">
					<X className="icon" /> Exit Editor
				</Button>
			</nav>

			<section className="content">
				{isProjectLoading ?
					<div className="panel">
						<VisualizerSkeleton />
					</div>
				:	<div className="panel">
						<div className="panel-header">
							<div className="panel-meta">
								<p>Project</p>
								{isRenaming ?
									<div className="rename-row">
										<input
											type="text"
											value={renameValue}
											onChange={(e) => setRenameValue(e.target.value)}
											onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
											className="rename-input"
											autoFocus
										/>
										<Button
											size="sm"
											onClick={handleSaveRename}
											className="rename-save"
										>
											<Check className="w-3 h-3" />
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => setIsRenaming(false)}
										>
											<X className="w-3 h-3" />
										</Button>
									</div>
								:	<div className="name-row">
										<h2>{project?.name || `Residence ${id}`}</h2>
										<button
											className="icon-btn"
											onClick={handleStartRename}
											title="Rename"
										>
											<Pencil className="w-3.5 h-3.5" />
										</button>
										<button
											className="icon-btn danger"
											onClick={() => setShowDeleteConfirm(true)}
											title="Delete"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</button>
									</div>
								}
								<p className="note">Created by You</p>
							</div>

							<div className="panel-actions">
								<Button
									size="sm"
									onClick={() =>
										project && runGeneration(project, selectedStyle)
									}
									className="regenerate"
									disabled={isProcessing || !project?.sourceImage}
								>
									<RefreshCcw className="w-4 h-4 mr-2" />
									{styleCache[selectedStyle] ? "View Cached" : "Generate"}
								</Button>
								<Button
									size="sm"
									onClick={handleExport}
									className="export"
									disabled={!currentImage}
								>
									<Download className="w-4 h-4 mr-2" /> Export
								</Button>
								<Button size="sm" onClick={handleShare} className="share">
									{shareStatus === "copied" ?
										<>
											<Check className="w-4 h-4 mr-2" /> Copied!
										</>
									:	<>
											<Share2 className="w-4 h-4 mr-2" /> Share
										</>
									}
								</Button>
							</div>
						</div>

						<div className="style-selector">
							<div className="style-selector-header">
								<Paintbrush className="w-4 h-4" />
								<span>Room Style</span>
							</div>
							<div className="style-options">
								{ROOM_STYLES.map((style) => (
									<button
										key={style.id}
										className={`style-option ${selectedStyle === style.id ? "active" : ""} ${styleCache[style.id] ? "cached" : ""}`}
										onClick={() => handleStyleSelect(style.id)}
										disabled={isProcessing}
									>
										<span className="style-label">
											{style.label}
											{styleCache[style.id] && (
												<span className="cached-badge">✓</span>
											)}
										</span>
										<span className="style-desc">{style.description}</span>
									</button>
								))}
							</div>
						</div>

						<div
							className={`render-area ${isProcessing ? "is-processing" : ""}`}
							ref={renderAreaRef}
							onPointerDown={handlePointerDown}
							onPointerMove={handlePointerMove}
							onPointerUp={handlePointerUp}
							onWheel={handleWheel}
							style={{
								cursor:
									zoomLevel > 1 ?
										isPanning ? "grabbing"
										:	"grab"
									:	"default",
							}}
						>
							{currentImage ?
								<img
									src={currentImage}
									alt="AI Render"
									className="render-img"
									draggable={false}
									style={{
										transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
										transformOrigin: "center center",
									}}
								/>
							:	<div className="render-placeholder">
									{project?.sourceImage && (
										<img
											src={project?.sourceImage}
											alt="Original"
											className="render-fallback"
										/>
									)}
								</div>
							}

							{currentImage && (
								<div className="zoom-controls">
									<button
										onClick={handleZoomIn}
										title="Zoom in"
										disabled={zoomLevel >= 3}
									>
										<ZoomIn className="w-4 h-4" />
									</button>
									<span className="zoom-level">
										{Math.round(zoomLevel * 100)}%
									</span>
									<button
										onClick={handleZoomOut}
										title="Zoom out"
										disabled={zoomLevel <= 1}
									>
										<ZoomOut className="w-4 h-4" />
									</button>
									<button onClick={handleZoomReset} title="Reset zoom">
										<Maximize2 className="w-4 h-4" />
									</button>
								</div>
							)}

							{isProcessing && (
								<div className="render-overlay">
									<div className="rendering-card">
										<RefreshCcw className="spinner" />
										<span className="title">Rendering...</span>
										<span className="subtitle">
											Generating your 3D visualization
										</span>
									</div>
								</div>
							)}
						</div>
					</div>
				}

				<div className="panel compare">
					<div className="panel-header">
						<div className="panel-meta">
							<p>Comparison</p>
							<h3>Before and After</h3>
						</div>
						<div className="hint">Drag to compare</div>
					</div>

					<div className="compare-stage">
						{project?.sourceImage && currentImage ?
							<ReactCompareSlider
								key={currentImage}
								defaultValue={50}
								style={{ width: "100%", height: "auto" }}
								itemOne={
									<ReactCompareSliderImage
										src={project?.sourceImage}
										alt="before"
										className="compare-img"
									/>
								}
								itemTwo={
									<ReactCompareSliderImage
										src={currentImage || project?.renderedImage || ""}
										alt="after"
										className="compare-img"
									/>
								}
							/>
						:	<div className="compare-fallback">
								{project?.sourceImage && (
									<img
										src={project.sourceImage}
										alt="Before"
										className="compare-img"
									/>
								)}
							</div>
						}
					</div>
				</div>

				{Object.keys(styleCache).length > 0 && (
					<div className="panel style-gallery">
						<div className="panel-header">
							<div className="panel-meta">
								<p>Gallery</p>
								<h3>Generated Styles ({Object.keys(styleCache).length}/5)</h3>
							</div>
							<div className="hint">
								<Images className="w-4 h-4" /> Click to view
							</div>
						</div>
						<div className="gallery-grid">
							{ROOM_STYLES.filter((s) => styleCache[s.id]).map((style) => (
								<button
									key={style.id}
									className={`gallery-item ${selectedStyle === style.id ? "active" : ""}`}
									onClick={() => handleStyleSelect(style.id)}
								>
									<img src={styleCache[style.id]} alt={style.label} />
									<span className="gallery-label">{style.label}</span>
								</button>
							))}
						</div>
					</div>
				)}
			</section>

			{showDeleteConfirm && (
				<div
					className="delete-modal-overlay"
					onClick={() => setShowDeleteConfirm(false)}
				>
					<div className="delete-modal" onClick={(e) => e.stopPropagation()}>
						<Trash2 className="w-8 h-8 text-red-500 mb-3" />
						<h3>Delete Project</h3>
						<p>Are you sure? This action cannot be undone.</p>
						<div className="delete-modal-actions">
							<Button
								size="sm"
								onClick={handleDelete}
								className="delete-confirm"
							>
								Delete
							</Button>
							<Button
								size="sm"
								variant="ghost"
								onClick={() => setShowDeleteConfirm(false)}
							>
								Cancel
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
export default VisualizerId;
