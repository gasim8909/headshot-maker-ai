// Type definitions for Gemini AI related data

export interface HeadshotSettings {
  style: string;
  lighting: string;
  background: string;
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
