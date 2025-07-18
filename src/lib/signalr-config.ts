export const signalRConfig = {
  // Backend URLs for random selection - different IPs, same port
  backendUrls: ["http://127.0.0.1:5010", "http://127.0.0.2:5010"],

  // Fallback single URL (for backwards compatibility)
  baseUrl: process.env.NEXT_PUBLIC_SIGNALR_URL || "http://localhost:8080",

  // Hub endpoint
  hubPath: "/hubs/cursor",

  // API endpoints
  whoAmIPath: "/api/room/whoami",

  // Connection settings
  maxReconnectAttempts: 5,
  reconnectDelayMs: 1000,

  // Message throttling
  cursorUpdateThrottleMs: 16, // ~60 FPS

  // Logging
  enableLogging: process.env.NODE_ENV === "development",
};

/**
 * Get a random backend URL from the configured list
 */
export const getRandomBackendUrl = (): string => {
  const randomIndex = Math.floor(
    Math.random() * signalRConfig.backendUrls.length
  );
  const selectedUrl = signalRConfig.backendUrls[randomIndex];
  console.log(`🎲 Selected random backend: ${selectedUrl}`);
  return selectedUrl;
};

/**
 * Get a random SignalR hub URL
 */
export const getRandomHubUrl = (): string => {
  return `${getRandomBackendUrl()}${signalRConfig.hubPath}`;
};

/**
 * Get a random whoami API URL
 */
export const getRandomWhoAmIUrl = (): string => {
  return `${getRandomBackendUrl()}${signalRConfig.whoAmIPath}`;
};
