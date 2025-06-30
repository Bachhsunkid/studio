export const signalRConfig = {
  // Backend SignalR hub URL
  baseUrl: process.env.NEXT_PUBLIC_SIGNALR_URL || 'http://localhost:8080',
  
  // Hub endpoint
  hubPath: '/hubs/cursor',
  
  // Connection settings
  maxReconnectAttempts: 5,
  reconnectDelayMs: 1000,
  
  // Message throttling
  cursorUpdateThrottleMs: 16, // ~60 FPS
  
  // Logging
  enableLogging: process.env.NODE_ENV === 'development',
};
