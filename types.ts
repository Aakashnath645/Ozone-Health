export interface WeatherData {
  temperature: number;
  uvIndex: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: number;
  sunrise: string;
  sunset: string;
  hourly: {
    time: string[];
    uv_index: number[];
  }
}

export interface AirQualityData {
  aqi: number; // Normalized 0-100 or 0-500 scale
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  dominant: string;
}

export interface PollenData {
  alder: number;
  birch: number;
  grass: number;
  mugwort: number;
  olive: number;
  ragweed: number;
  maxPollen: number;
  dominant: string;
}

export interface LocationData {
  lat: number;
  lon: number;
  city: string;
  display_name?: string;
}

export interface AppState {
  location: LocationData;
  weather: WeatherData | null;
  airQuality: AirQualityData | null;
  pollen: PollenData | null;
  loading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  sensitiveMode: boolean;
}

export enum HealthRisk {
  SAFE = 'Safe',
  CAUTION = 'Caution',
  DANGER = 'Danger',
  EXTREME = 'Extreme',
}