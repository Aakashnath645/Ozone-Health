# Ozone Health Shield

Ozone is a production-grade Progressive Web Application (PWA) designed for real-time environmental health monitoring. It aggregates complex atmospheric data—including air quality, UV radiation, pollen counts, and ambient noise—into a unified, accessible interface to help users make informed decisions about their immediate environment.

## Key Features

*   **Air Quality Lab**: Real-time visualization of AQI, PM2.5, PM10, NO2, and Ozone levels with health risk categorization.
*   **Solar Rhythm**: Live UV Index tracking with dynamic exposure time calculations based on user-selected skin sensitivity.
*   **Bio-Guard**: Comprehensive pollen tracking (Grass, Tree, Weed) to assist with allergy management.
*   **Sonic Sanctuary**: An ambient noise monitor that uses the device microphone to visualize sound levels and categorize environmental stress (Quiet, Moderate, Loud).
*   **AI Health Insights**: Powered by Google Gemini, this feature analyzes current environmental metrics to provide specific, actionable health advice and local news.
*   **Nearby Relief**: AI-driven discovery of nearby green spaces (parks) and medical facilities (clinics) using location grounding.
*   **PWA Capabilities**: Fully installable on iOS and Android devices with offline caching for static assets and a responsive, mobile-first design.

## Technical Architecture

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **Visualization**: Recharts for data plotting, custom canvas/CSS animations for environmental effects.
*   **AI Integration**: Google GenAI SDK (Gemini 2.5/3 series) for generating insights and processing natural language location queries.
*   **Data Sources**:
    *   **Open-Meteo API**: Weather, Air Quality, and Pollen data.
    *   **Nominatim (OpenStreetMap)**: Reverse geocoding and city search.
    *   **Browser APIs**: Geolocation (GPS), AudioContext (Microphone).

## Setup & Configuration

1.  **Environment Variables**:
    The application requires a valid Google GenAI API key to enable AI features.
    *   `API_KEY`: Your Google Cloud API Key.

2.  **Deployment**:
    The project is structured as a standard single-page application (SPA).
    *   Build the project using your preferred bundler (e.g., Vite, Webpack).
    *   Ensure `sw.js` is served from the root to enable Service Worker functionality.
    *   Serve over HTTPS to allow access to Geolocation and Microphone APIs.

## Permissions

To function correctly, the application requests the following permissions:
*   **Location**: For fetching hyper-local environmental data.
*   **Microphone**: For the Sonic Sanctuary noise monitoring feature (data is processed locally in-browser and never recorded).
