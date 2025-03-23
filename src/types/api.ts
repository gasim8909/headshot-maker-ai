// Type definitions for API requests and responses

export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  results?: T;
  tier?: string;
  usedGenerations?: number;
  maxGenerations?: number;
}

export interface GenerateImageRequest {
  imageData: string;
  settings: {
    style: string;
    lighting?: string;
    background?: string;
    sharpness?: string;
    expression?: string;
    headPosition?: string;
    eyeFocus?: string;
  };
}

export interface FeedbackRequest {
  imageId: string;
  rating: number;
  feedback?: string;
}

export interface CheckoutSessionRequest {
  tier: 'premium' | 'professional';
  redirectUrl: string;
}
