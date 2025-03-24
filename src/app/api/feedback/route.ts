import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../src/lib/supabase';
import { ApiResponse, FeedbackRequest } from '../../../types/api';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get the user's ID or use "guest" for non-authenticated users
    const userId = session ? session.user.id : 'guest';
    
    // Parse the request body
    const body = await request.json() as FeedbackRequest;
    const { imageId, rating, feedback } = body;
    
    if (imageId === undefined || rating === undefined) {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: 'Missing required parameters' 
      }, { status: 400 });
    }
    
    // Save feedback to Supabase
    const { error } = await supabase
      .from('feedback')
      .insert({
        user_id: userId,
        image_id: imageId,
        rating,
        feedback_text: feedback || null,
        is_guest: !session
      });
    
    if (error) {
      console.error('Error saving feedback:', error);
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: 'Failed to save feedback' 
      }, { status: 500 });
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error: any) {
    console.error('Feedback error:', error);
    return NextResponse.json<ApiResponse>({ 
      success: false,
      error: 'Failed to process feedback',
      message: error.message 
    }, { status: 500 });
  }
}
