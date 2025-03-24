// Type definitions for Gemini AI related data

export interface HeadshotSettings {
  style: string;
  quantity?: number;
  lighting: number | string;
  background: string | null;
  customColor?: string;
  customStylePrompt?: string;  // For custom style prompts
  sharpness: string;
  expression: string;
  headPosition: string;
  eyeFocus: string;
}

export interface GeneratedImageData {
  mimeType: string;
  data: string;
}

export interface GeneratedHeadshot {
  text: string | null;
  images: GeneratedImageData[];
  prompt?: string; // The prompt used to generate the images
}

export interface GeminiContent {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiResponsePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiResponse {
  response: {
    candidates: Array<{
      content: {
        parts: GeminiResponsePart[];
      };
    }>;
  };
}
