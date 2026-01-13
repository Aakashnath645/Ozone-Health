import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  // Robust Fetch Data Function
  const fetchData = useCallback(async (targetLoc: LocationData, isBackground = false) => {
    // Only show full loading screen for user-initiated or initial loads
    if (!isBackground) {
      setState(s => ({ ...s, loading: true, error: null }));
    }

    try {
      // 1. Fetch Sensor Data
      const [weather, airQuality, pollen] = await Promise.all([
        fetchWeatherData(targetLoc.lat, targetLoc.lon),
        fetchAirQualityData(targetLoc.lat, targetLoc.lon),
        fetchPollenData(targetLoc.lat, targetLoc.lon),
      ]);

      // 2. Resolve City Name
      let city = targetLoc.city;
      if (!city || city === 'Unknown Location') {
        try {
          city = await reverseGeocode(targetLoc.lat, targetLoc.lon);
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
        location: { ...targetLoc, city },
        loading: false
      }));
    } catch (err) {
      console.error(err);
      setState(s => ({ ...s, error: 'Failed to load data', loading: false }));
    }
  }, []);

  // 1. GPS Watcher (Real-time Location)
  useEffect(() => {
    let watchId: number;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLon = position.coords.longitude;

          setState(prev => {
             // Calculate approximate distance to prevent API spam (Threshold ~500m / 0.005 deg)
             const latDiff = Math.abs(newLat - prev.location.lat);
             const lonDiff = Math.abs(newLon - prev.location.lon);
             const isDefault = prev.location.city === 'New York' && prev.location.lat === 40.7128;
             const significantMove = latDiff > 0.005 || lonDiff > 0.005;

             // Update state only if moved significantly or if we are still on default location
             if (isDefault || significantMove) {
               return {
                 ...prev,
                 location: {
                   lat: newLat,
                   lon: newLon,
                   city: '' // Empty city triggers re-resolution in fetchData
                 }
               };
             }
             return prev;
          });
        },
        (error) => {
          console.warn("GPS Watch error:", error);
        },
        { 
          enableHighAccuracy: true,
          timeout: 20000, 
          maximumAge: 0 
        }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 2. Trigger Fetch on Location Change (Coordinates updated by Watcher or Manual Search)
  useEffect(() => {
    // Determine if this is likely a background update (e.g. small GPS drift) or major change
    // For simplicity, coordinate changes always trigger non-background fetch to update UI immediately
    fetchData(state.location, false);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.location.lat, state.location.lon]);

  // 3. Periodic Background Refresh (Every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(state.location, true); // Silent update
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [state.location, fetchData]);

  const setLocation = (loc: LocationData) => setState(s => ({ ...s, location: loc }));
  const setTheme = (theme: 'light' | 'dark') => setState(s => ({ ...s, theme }));
  const setSensitiveMode = (mode: boolean) => setState(s => ({ ...s, sensitiveMode: mode }));

  return (
    <AppContext.Provider value={{ ...state, setTheme, setSensitiveMode, setLocation, refreshData: () => fetchData(state.location, false) }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};