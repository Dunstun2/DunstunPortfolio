import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from './urls';

// Global socket instance - reuse across all components to prevent connection leaks
// Attach to window in development to survive Fast Refresh (HMR) module reloads
let globalSocket: Socket | null = null;
if (typeof window !== 'undefined') {
  globalSocket = (window as any).__globalSocket || null;
}
const socketListeners = new Map<string, Set<() => void>>();

function getOrCreateSocket(): Socket {
  // Check if socket already exists (regardless of connection state)
  if (globalSocket) {
    // console.log('[useRealtimeRefresh] Reusing existing socket:', globalSocket?.id, 'Status:', globalSocket?.connected);
    return globalSocket;
  }

  console.log('[useRealtimeRefresh] Creating NEW global socket');
  const API_BASE_URL = WS_URL;
  globalSocket = io(API_BASE_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  if (typeof window !== 'undefined') {
    (window as any).__globalSocket = globalSocket;
  }

  globalSocket.on('connect', () => {
    console.log('[useRealtimeRefresh] Socket connected:', globalSocket?.id);
  });

  globalSocket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  globalSocket.on('content-updated', (data: { section: string }) => {
    const listeners = socketListeners.get(data.section);
    if (listeners) {
      listeners.forEach(listener => listener());
    }
  });

  return globalSocket;
}

export function useRealtimeRefresh(sectionName: string, shouldSkip: boolean = false) {
  const [refreshKey, setRefreshKey] = useState(0);
  const listenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Only connect on the client side
    if (typeof window === 'undefined') return;

    // Skip real-time refresh if requested (e.g., while user is editing)
    if (shouldSkip) return;

    // Get or create the global socket
    const socket = getOrCreateSocket();

    // Create listener for this section
    const listener = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Register listener
    if (!socketListeners.has(sectionName)) {
      socketListeners.set(sectionName, new Set());
    }
    socketListeners.get(sectionName)!.add(listener);
    listenerRef.current = listener;

    return () => {
      // Unregister listener when component unmounts
      const listeners = socketListeners.get(sectionName);
      if (listeners && listenerRef.current) {
        listeners.delete(listenerRef.current);
        // If no more listeners for this section, remove it
        if (listeners.size === 0) {
          socketListeners.delete(sectionName);
        }
      }
    };
  }, [sectionName, shouldSkip]);

  return refreshKey;
}
