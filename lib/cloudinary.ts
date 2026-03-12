import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME_2,
	api_key: process.env.CLOUDINARY_API_KEY_2,
	api_secret: process.env.CLOUDINARY_API_SECRET_2,
	secure: true,
});

export async function uploadImage(
	fileBase64: string,
	folder: string,
): Promise<CloudinaryUploadResult> {
	const result = await cloudinary.uploader.upload(fileBase64, {
		folder,
		resource_type: "image",
		transformation: [{ quality: "auto", fetch_format: "auto" }],
	});

	return {
		secure_url: result.secure_url,
		public_id: result.public_id,
		format: result.format,
		width: result.width,
		height: result.height,
		bytes: result.bytes,
	};
}

export async function deleteImage(publicId: string): Promise<void> {
	await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(
	publicId: string,
	options?: { width?: number; height?: number; quality?: string },
): string {
	return cloudinary.url(publicId, {
		transformation: [
			{
				width: options?.width,
				height: options?.height,
				crop: "limit",
				quality: options?.quality ?? "auto",
				fetch_format: "auto",
			},
		],
		secure: true,
	});
}

export { cloudinary };
