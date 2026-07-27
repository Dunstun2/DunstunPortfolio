import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Dynamically determine the backend URL based on environment
const getBackendUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';

  // In production, use the Railway backend URL
  if (window.location.hostname !== 'localhost') {
    return 'https://web-production-f79f9.up.railway.app';
  }

  // In development, use localhost
  return 'http://localhost:5000';
};

export function useRealtimeRefresh(sectionName: string) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Only connect on the client side
    if (typeof window === 'undefined') return;

    const API_BASE_URL = getBackendUrl();
    const socket: Socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('content-updated', (data: { section: string }) => {
      if (data.section === sectionName) {
        setRefreshKey(prev => prev + 1);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [sectionName]);

  return refreshKey;
}
