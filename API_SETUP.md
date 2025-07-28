# API Setup Guide

## Google Maps API Key Setup

To enable real autocomplete functionality with Google Places API:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Maps JavaScript API
4. Create credentials (API Key)
5. Create a `.env.local` file in the `voyaapp` directory with:
   ```
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

## OpenAI API Key Setup (for activity generation)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get an API key
3. Add to your `.env.local` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Current Status

- ✅ Mock data is working for testing
- ⏳ Real Google Places API requires API key setup
- ⏳ OpenAI integration requires API key setup

The app will work with mock data until you set up the API keys. 