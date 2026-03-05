export const PUTER_WORKER_URL = (
	import.meta.env.VITE_PUTER_WORKER_URL || ""
).replace(/\/+$/, "");

// Storage Paths
export const STORAGE_PATHS = {
	ROOT: "roomify",
	SOURCES: "roomify/sources",
	RENDERS: "roomify/renders",
} as const;

// Timing Constants (in milliseconds)
export const SHARE_STATUS_RESET_DELAY_MS = 1500;
export const PROGRESS_INCREMENT = 15;
export const REDIRECT_DELAY_MS = 600;
export const PROGRESS_INTERVAL_MS = 100;
export const PROGRESS_STEP = 5;

// UI Constants
export const GRID_OVERLAY_SIZE = "60px 60px";
export const GRID_COLOR = "#3B82F6";

// HTTP Status Codes
export const UNAUTHORIZED_STATUSES = [401, 403];

// Image Dimensions
export const IMAGE_RENDER_DIMENSION = 1024;

export const ROOM_STYLES = [
	{
		id: "modern",
		label: "Modern",
		description: "Clean lines, minimalist furniture, neutral tones",
	},
	{
		id: "rustic",
		label: "Rustic",
		description: "Warm wood, stone accents, cozy textures",
	},
	{
		id: "minimalist",
		label: "Minimalist",
		description: "Ultra-clean, sparse furnishing, white spaces",
	},
	{
		id: "industrial",
		label: "Industrial",
		description: "Exposed brick, metal, concrete, raw finishes",
	},
	{
		id: "scandinavian",
		label: "Scandinavian",
		description: "Light wood, soft pastels, hygge aesthetic",
	},
] as const;

export type RoomStyleId = (typeof ROOM_STYLES)[number]["id"];

export const STYLE_PROMPTS: Record<RoomStyleId, string> = {
	modern:
		"STYLE OVERRIDE: Use a modern contemporary interior design style — clean geometric lines, minimalist furniture, neutral color palette (white, grey, black with warm wood accents), large glass elements, and sleek finishes.",
	rustic:
		"STYLE OVERRIDE: Use a rustic/farmhouse interior design style — warm natural wood floors and beams, stone accent walls, earthy tones (brown, beige, forest green), cozy woven textiles, and vintage-inspired furniture.",
	minimalist:
		"STYLE OVERRIDE: Use an ultra-minimalist interior design style — all-white or very light walls and floors, extremely sparse furnishing, hidden storage, no decorative clutter, emphasis on negative space and natural light.",
	industrial:
		"STYLE OVERRIDE: Use an industrial loft interior design style — exposed brick walls, concrete floors, visible metal ductwork and pipes, Edison bulb lighting, raw steel furniture frames, and dark moody tones.",
	scandinavian:
		"STYLE OVERRIDE: Use a Scandinavian interior design style — light blonde wood, soft pastel accents (blush pink, sage green), rounded organic furniture shapes, wool and linen textures, and abundant natural light.",
};

export const ROOMIFY_RENDER_PROMPT = `
TASK: Convert the input 2D floor plan into a **photorealistic, top‑down 3D architectural render**.

STRICT REQUIREMENTS (do not violate):
1) **REMOVE ALL TEXT**: Do not render any letters, numbers, labels, dimensions, or annotations. Floors must be continuous where text used to be.
2) **GEOMETRY MUST MATCH**: Walls, rooms, doors, and windows must follow the exact lines and positions in the plan. Do not shift or resize.
3) **TOP‑DOWN ONLY**: Orthographic top‑down view. No perspective tilt.
4) **CLEAN, REALISTIC OUTPUT**: Crisp edges, balanced lighting, and realistic materials. No sketch/hand‑drawn look.
5) **NO EXTRA CONTENT**: Do not add rooms, furniture, or objects that are not clearly indicated by the plan.

STRUCTURE & DETAILS:
- **Walls**: Extrude precisely from the plan lines. Consistent wall height and thickness.
- **Doors**: Convert door swing arcs into open doors, aligned to the plan.
- **Windows**: Convert thin perimeter lines into realistic glass windows.

FURNITURE & ROOM MAPPING (only where icons/fixtures are clearly shown):
- Bed icon → realistic bed with duvet and pillows.
- Sofa icon → modern sectional or sofa.
- Dining table icon → table with chairs.
- Kitchen icon → counters with sink and stove.
- Bathroom icon → toilet, sink, and tub/shower.
- Office/study icon → desk, chair, and minimal shelving.
- Porch/patio/balcony icon → outdoor seating or simple furniture (keep minimal).
- Utility/laundry icon → washer/dryer and minimal cabinetry.

STYLE & LIGHTING:
- Lighting: bright, neutral daylight. High clarity and balanced contrast.
- Materials: realistic wood/tile floors, clean walls, subtle shadows.
- Finish: professional architectural visualization; no text, no watermarks, no logos.
`.trim();
