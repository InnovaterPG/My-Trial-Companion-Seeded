import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = '/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children, user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);

  // Check push notification support
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setPushSupported(supported);
    
    if (supported) {
      registerServiceWorker();
    }
  }, []);

  // Fetch notifications when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      fetchUnreadCount();
      fetchPreferences();
      checkPushSubscription();
    }
  }, [user?.id]);

  // Register service worker
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration.scope);
      setSwRegistration(registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  };

  // Check if user is already subscribed to push
  const checkPushSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    if (!pushSupported || !user?.id) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Push notification permission denied');
        return false;
      }

      // For demo, use a placeholder VAPID key
      // In production, this should come from environment/backend
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Save subscription to backend
      const res = await fetch(`${API_BASE}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subscription: subscription.toJSON(),
        }),
      });

      if (res.ok) {
        setPushSubscribed(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from backend
        await fetch(`${API_BASE}/notifications/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            endpoint: subscription.endpoint,
          }),
        });
      }
      
      setPushSubscribed(false);
      return true;
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      return false;
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const res = await fetch(`${API_BASE}/notifications/history/${user.id}?limit=20`);
      if (!res.ok) return; // Silently fail for non-critical data
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const res = await fetch(`${API_BASE}/notifications/unread-count/${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Fetch preferences
  const fetchPreferences = async () => {
    if (!user?.id) return;
    
    try {
      const res = await fetch(`${API_BASE}/notifications/preferences/${user.id}`);
      if (!res.ok) {
        // Return default preferences if fetch fails
        setPreferences({
          push_enabled: false,
          email_enabled: true,
          telegram_enabled: false,
          reminder_timing: ['1_day', '1_hour'],
          quiet_hours_start: '22:00',
          quiet_hours_end: '08:00',
        });
        return;
      }
      const data = await res.json();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      // Set default preferences on error
      setPreferences({
        push_enabled: false,
        email_enabled: true,
        telegram_enabled: false,
        reminder_timing: ['1_day', '1_hour'],
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
      });
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API_BASE}/notifications/read/${notificationId}`, {
        method: 'PATCH',
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await fetch(`${API_BASE}/notifications/read-all/${user.id}`, {
        method: 'PATCH',
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Update preferences
  const updatePreferences = async (newPreferences) => {
    if (!user?.id) return;
    
    try {
      await fetch(`${API_BASE}/notifications/preferences/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      });
      
      setPreferences(prev => ({ ...prev, ...newPreferences }));
      return true;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  };

  // Show local notification (for in-app notifications)
  const showLocalNotification = useCallback((title, options = {}) => {
    if (Notification.permission === 'granted' && swRegistration) {
      swRegistration.showNotification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        ...options,
      });
    }
  }, [swRegistration]);

  // Get current permission state
  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'default';

  // Request notification permission
  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return 'denied';
    
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      await subscribeToPush();
    }
    return result;
  };

  const value = {
    notifications,
    unreadCount,
    preferences,
    pushSupported,
    pushSubscribed,
    permission,
    subscribeToPush,
    unsubscribeFromPush,
    requestPermission,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    showLocalNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default NotificationContext;
