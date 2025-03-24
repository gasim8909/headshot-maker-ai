import { NextRequest, NextResponse } from 'next/server';
import { generateHeadshot } from '../../../lib/gemini';
import supabase from '../../../lib/supabase';
import { ApiResponse, GenerateImageRequest } from '../../../types/api';
import { GeneratedHeadshot } from '../../../types/gemini';
import { UserSubscription } from '../../../types/supabase';
import { getFeatureAccess, SubscriptionTier } from '../../../utils/featureAccess';

// Load tier limits from environment variables
const GUEST_MAX_GENERATIONS = parseInt(process.env.NEXT_PUBLIC_GUEST_TIER_LIMIT || '2');
const FREE_MAX_GENERATIONS = parseInt(process.env.NEXT_PUBLIC_FREE_TIER_LIMIT || '5');
const PREMIUM_MAX_GENERATIONS = parseInt(process.env.NEXT_PUBLIC_PREMIUM_TIER_LIMIT || '30');

export async function POST(request: NextRequest) {
  try {
    // Get user session to check authentication and limits
    const { data: { session } } = await supabase.auth.getSession();
    
    let tier = 'free';
    let usedGenerations = 0;
    let maxGenerations = 5;
    let userId = null;
    let guestId = '';
    
    if (session) {
      // User is logged in
      userId = session.user.id;
      
      // Check user's subscription and remaining generations
      const { data: userSubscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
    
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subscriptionError);
        return NextResponse.json<ApiResponse>({ 
          success: false,
          error: 'Failed to check subscription' 
        }, { status: 500 });
      }
      
      // Default to free tier if no subscription found
      const subscription = userSubscription as UserSubscription | null;
      tier = subscription?.tier || 'free';
      usedGenerations = subscription?.used_generations || 0;
      maxGenerations = 
        tier === 'professional' ? Infinity :
        tier === 'premium' ? PREMIUM_MAX_GENERATIONS :
        FREE_MAX_GENERATIONS;
    } else {
      // User is in Guest Mode
      tier = 'guest';
      maxGenerations = GUEST_MAX_GENERATIONS;
      
      // Get guest cookie to track usage
      const guestIdCookie = request.cookies.get('guest_id');
      guestId = guestIdCookie?.value || crypto.randomUUID();
      
      // Get previous guest usage from cookie
      const guestUsageCookie = request.cookies.get('guest_usage');
      const guestUsageStr = guestUsageCookie?.value || '0';
      usedGenerations = parseInt(guestUsageStr, 10);
    }
    
    if (usedGenerations >= maxGenerations && tier !== 'professional') {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: 'Generation limit reached',
        tier,
        usedGenerations,
        maxGenerations
      }, { status: 403 });
    }
    
    // Parse the request body
    const body = await request.json() as GenerateImageRequest;
    const { imageData, settings } = body;
    
    if (!imageData || !settings) {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: 'Missing required parameters' 
      }, { status: 400 });
    }
    
    // Validate feature access based on subscription tier
    const tierAsSubscriptionType = tier as SubscriptionTier;
    const featureAccess = getFeatureAccess(tierAsSubscriptionType);
    
    // Log the settings for debugging
    console.log("API route: Received generation settings:", JSON.stringify({
      tier: tierAsSubscriptionType,
      style: settings.style,
      quantity: settings.quantity,
      allowedStyles: featureAccess.allowedStyles,
      maxQuantity: featureAccess.maxQuantity,
      hasCustomStyleAccess: featureAccess.hasCustomStyleAccess
    }));
    
    // Default quantity if not specified
    const requestedQuantity = settings.quantity || 4;
    
    // Use a safe default style if not provided or invalid
    const requestedStyle = settings.style || 'corporate';
    
    // For security, validate the style is actually a string
    if (typeof requestedStyle !== 'string') {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: `Invalid style format.` 
      }, { status: 400 });
    }
    
    // If it's a custom style prompt, validate it's not too long
    if (requestedStyle === 'custom' && settings.customStylePrompt) {
      if (typeof settings.customStylePrompt !== 'string') {
        return NextResponse.json<ApiResponse>({ 
          success: false,
          error: `Invalid custom style format.` 
        }, { status: 400 });
      }
      
      if (settings.customStylePrompt.length > 500) {
        return NextResponse.json<ApiResponse>({ 
          success: false,
          error: `Custom style prompt too long. Maximum 500 characters allowed.` 
        }, { status: 400 });
      }
      
      console.log("Custom style prompt:", settings.customStylePrompt);
    }
    
    // Log received style and check if it's allowed (ignore case for better user experience)
    const normalizedRequestedStyle = requestedStyle === 'custom' && settings.customStylePrompt 
      ? 'custom' 
      : requestedStyle.toLowerCase();
    const normalizedAllowedStyles = featureAccess.allowedStyles.map(s => s.toLowerCase());
    
    console.log("API CHECK - Requested Style:", normalizedRequestedStyle);
    console.log("API CHECK - Tier:", tierAsSubscriptionType);
    console.log("API CHECK - Allowed Styles:", normalizedAllowedStyles);
    console.log("API CHECK - Has Custom Style Access:", featureAccess.hasCustomStyleAccess);
    
    // Apply permission checks based on environment variables for all tiers
    if (normalizedRequestedStyle !== 'custom' && !normalizedAllowedStyles.includes(normalizedRequestedStyle)) {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: `The selected style '${requestedStyle}' is not available on your ${tierAsSubscriptionType} plan. Available styles: ${featureAccess.allowedStyles.join(', ')}` 
      }, { status: 403 });
    }
    
    // Check if custom style is allowed
    if (normalizedRequestedStyle === 'custom' && !featureAccess.hasCustomStyleAccess) {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: `Custom styles are only available for Premium and Professional plans. Current plan: ${tierAsSubscriptionType}` 
      }, { status: 403 });
    }
    
    // Check if requested quantity is allowed and is a valid number
    if (typeof requestedQuantity !== 'number' || requestedQuantity < 1) {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: `Invalid quantity. Please specify a positive number.` 
      }, { status: 400 });
    }
    
    if (requestedQuantity > featureAccess.maxQuantity) {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: `Your ${tierAsSubscriptionType} plan allows generating up to ${featureAccess.maxQuantity} images at once. You requested ${requestedQuantity}.` 
      }, { status: 403 });
    }
    
    // Check advanced settings access
    if (featureAccess.hasAdvancedSettings === false) {
      // If advanced settings are not allowed, reset all advanced settings to defaults
      settings.lighting = 0;
      settings.background = null;
      settings.customColor = undefined;
      settings.sharpness = 'medium';
      settings.expression = 'natural';
      settings.headPosition = 'centered';
      settings.eyeFocus = 'direct';
    } else if (featureAccess.hasAdvancedSettings === 'limited' && featureAccess.allowedAdvancedSettings) {
      // For limited access, only keep allowed settings and reset others to defaults
      if (!featureAccess.allowedAdvancedSettings.includes('lighting')) settings.lighting = 0;
      if (!featureAccess.allowedAdvancedSettings.includes('background')) {
        settings.background = null;
        settings.customColor = undefined;
      }
      if (!featureAccess.allowedAdvancedSettings.includes('sharpness')) settings.sharpness = 'medium';
      if (!featureAccess.allowedAdvancedSettings.includes('expression')) settings.expression = 'natural';
      if (!featureAccess.allowedAdvancedSettings.includes('headPosition')) settings.headPosition = 'centered';
      if (!featureAccess.allowedAdvancedSettings.includes('eyeFocus')) settings.eyeFocus = 'direct';
    }
    
    // Generate the headshot using the Gemini API
    console.log("API route: Starting image generation", { 
      tier: tierAsSubscriptionType, 
      requestedQuantity, 
      requestedStyle,
      hasCustomStylePrompt: !!settings.customStylePrompt
    });
    
    // Prepare headshot settings based on the requested style
    const headshotSettings: any = {
      quantity: requestedQuantity,
      // Convert lighting from number to string if needed
      lighting: typeof settings.lighting === 'number' 
        ? settings.lighting.toString() 
        : (settings.lighting || 'soft'),
      // Explicitly ensure background is null (AI suggested) when not specified
      background: settings.background === undefined ? null : settings.background,
      customColor: settings.customColor,
      sharpness: settings.sharpness || 'medium',
      expression: settings.expression || 'natural',
      headPosition: settings.headPosition || 'centered',
      eyeFocus: settings.eyeFocus || 'direct'
    };
    
    // Handle custom styles differently
    if (normalizedRequestedStyle === 'custom' && settings.customStylePrompt && featureAccess.hasCustomStyleAccess) {
      headshotSettings.style = 'custom';  // Mark as custom style
      headshotSettings.customStylePrompt = settings.customStylePrompt;  // Pass the actual prompt
      console.log("Using custom style prompt:", settings.customStylePrompt);
    } else {
      headshotSettings.style = requestedStyle;  // Use the selected style
    }
    
    // Log the final settings being sent to Gemini
    console.log("Final headshot settings:", JSON.stringify(headshotSettings, null, 2));
    
    const result = await generateHeadshot(imageData, headshotSettings);
    
    console.log("API route: Generation complete", {
      hasText: !!result.text,
      imageCount: result.images.length,
      firstImageSize: result.images[0]?.data?.length || 0
    });
    
    // Update the user's generation count
    if (session && tier !== 'professional') {
      // Update in Supabase for logged-in users
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          tier,
          used_generations: usedGenerations + 1
        });
      
      if (updateError) {
        console.error('Error updating generation count:', updateError);
      }
    }
    
    // Create response
    const response = NextResponse.json<ApiResponse<GeneratedHeadshot>>({
      success: true,
      results: result,
      tier,
      usedGenerations: usedGenerations + 1,
      maxGenerations
    });
    
    // Update cookies for guest users
    if (!session) {
      // Set guest ID cookie
      response.cookies.set({
        name: 'guest_id',
        value: guestId,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'strict'
      });
      
      // Set updated usage cookie
      response.cookies.set({
        name: 'guest_usage',
        value: (usedGenerations + 1).toString(),
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'strict'
      });
    }
    
    return response;
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json<ApiResponse>({ 
      success: false,
      error: 'Failed to generate headshot',
      message: error.message 
    }, { status: 500 });
  }
}
