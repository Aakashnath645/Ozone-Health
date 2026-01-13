import { AirQualityData, WeatherData, PollenData } from "../types";

// Open-Meteo Weather
export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&hourly=uv_index&daily=sunrise,sunset&timezone=auto&forecast_days=1`
    );
    const data = await response.json();
    
    // Calculate current UV from hourly (approximation based on current hour)
    const currentHour = new Date().getHours();
    const currentUV = data.hourly?.uv_index?.[currentHour] || 0;

    return {
      temperature: data.current.temperature_2m,
      uvIndex: currentUV,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day,
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
      hourly: {
        time: data.hourly.time,
        uv_index: data.hourly.uv_index
      }
    };
  } catch (error) {
    console.error("Weather fetch failed:", error);
    throw error;
  }
};

// Open-Meteo Pollen
export const fetchPollenData = async (lat: number, lon: number): Promise<PollenData> => {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`
    );
    const data = await response.json();

    if (!data.current) throw new Error("No pollen data");

    const { alder_pollen, birch_pollen, grass_pollen, mugwort_pollen, olive_pollen, ragweed_pollen } = data.current;
    
    const types = [
      { name: 'Alder', value: alder_pollen || 0 },
      { name: 'Birch', value: birch_pollen || 0 },
      { name: 'Grass', value: grass_pollen || 0 },
      { name: 'Mugwort', value: mugwort_pollen || 0 },
      { name: 'Olive', value: olive_pollen || 0 },
      { name: 'Ragweed', value: ragweed_pollen || 0 },
    ];

    // Find dominant and max
    const max = types.reduce((prev, current) => (prev.value > current.value) ? prev : current);

    return {
      alder: types[0].value,
      birch: types[1].value,
      grass: types[2].value,
      mugwort: types[3].value,
      olive: types[4].value,
      ragweed: types[5].value,
      maxPollen: max.value,
      dominant: max.value > 0 ? max.name : 'None',
    };
  } catch (error) {
    console.warn("Pollen fetch failed, using fallback:", error);
    return {
      alder: 0, birch: 0, grass: 0, mugwort: 0, olive: 0, ragweed: 0, maxPollen: 0, dominant: 'None'
    };
  }
};

// Open-Meteo Air Quality
export const fetchAirQualityData = async (lat: number, lon: number): Promise<AirQualityData> => {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone`
    );
    const data = await response.json();
    
    if (!data.current) {
       throw new Error("Invalid AQ data structure");
    }

    const { us_aqi, pm10, pm2_5, nitrogen_dioxide, ozone } = data.current;

    const pollutants = [
      { name: 'PM2.5', value: pm2_5 ?? 0, limit: 15 },
      { name: 'PM10', value: pm10 ?? 0, limit: 45 },
      { name: 'NO2', value: nitrogen_dioxide ?? 0, limit: 25 },
      { name: 'Ozone', value: ozone ?? 0, limit: 100 },
    ];
    
    const dominant = pollutants.reduce((prev, current) => 
      (prev.value / prev.limit > current.value / current.limit) ? prev : current
    ).name;

    return {
      aqi: us_aqi ?? 0,
      pm25: pm2_5 ?? 0,
      pm10: pm10 ?? 0,
      o3: ozone ?? 0,
      no2: nitrogen_dioxide ?? 0,
      dominant: dominant
    };
  } catch (error) {
    console.error("AQ fetch failed:", error);
     // Fallback mock to ensure app doesn't crash on network error
     return { aqi: 45, pm25: 15, pm10: 28, o3: 55, no2: 12, dominant: 'PM2.5' };
  }
};

// Nominatim (Now with User-Agent)
export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'OzoneHealthApp/1.0 (Student Project)'
        }
      }
    );
    if (!response.ok) throw new Error("Nominatim blocked");
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown Location";
  } catch (error) {
    console.error("Geocoding failed:", error);
    return "Unknown Location";
  }
};

export const searchCity = async (query: string): Promise<{lat: string, lon: string, display_name: string}[]> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        {
          headers: {
            'User-Agent': 'OzoneHealthApp/1.0 (Student Project)'
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Search failed", error);
      return [];
    }
};