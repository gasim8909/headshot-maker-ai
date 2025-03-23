import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import supabase from '../../../../../src/lib/supabase';
import { ApiResponse, CheckoutSessionRequest } from '../../../types/api';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Define price IDs (these would be created in your Stripe dashboard)
const PRICE_IDS: {
  [key: string]: {
    [key: string]: string | undefined;
  };
} = {
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID
  },
  professional: {
    monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
    yearly: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID
  }
};

interface CheckoutRequestBody extends CheckoutSessionRequest {
  userId: string;
  billingCycle: 'monthly' | 'yearly';
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json() as CheckoutRequestBody;
    const { tier, billingCycle, userId } = body;
    
    if (!tier || !billingCycle || !userId) {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: 'Missing required parameters' 
      }, { status: 400 });
    }
    
    // Verify the user matches the session
    if (userId !== session.user.id) {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: 'User ID mismatch' 
      }, { status: 403 });
    }
    
    // Get the appropriate price ID
    const priceId = PRICE_IDS[tier]?.[billingCycle];
    
    if (!priceId) {
      return NextResponse.json<ApiResponse>({ 
        success: false,
        error: 'Invalid subscription tier or billing cycle' 
      }, { status: 400 });
    }
    
    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', userId)
      .single();
    
    let stripeCustomerId = existingSubscription?.stripe_customer_id;
    
    // If user doesn't have a Stripe customer ID, create one
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email as string,
        metadata: {
          userId: userId
        }
      });
      
      stripeCustomerId = customer.id;
    }
    
    // Create a checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        tier: tier,
        billingCycle: billingCycle
      }
    });
    
    return NextResponse.json({
      success: true,
      url: checkoutSession.url
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json<ApiResponse>({ 
      success: false,
      error: 'Failed to create checkout session',
      message: error.message 
    }, { status: 500 });
  }
}
