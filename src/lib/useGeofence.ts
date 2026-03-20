'use client';
import { useState } from 'react';
import { isWithinCampus } from './geofence';

type GeoStatus = 'idle' | 'checking' | 'allowed' | 'denied' | 'error';

export function useGeofence() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const checkLocation = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setStatus('error');
        setErrorMsg('Geolocation is not supported by your browser.');
        resolve(false);
        return;
      }

      setStatus('checking');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const allowed = isWithinCampus(latitude, longitude);
          setStatus(allowed ? 'allowed' : 'denied');
          if (!allowed) {
            setErrorMsg('You must be on campus to mark attendance.');
          }
          resolve(allowed);
        },
        (err) => {
          setStatus('error');
          setErrorMsg(
            err.code === 1
              ? 'Location permission denied. Please allow location access.'
              : 'Could not get your location. Try again.'
          );
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  return { status, errorMsg, checkLocation };
}