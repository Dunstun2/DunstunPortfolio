import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from './urls';

export function useRealtimeRefresh(sectionName: string, shouldSkip: boolean = false) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Only connect on the client side
    if (typeof window === 'undefined') return;

    // Skip real-time refresh if requested (e.g., while user is editing)
    if (shouldSkip) return;

    const API_BASE_URL = WS_URL;
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
  }, [sectionName, shouldSkip]);

  return refreshKey;
}
