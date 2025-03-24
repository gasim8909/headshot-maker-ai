# Headshot Maker AI

Headshot Maker AI is a web application that transforms casual photos into professional-quality headshots using artificial intelligence. It allows users to generate studio-quality professional headshots in minutes, perfect for LinkedIn profiles, resumes, and corporate portfolios.

## Features

- **AI-Powered Image Generation**: Transform casual photos into professional headshots using Google's Gemini AI.
- **Customizable Styles**: Choose from multiple headshot styles (Corporate, Creative, Casual, Executive, etc.).
- **Advanced Customization**: Adjust lighting, background, sharpness, expression, head position, and eye focus.
- **Multi-Image Generation**: Generate multiple headshot variations at once to find the perfect look.
- **User Authentication**: Secure signup, login, and account management.
- **Subscription Tiers**: 
  - Free: 5 headshot generations
  - Premium: 30 headshot generations
  - Professional: Unlimited generations
- **User Dashboard**: Track usage and manage generated headshots.
- **Payment Processing**: Secure payment handling with Stripe.
- **Feedback System**: Provide feedback on generated images to improve results.

## Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: UI component library
- **TailwindCSS 4**: Utility-first CSS framework for styling

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Supabase**: Authentication and database management
- **Google Generative AI (Gemini)**: AI model for headshot generation
- **Stripe**: Payment processing for subscriptions

## Project Structure

```
headshot-maker-ai/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   │   ├── create-checkout-session/  # Stripe checkout API
│   │   │   ├── feedback/                # User feedback API
│   │   │   └── generate/                # Headshot generation API
│   │   ├── account/         # User account page
│   │   ├── create/          # Headshot creation page
│   │   ├── dashboard/       # User dashboard
│   │   ├── forgot-password/ # Password recovery
│   │   ├── login/           # User login
│   │   ├── pricing/         # Subscription plans
│   │   ├── reset-password/  # Password reset
│   │   ├── signup/          # New user registration
│   │   └── signup-success/  # Registration confirmation
│   ├── components/          # Reusable React components
│   │   ├── Auth/            # Authentication components
│   │   ├── AdvancedSettings.tsx  # Headshot customization options
│   │   ├── PreviewSection.tsx    # Image preview component
│   │   ├── StyleSelection.tsx    # Headshot style selector
│   │   └── UploadSection.tsx     # Image upload component
│   ├── lib/                 # Utility libraries
│   │   ├── gemini.tsx       # Google Gemini AI integration
│   │   └── supabase.tsx     # Supabase client configuration
│   ├── types/               # TypeScript type definitions
│   │   ├── api.ts           # API-related types
│   │   ├── gemini.ts        # Gemini-related types
│   │   └── supabase.ts      # Supabase-related types
│   └── utils/               # Utility functions
│       └── apiClient.ts     # API request utilities
├── .gitignore               # Git ignore file
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies
├── postcss.config.mjs       # PostCSS configuration
├── setup-env.js             # Environment setup script
└── tsconfig.json            # TypeScript configuration
```

## Installation

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account
- Google Generative AI API key (Gemini)
- Stripe account (for payment processing)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd headshot-maker-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following environment variables:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Gemini
   GEMINI_API_KEY=your_gemini_api_key
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Prompt Templates (Optional)
   GEMINI_PROMPT_TEMPLATE="Generate {quantity} professional {style} headshot photo{plural} of the person in this image. {face_preservation} Use {lighting} lighting, with {background}. Make the image {sharpness} sharpness with a {expression} expression. Position the head {headPosition} with {eyeFocus} eye focus. {additional_instructions}"
   GEMINI_FACE_PRESERVATION="IMPORTANT: Do NOT alter the person's facial features, identity, or appearance in any way. Maintain the exact same face throughout."
   GEMINI_ADDITIONAL_INSTRUCTIONS="YOU MUST RETURN {quantity_return} in your response. This is an image generation task."
   
   # Style-specific prompts (Optional - customize by style)
   GEMINI_STYLE_CORPORATE="elegant and polished corporate"
   GEMINI_STYLE_BUSINESS="professional business"
   # Add more custom style prompts as needed
   ```

4. Set up the Supabase tables as needed for user management and subscriptions.

5. Verify environment setup:
   ```bash
   npm run verify-env
   ```

## Development

Start the development server with TurboRepack:

```bash
npm run dev:env
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Usage

### Generating Headshots

1. Create an account or log in.
2. Navigate to the "Create" page.
3. Upload a photo of yourself (face clearly visible).
4. Select your preferred headshot style.
5. Adjust advanced settings if desired.
6. Choose the number of variations to generate.
7. Click "Generate Headshots".
8. Download or save your favorite results.

### Subscription Management

1. Navigate to the "Pricing" page.
2. Select a subscription plan.
3. Complete the checkout process.
4. Access your new generation limits immediately.

## Deployment

This Next.js application can be deployed to various platforms:

### Vercel (Recommended)

1. Connect your repository to Vercel.
2. Configure environment variables in the Vercel dashboard.
3. Deploy.

### Other Platforms

Follow the standard Next.js deployment instructions for your preferred hosting platform (Netlify, AWS, etc.).

## License

[Specify your license here]

---

Created with ❤️ using Next.js, Supabase, and Google Gemini AI
