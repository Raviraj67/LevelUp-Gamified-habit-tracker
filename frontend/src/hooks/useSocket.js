import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Isolated hook for Socket.io connection and real-time event listening.
 * Keeps socket initialization clean and reusable across components.
 */
export const useSocket = (eventName, callback) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socketRef.current = socket;

    // Attach event listener if provided
    if (eventName && callback) {
      socket.on(eventName, callback);
    }

    // Cleanup on unmount
    return () => {
      if (eventName && callback) {
        socket.off(eventName, callback);
      }
      socket.disconnect();
    };
  }, [eventName, callback]);

  return socketRef.current;
};

export default useSocket;
