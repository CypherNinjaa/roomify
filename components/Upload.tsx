import { useRef, useState, useCallback } from "react";
import {
	Upload as UploadIcon,
	CheckCircle,
	Image,
	AlertCircle,
} from "lucide-react";
import { PROGRESS_INCREMENT, PROGRESS_INTERVAL_MS } from "~/lib/constants";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function Upload({ onComplete, className }: UploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [progress, setProgress] = useState(0);
	const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
	const [error, setError] = useState<string | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const cleanup = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	const handleFile = useCallback(
		async (selected: File) => {
			setError(null);

			if (!ALLOWED_TYPES.includes(selected.type)) {
				setError("Only JPG, PNG, and WebP images are supported.");
				return;
			}

			if (selected.size > MAX_FILE_SIZE_BYTES) {
				const sizeMB = (selected.size / (1024 * 1024)).toFixed(1);
				setError(
					`File is ${sizeMB} MB. Maximum allowed is ${MAX_FILE_SIZE_MB} MB.`,
				);
				return;
			}

			setFile(selected);
			setStatus("uploading");
			setProgress(0);

			intervalRef.current = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 90) {
						cleanup();
						return 90;
					}
					return prev + PROGRESS_INCREMENT;
				});
			}, PROGRESS_INTERVAL_MS);

			try {
				await onComplete(selected);
				cleanup();
				setProgress(100);
				setStatus("done");
			} catch {
				cleanup();
				setProgress(0);
				setStatus("idle");
				setFile(null);
			}
		},
		[onComplete],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const dropped = e.dataTransfer.files[0];
			if (dropped) handleFile(dropped);
		},
		[handleFile],
	);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const selected = e.target.files?.[0];
			if (selected) handleFile(selected);
		},
		[handleFile],
	);

	if (status !== "idle" && file) {
		return (
			<div className={`upload ${className ?? ""}`}>
				<div className="upload-status">
					<div className="status-content">
						<div className="status-icon">
							{status === "done" ?
								<CheckCircle className="check" size={24} />
							:	<Image size={24} />}
						</div>
						<h3>{file.name}</h3>
						<div className="progress">
							<div className="bar" style={{ width: `${progress}%` }} />
						</div>
						<span className="status-text">
							{status === "done" ? "Complete" : "Uploading..."}
						</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`upload ${className ?? ""}`}>
			{error && (
				<div className="upload-error">
					<AlertCircle size={16} />
					<span>{error}</span>
				</div>
			)}
			<div
				className={`dropzone ${isDragging ? "is-dragging" : ""}`}
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={handleDrop}
			>
				<input
					ref={inputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					className="drop-input"
					onChange={handleChange}
				/>
				<div className="drop-content">
					<div className="drop-icon">
						<UploadIcon size={22} />
					</div>
					<p>Drop your floor plan here</p>
					<span className="help">JPG, PNG or WebP — max 10 MB</span>
				</div>
			</div>
		</div>
	);
}
