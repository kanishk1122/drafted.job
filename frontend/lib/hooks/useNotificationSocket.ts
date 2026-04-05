import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { addNotification } from '../redux/slices/notificationSlice';

export const useNotificationSocket = () => {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector((state) => state.auth); // Assuming userId is available in auth state
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Only connect if we have a userId
    if (!userId) return;

    // Use absolute URL for WebSocket
    // In production, this might need to handle wss:// and different domains
    const wsUrl = `ws://localhost:5000/api/v1/notification/ws/${userId}`;
    
    const connect = () => {
       console.log(`[WS] Connecting to ${wsUrl}...`);
       const ws = new WebSocket(wsUrl);
       socketRef.current = ws;

       ws.onopen = () => {
         console.log('[WS] Connected to Notification Engine');
       };

       ws.onmessage = (event) => {
         try {
           const data = JSON.parse(event.data);
           if (data.type === 'new_notification') {
             console.log('[WS] New notification received:', data.payload);
             // 1. Dispatch to Redux for UI updates
             dispatch(addNotification(data.payload));
             
             // 2. Trigger native OS notification
             triggerNativeNotification(data.payload.title, data.payload.message);
           }
         } catch (err) {
           console.error('[WS] Error parsing notification:', err);
         }
       };

       ws.onclose = (event) => {
         console.log('[WS] Disconnected. Reconnecting in 5s...', event.reason);
         // Simple reconnection logic
         setTimeout(connect, 5000);
       };

       ws.onerror = (err) => {
         console.error('[WS] WebSocket Error:', err);
         ws.close();
       };
    };

    // Request System Notification Permission
    const requestPermission = async () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          await Notification.requestPermission();
        }
      }
    };

    const triggerNativeNotification = (title: string, body: string) => {
      // Use Electron Native Notification via IPC Bridge
      if (typeof window !== 'undefined' && (window as any).electron) {
        (window as any).electron.invoke('show-notification', { title, body })
          .catch((err: any) => console.error('[Electron] Notification failed:', err));
      } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        // Fallback to Web API if not in Electron (e.g. browser testing)
        new Notification(title, { body });
      }
    };

    requestPermission();
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userId, dispatch]);

  return socketRef.current;
};
