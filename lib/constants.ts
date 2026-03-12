/* ─── Storage Paths ─── */
export const STORAGE_PATHS = {
	ROOT: "roomify",
	projects: (userId: string) => `roomify/projects/${userId}`,
	source: (userId: string, projectId: string) =>
		`roomify/projects/${userId}/${projectId}/source`,
	rendered: (userId: string, projectId: string, style: string) =>
		`roomify/projects/${userId}/${projectId}/rendered_${style}`,
} as const;

/* ─── Timing ─── */
export const PROGRESS_INCREMENT = 8;
export const PROGRESS_INTERVAL_MS = 200;
export const REDIRECT_DELAY_MS = 600;
export const SHARE_STATUS_RESET_DELAY_MS = 3000;

/* ─── Room Styles ─── */
export const ROOM_STYLES = [
	{ id: "modern", label: "Modern", description: "Clean lines, neutral tones" },
	{ id: "rustic", label: "Rustic", description: "Warm wood, natural charm" },
	{
		id: "minimalist",
		label: "Minimalist",
		description: "Less is more, open space",
	},
	{
		id: "industrial",
		label: "Industrial",
		description: "Raw materials, urban edge",
	},
	{
		id: "scandinavian",
		label: "Scandinavian",
		description: "Light, airy, hygge",
	},
] as const;

export const STYLE_PROMPTS: Record<string, string> = {
	modern:
		"modern interior with clean lines, neutral palette, contemporary furniture, glass and steel accents",
	rustic:
		"rustic interior with exposed wooden beams, stone walls, vintage furniture, warm earthy tones",
	minimalist:
		"minimalist interior with pure white walls, essential furniture only, zen-like simplicity, natural light",
	industrial:
		"industrial loft with exposed brick, metal piping, concrete floors, Edison bulbs, raw materials",
	scandinavian:
		"scandinavian interior with light wood floors, white walls, cozy textiles, houseplants, soft natural light",
};

/* ─── AI Render Prompt ─── */
export const ROOMIFY_RENDER_PROMPT = `You are an expert architectural visualization AI. Transform the provided 2D floor plan into a photorealistic 3D interior render.

Requirements:
- Output ONLY the rendered image, no text or annotations
- Maintain exact room dimensions and layout from the floor plan
- Add realistic lighting (natural + artificial)
- Include appropriate furniture & decor for the room type
- Use high-quality materials and textures
- Camera angle: slightly elevated perspective showing depth
- Resolution: photorealistic quality, magazine-worthy
- Style: {STYLE_OVERRIDE}

IMPORTANT: The output must be a single photorealistic image. Do NOT include any text, labels, measurements, or overlays.`;
