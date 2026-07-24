import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000'; // Note: Not /api for socket connection

export function useRealtimeRefresh(sectionName: string) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Only connect on the client side
    if (typeof window === 'undefined') return;

    const socket: Socket = io(API_BASE_URL);

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
