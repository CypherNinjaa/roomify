import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";
import { ROOMIFY_RENDER_PROMPT, STYLE_PROMPTS } from "./constants";

const genAI = new GoogleGenAI({ apiKey: process.env.geminiapi ?? "" });

export async function generate3DView({
	sourceImageBase64,
	mimeType,
	style = "modern",
}: {
	sourceImageBase64: string;
	mimeType: string;
	style?: string;
}): Promise<{ renderedImage: string } | null> {
	try {
		const styleOverride = STYLE_PROMPTS[style] ?? STYLE_PROMPTS["modern"] ?? "";
		const prompt = ROOMIFY_RENDER_PROMPT.replace(
			"{STYLE_OVERRIDE}",
			styleOverride,
		);

		const config: GenerateContentConfig = {
			responseModalities: ["image", "text"] as unknown as string[],
		};

		const response = await genAI.models.generateContent({
			model: "gemini-2.5-flash-image",
			contents: [
				{
					role: "user",
					parts: [
						{
							inlineData: {
								mimeType,
								data: sourceImageBase64,
							},
						},
						{ text: prompt },
					],
				},
			],
			config,
		});

		const parts = response.candidates?.[0]?.content?.parts;
		if (!parts) return null;

		for (const part of parts) {
			if (part.inlineData) {
				const outMime = part.inlineData.mimeType ?? "image/png";
				const renderedImage = `data:${outMime};base64,${part.inlineData.data}`;
				return { renderedImage };
			}
		}

		return null;
	} catch (error) {
		console.error("AI generation failed:", error);
		return null;
	}
}
