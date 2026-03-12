/**
 * Convert a File to a base64 data URL string.
 */
export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

/**
 * Extract the raw base64 data (without the data:...;base64, prefix).
 */
export function extractBase64Data(dataUrl: string): string {
	const idx = dataUrl.indexOf(",");
	return idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
}

/**
 * Extract the MIME type from a data URL.
 */
export function extractMimeType(dataUrl: string): string {
	const match = dataUrl.match(/^data:([^;]+);/);
	return match?.[1] ?? "image/png";
}

/**
 * Format a timestamp to a human-readable date string.
 */
export function formatDate(timestamp: number): string {
	return new Date(timestamp).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Generate a unique project ID.
 */
export function generateProjectId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
