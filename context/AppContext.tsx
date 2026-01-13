import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, LocationData } from '../types';
import { fetchAirQualityData, fetchWeatherData, fetchPollenData, reverseGeocode } from '../services/api';

interface AppContextType extends AppState {
  setTheme: (theme: 'light' | 'dark') => void;
  setSensitiveMode: (mode: boolean) => void;
  setLocation: (loc: LocationData) => void;
  refreshData: () => void;
}

const defaultState: AppState = {
  location: { lat: 40.7128, lon: -74.0060, city: 'New York' }, // Fallback Default
  weather: null,
  airQuality: null,
  pollen: null,
  loading: true,
  error: null,
  theme: 'light',
  sensitiveMode: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // Initialize Theme
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setState(s => ({ ...s, theme: 'dark' }));
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(state.theme);
  }, [state.theme]);

  // Robust GPS Check
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Successfully got location
          setState(s => ({
            ...s,
            location: {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              city: '' // Empty city triggers reverse geocoding in fetchData
            }
          }));
        },
        (error) => {
          console.warn("GPS Access denied or failed, using default location.", error);
          // Proceed with default New York location without error blocking app
        },
        { 
          enableHighAccuracy: false, // Faster
          timeout: 10000, 
          maximumAge: 60000 
        }
      );
    }
  }, []);

  // Fetch Data
  const fetchData = async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      // 1. Fetch Sensor Data
      const [weather, airQuality, pollen] = await Promise.all([
        fetchWeatherData(state.location.lat, state.location.lon),
        fetchAirQualityData(state.location.lat, state.location.lon),
        fetchPollenData(state.location.lat, state.location.lon),
      ]);

      // 2. Resolve City Name (Separate try/catch so sensors don't fail if map fails)
      let city = state.location.city;
      if (!city || city === 'Unknown Location') {
        try {
          city = await reverseGeocode(state.location.lat, state.location.lon);
        } catch (e) {
          console.warn("Reverse geocode failed", e);
          city = "Unknown Location";
        }
      }

      setState(s => ({
        ...s,
        weather,
        airQuality,
        pollen,
        location: { ...s.location, city },
        loading: false
      }));
    } catch (err) {
      console.error(err);
      setState(s => ({ ...s, error: 'Failed to load data', loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.location.lat, state.location.lon]);

  const setLocation = (loc: LocationData) => setState(s => ({ ...s, location: loc }));
  const setTheme = (theme: 'light' | 'dark') => setState(s => ({ ...s, theme }));
  const setSensitiveMode = (mode: boolean) => setState(s => ({ ...s, sensitiveMode: mode }));

  return (
    <AppContext.Provider value={{ ...state, setTheme, setSensitiveMode, setLocation, refreshData: fetchData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};