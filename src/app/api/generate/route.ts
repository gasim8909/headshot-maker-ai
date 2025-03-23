import { NextRequest, NextResponse } from 'next/server';
import { generateHeadshot } from '../../../../../src/lib/gemini';
import supabase from '../../../../../src/lib/supabase';
import { ApiResponse, GenerateImageRequest } from '../../../types/api';
import { GeneratedHeadshot } from '../../../types/gemini';
import { UserSubscription } from '../../../types/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get user session to check authentication and limits
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json<ApiResponse>({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // Get the user's ID
    const userId = session.user.id;
    
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
    const tier = subscription?.tier || 'free';
    const usedGenerations = subscription?.used_generations || 0;
    const maxGenerations = 
      tier === 'professional' ? Infinity :
      tier === 'premium' ? 30 :
      5; // Free tier
    
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
    
    // Generate the headshot using the Gemini API
    const result = await generateHeadshot(imageData, {
      style: settings.style,
      lighting: settings.lighting || 'soft',
      background: settings.background || 'white',
      sharpness: settings.sharpness || 'medium',
      expression: settings.expression || 'natural',
      headPosition: settings.headPosition || 'centered',
      eyeFocus: settings.eyeFocus || 'direct'
    });
    
    // Update the user's generation count in Supabase
    if (tier !== 'professional') {
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
    
    // Return the result to the client
    return NextResponse.json<ApiResponse<GeneratedHeadshot>>({
      success: true,
      results: result,
      tier,
      usedGenerations: usedGenerations + 1,
      maxGenerations
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json<ApiResponse>({ 
      success: false,
      error: 'Failed to generate headshot',
      message: error.message 
    }, { status: 500 });
  }
}
