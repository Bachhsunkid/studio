# Random Backend Connection Documentation

## Overview

The frontend now randomly connects to backend servers on different IP addresses (127.0.0.1:5010 and 127.0.0.2:5010) using the same port for both SignalR connections and API calls (like whoami).

## How it Works

### 1. Configuration (`src/lib/signalr-config.ts`)

```typescript
export const signalRConfig = {
  // Backend URLs for random selection - different IPs, same port
  backendUrls: [
    'http://127.0.0.1:5010',
    'http://127.0.0.2:5010'
  ],
  // ... other config
};

// Utility functions
export const getRandomBackendUrl = (): string => {
  // Returns a random backend URL
};

export const getRandomHubUrl = (): string => {
  // Returns random backend + hub path
};

export const getRandomWhoAmIUrl = (): string => {
  // Returns random backend + whoami path
};
```

### 2. Updated API Response

The whoami API now returns additional domain information:

```json
{
  "instance": "server-01",
  "time": "2024-01-01T12:00:00.000Z",
  "domain": "http://127.0.0.1:5010"
}
```

### 3. SignalR Service (`src/lib/signalr.ts`)

- **Random Hub Selection**: Automatically connects to a random SignalR hub on initialization
- **Server Switching**: `switchToRandomServer()` method to connect to a different server
- **Current Server Info**: Methods to get current hub URL and server URL

```typescript
const signalRService = getSignalRService();

// Get current hub URL
const hubUrl = signalRService.getCurrentHubUrl();

// Switch to a different random server
await signalRService.switchToRandomServer();
```

### 4. Server Info Hook (`src/hooks/use-server-info.ts`)

- **Random API Calls**: Each whoami API call goes to a random backend
- **Enhanced Response**: Now handles the `domain` field from the API
- **Real-time Updates**: Shows which server instance and domain is currently responding

### 5. UI Components

#### Floating ServerInfo Component
- Global floating button in top-right corner
- Shows current server instance, domain, SignalR hub, and available backends
- **Switch Button**: Manually switch to a different random server
- **Refresh Button**: Get new server info (may hit different backend)

#### Features:
- **Instance**: Shows which backend instance responded to whoami API
- **Domain**: Shows the full domain/URL that responded to the API call
- **SignalR Hub**: Shows current SignalR connection URL
- **Available Backends**: Lists all configured backend URLs (127.0.0.1:5010, 127.0.0.2:5010)
- **Switch**: Reconnects SignalR to a different random server
- **Refresh**: Calls whoami API on a random server

## Usage

### Automatic Random Selection
- **SignalR**: Randomly selects a hub on connection
- **API Calls**: Each whoami call goes to a random backend

### Manual Server Switching
1. Click the floating server icon (🖥️) in top-right corner
2. Click "Switch" button to change SignalR server
3. Click "Refresh" to get info from potentially different API server

### Environment Setup

Make sure both backend servers are running on different IPs:
```bash
# Terminal 1 - First backend server
dotnet run --urls=http://127.0.0.1:5010

# Terminal 2 - Second backend server  
dotnet run --urls=http://127.0.0.2:5010
```

Note: You may need to configure your system to recognize 127.0.0.2:
- **Windows**: Usually works by default
- **Linux/Mac**: May need to add `127.0.0.2 localhost` to `/etc/hosts`

## Expected Behavior

1. **On Page Load**: 
   - SignalR connects to random hub (127.0.0.1:5010 or 127.0.0.2:5010)
   - Server info may come from either backend

2. **On Refresh**: 
   - whoami API call goes to random backend
   - May show different instance and domain than SignalR connection

3. **On Switch**: 
   - SignalR disconnects and reconnects to different server
   - New server info is fetched

## Verification

- Check browser console for logs showing selected URLs
- Server info component shows which servers are being used
- Different refreshes may show different instance/domain values
- Switch button changes SignalR hub URL

## Load Balancing

This provides simple **client-side load balancing** by:
- Distributing connections randomly across available backends
- Allowing manual failover with the switch functionality
- Each API call potentially hitting different servers

The system is resilient and will work even if one backend is down (though error handling could be enhanced for automatic failover).

## Configuration Options

To add more backends, simply update the `backendUrls` array:

```typescript
backendUrls: [
  'http://127.0.0.1:5010',
  'http://127.0.0.2:5010',
  'http://127.0.0.3:5010', // Add more as needed
]
```
