import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';
import { HeadshotSettings, GeneratedHeadshot } from '../types/gemini';

// Initialize the Gemini API client
let genAI: GoogleGenerativeAI | null = null;

// This should only be used in server-side code (API routes)
export function initGemini(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Missing Gemini API key in environment variables');
    }
    
    genAI = new GoogleGenerativeAI(apiKey);
  }
  
  return genAI;
}

// Get the image generation model
export function getImageGenerationModel(): GenerativeModel {
  const genAI = initGemini();
  
  // Configure for text and image response modalities as required by the API
  // Use type assertion to handle new API property not yet in TypeScript definitions
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: {
      // @ts-ignore - Using newer API feature not yet in type definitions
      responseModalities: ['Text', 'Image']
    } as any
  });
}

// Generate headshot images based on a user photo and prompt settings
export async function generateHeadshot(
  imageBase64: string, 
  promptSettings: HeadshotSettings
): Promise<GeneratedHeadshot> {
  // Determine how many images to generate (default to 1 if not specified)
  const quantity = promptSettings.quantity || 1;
  const model = getImageGenerationModel();
  
  // Get base prompt template and components from environment variables
  const promptTemplate = process.env.GEMINI_PROMPT_TEMPLATE || 
    "Generate {quantity} professional {style} headshot photo{plural} of the person in this image. {face_preservation} Use {lighting} lighting, with {background}. Make the image {sharpness} sharpness with a {expression} expression. Position the head {headPosition} with {eyeFocus} eye focus. {additional_instructions}";
  
  const facePreservation = process.env.GEMINI_FACE_PRESERVATION || 
    "IMPORTANT: Do NOT alter the person's facial features, identity, or appearance in any way. Maintain the exact same face throughout.";
  
  const additionalInstructions = process.env.GEMINI_ADDITIONAL_INSTRUCTIONS || 
    "YOU MUST RETURN {quantity_return} in your response. This is an image generation task.";
  
  // Extract settings
  const { style, lighting, background, sharpness, expression, headPosition, eyeFocus } = promptSettings;
  
  // Handle style-specific customizations from environment variables
  let styleText = style;
  
  // If style is 'custom', use the custom prompt if provided
  if (style === 'custom') {
    if (promptSettings.customStylePrompt) {
      styleText = promptSettings.customStylePrompt;
      console.log("Using custom style prompt:", styleText);
    } else {
      // Fallback to generic custom style
      styleText = "professional, custom-styled";
      console.log("Using fallback for custom style (no prompt provided)");
    }
  } else {
    // For predefined styles, look up the corresponding environment variable
    const styleEnvVar = `GEMINI_STYLE_${style.toUpperCase()}`;
    const styleCustomization = process.env[styleEnvVar];
    
    if (styleCustomization) {
      styleText = styleCustomization;
      console.log(`Using style prompt for ${style} from environment variable`);
    } else {
      console.log(`Warning: No environment variable found for style ${style} (looked for ${styleEnvVar})`);
    }
  }
  
  // Handle plural text
  const plural = quantity > 1 ? 's' : '';
  
  // Define default values for advanced settings
  const DEFAULT_SETTINGS = {
    lighting: 0,
    background: null,
    sharpness: 'medium',
    expression: 'natural',
    headPosition: 'centered',
    eyeFocus: 'direct'
  };
  
  // Handle background text - only include if explicitly set
  let backgroundText = '';
  
  // Add explicit debugging for background setting
  console.log("Background setting received:", background);
  
  if (background === 'custom' && promptSettings.customColor) {
    backgroundText = `a ${promptSettings.customColor} background`;
    console.log("Using custom color background:", promptSettings.customColor);
  } else if (background && background !== null) {
    backgroundText = `a ${background} background`;
    console.log("Using specific background color:", background);
  } else {
    // If background is null (default), don't include it in the prompt
    backgroundText = '';
    console.log("No background specified, excluding from prompt");
  }
  
  // Handle quantity text
  const quantityText = quantity > 1 ? `${quantity} different` : 'a';
  const quantityReturnText = quantity > 1 ? `${quantity} IMAGES` : 'AN IMAGE';
  
  // Check which advanced settings differ from defaults and build conditional parts
  const advancedSettingsParts = [];
  
  // Only include lighting if it's not the default value
  if (lighting.toString() !== DEFAULT_SETTINGS.lighting.toString()) {
    advancedSettingsParts.push(`Use ${lighting} lighting.`);
  }
  
  // Only include background if it's specified
  if (backgroundText) {
    advancedSettingsParts.push(`with ${backgroundText}`);
  }
  
  // Only include sharpness if it's not the default
  if (sharpness !== DEFAULT_SETTINGS.sharpness) {
    advancedSettingsParts.push(`Make the image ${sharpness} sharpness`);
  }
  
  // Only include expression if it's not the default
  if (expression !== DEFAULT_SETTINGS.expression) {
    advancedSettingsParts.push(`with a ${expression} expression`);
  }
  
  // Only include head position if it's not the default
  if (headPosition !== DEFAULT_SETTINGS.headPosition) {
    advancedSettingsParts.push(`Position the head ${headPosition}`);
  }
  
  // Only include eye focus if it's not the default
  if (eyeFocus !== DEFAULT_SETTINGS.eyeFocus) {
    advancedSettingsParts.push(`with ${eyeFocus} eye focus`);
  }
  
  // Join the advanced settings parts with proper punctuation
  const advancedSettingsText = advancedSettingsParts.join('. ');
  
  // Prepare the additional instructions with the correct quantity
  const formattedInstructions = additionalInstructions.replace('{quantity_return}', quantityReturnText);
  
  // Create a base prompt without the advanced settings
  let basePrompt = `Generate ${quantityText} professional ${styleText} headshot photo${plural} of the person in this image. ${facePreservation}`;
  
  // Add advanced settings only if they exist
  if (advancedSettingsText) {
    basePrompt += ` ${advancedSettingsText}.`;
  }
  
  // Add additional instructions
  basePrompt += ` ${formattedInstructions}`;
  
  // Clean up any double spaces
  const promptText = basePrompt.replace(/\s\s+/g, ' ');
  
  // Log replacements for debugging
  console.log("Using prompt approach:", {
    basePrompt: basePrompt.substring(0, 100) + '...',
    advancedSettings: advancedSettingsText ? 'Included' : 'None',
    finalPrompt: promptText.substring(0, 100) + '...'
  });
  
  // Log the final prompt for debugging
  console.log("Final prompt:", promptText);
  
  try {
    console.log("Starting headshot generation with settings:", JSON.stringify(promptSettings));
    
    // Process the input image
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const base64Data = imageBase64.split(',')[1]; // Remove the data:image/xxx;base64, prefix
    
    // Create the content structure directly matching the expected API format
    const contents = [
      { text: promptText },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ];
    
    console.log("Sending request to Gemini API...");
    
    // Send request with structured content
    const response = await model.generateContent(contents);
    const responseData = await response.response;
    
    console.log("Received response from Gemini API");
    
    if (!responseData.candidates || responseData.candidates.length === 0) {
      throw new Error('No response candidates returned from Gemini API');
    }
    
    // Log the response structure for debugging
    console.log("Response structure:", JSON.stringify({
      hasResponseData: !!responseData,
      hasCandidates: !!responseData.candidates,
      candidatesLength: responseData.candidates?.length || 0,
      firstCandidateHasContent: !!responseData.candidates?.[0]?.content,
      contentStructure: responseData.candidates?.[0]?.content ? 
        Object.keys(responseData.candidates[0].content) : 'undefined'
    }));
    
    // Process the response to extract generated images
    const results: GeneratedHeadshot = {
      text: null,
      images: [],
      prompt: promptText // Include the prompt in the response
    };
    
    // Safely get the content from the response
    const contentObj = responseData.candidates[0].content as any;
    console.log("Content object keys:", Object.keys(contentObj));
    
    // Try to find parts through various possible paths in the response structure
    let responseParts: any[] = [];
    
    if (Array.isArray(contentObj.parts)) {
      responseParts = contentObj.parts;
    } else if (contentObj.multimodalContent && Array.isArray(contentObj.multimodalContent.parts)) {
      responseParts = contentObj.multimodalContent.parts;
    }
    
    console.log(`Response contains ${responseParts.length} parts`);
    
    // Process parts if they exist
    if (responseParts.length > 0) {
      // Log part types to debug
      console.log("Response part types:", responseParts.map(part => {
        if (part && typeof part === 'object') {
          if ('text' in part) return 'text';
          if ('inlineData' in part && part.inlineData) return `inlineData (${part.inlineData.mimeType})`;
        }
        return 'unknown';
      }));
      
      for (const part of responseParts) {
        if (part && typeof part === 'object') {
          if ('text' in part && part.text) {
            results.text = part.text;
            console.log("Text response:", part.text.substring(0, 100) + (part.text.length > 100 ? '...' : ''));
          } else if ('inlineData' in part && part.inlineData) {
            console.log(`Found image data (${part.inlineData.mimeType}), size: ${part.inlineData.data.length} chars`);
            results.images.push({
              mimeType: part.inlineData.mimeType,
              data: part.inlineData.data // Base64 encoded image data
            });
          }
        }
      }
    } else {
      // Check for a different response format which might have images directly in content
      if ('text' in contentObj && contentObj.text) {
        results.text = contentObj.text;
        console.log("Text response (direct):", contentObj.text.substring(0, 100) + (contentObj.text.length > 100 ? '...' : ''));
      }
      if ('inlineData' in contentObj && contentObj.inlineData) {
        console.log(`Found image data (direct) (${contentObj.inlineData.mimeType}), size: ${contentObj.inlineData.data.length} chars`);
        results.images.push({
          mimeType: contentObj.inlineData.mimeType,
          data: contentObj.inlineData.data
        });
      }
    }
    
    console.log(`Processing complete. Found ${results.images.length} images and ${results.text ? 'has text' : 'no text'}`);
    
    return results;
  } catch (error: any) {
    console.error("Error generating headshot:", error);
    
    // Check for common API errors and provide more helpful messages
    if (error.status === 403 || (error.message && error.message.includes("permission"))) {
      throw new Error(`API access error: ${error.message || 'Unauthorized to use the Gemini API. Please check your API key and permissions.'}`);
    }
    
    // Model not found error - could be due to experimental model being unavailable
    if (error.message && (
        error.message.includes("model not found") || 
        error.message.includes("gemini-2.0-flash-exp-image-generation")
      )) {
      throw new Error('The image generation model is currently unavailable. This may be a temporary issue with the experimental model.');
    }
    
    // For all other errors, pass through the original error
    throw error;
  }
}
