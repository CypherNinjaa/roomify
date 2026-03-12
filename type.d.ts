/* ─── Project / Design ─── */
interface DesignItem {
	id: string;
	name: string;
	sourceImage: string;
	sourcePublicId: string;
	renderedImage?: string | null;
	renderedPublicId?: string | null;
	style?: string;
	timestamp: number;
	ownerId: string;
	ownerName?: string | null;
	isPublic?: boolean;
}

interface DesignConfig {
	floor: string;
	walls: string;
	style: string;
}

/* ─── App Status ─── */
enum AppStatus {
	IDLE = "IDLE",
	UPLOADING = "UPLOADING",
	PROCESSING = "PROCESSING",
	READY = "READY",
}

/* ─── Render Payload ─── */
type RenderCompletePayload = {
	renderedImage: string;
	renderedPublicId: string;
};

/* ─── Component Props ─── */
interface UploadProps {
	onComplete: (file: File) => Promise<boolean | void> | boolean | void;
	className?: string;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "outline";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
}

/* ─── Cloudinary ─── */
interface CloudinaryUploadResult {
	secure_url: string;
	public_id: string;
	format: string;
	width: number;
	height: number;
	bytes: number;
}

/* ─── Admin ─── */
interface AdminStats {
	totalUsers: number;
	totalProjects: number;
	totalRenders: number;
	storageUsedMB: number;
}

interface AdminUser {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	fullName: string;
	imageUrl: string;
	role: string;
	createdAt: number;
	lastSignInAt: number | null;
	banned: boolean;
}

interface AdminProject {
	id: string;
	ownerId: string;
	name: string;
	sourceImage: string;
	sourcePublicId: string;
	renderedImage: string | null;
	renderCount: number;
	timestamp: number;
	isPublic: boolean;
	totalBytes: number;
}

interface AdminUsersResponse {
	users: AdminUser[];
	total: number;
	page: number;
	totalPages: number;
}

interface AdminProjectsResponse {
	projects: AdminProject[];
	total: number;
	page: number;
	totalPages: number;
}

interface CardProps {
	children: React.ReactNode;
	className?: string;
	title?: string;
	action?: React.ReactNode;
}

type AuthContext = {
	isSignedIn: boolean;
	userName: string | null;
	userId: string | null;
	refreshAuth: () => Promise<boolean>;
	signIn: () => Promise<boolean>;
	signOut: () => Promise<boolean>;
};

type AuthRequiredModalProps = {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	title?: string;
	description?: string;
	confirmLabel?: string;
};

type ShareAction = "share" | "unshare";
type ShareStatus = "idle" | "saving" | "done";

type HostingConfig = { subdomain: string };
type HostedAsset = { url: string };

interface StoreHostedImageParams {
	hosting: HostingConfig | null;
	url: string;
	projectId: string;
	label: "source" | "rendered";
}

interface CreateProjectParams {
	item: DesignItem;
	visibility?: "private" | "public";
}

interface Generate3DViewParams {
	sourceImage: string;
	projectId?: string | null;
	style?: string;
}
