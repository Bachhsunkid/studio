# Server Info Components

This project includes components to display which backend server instance is serving the frontend application, useful for load-balanced environments.

## Components

### 1. ServerInfo (Floating)

A floating button that shows server information in a popup. Added globally to all screens via the root layout.

**Location**: `src/components/server-info.tsx`

**Features**:
- Floating button in configurable corner positions
- Click to show/hide server information panel
- Auto-refresh capability
- Manual refresh button
- Error handling with retry functionality
- Modern UI with Tailwind CSS and Radix UI

**Props**:
```typescript
interface ServerInfoProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}
```

**Usage**:
```tsx
<ServerInfo 
  position="top-right"
  autoRefresh={true}
  refreshInterval={30000}
/>
```

### 2. InlineServerInfo

An inline component for embedding server info directly in page content.

**Location**: `src/components/inline-server-info.tsx`

**Features**:
- Inline card component
- Server status display
- Auto-refresh capability
- Manual refresh button
- Grid layout for server details

**Props**:
```typescript
interface InlineServerInfoProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}
```

**Usage**:
```tsx
import InlineServerInfo from '@/components/inline-server-info';

// In your component
<InlineServerInfo 
  autoRefresh={true}
  refreshInterval={60000}
  className="max-w-md"
/>
```

### 3. useServerInfo Hook

A custom hook for server information functionality.

**Location**: `src/hooks/use-server-info.ts`

**Features**:
- Fetch server information
- Auto-refresh functionality
- Loading and error states
- Enable/disable capability

**Options**:
```typescript
interface UseServerInfoOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enabled?: boolean;
}
```

**Returns**:
```typescript
{
  serverInfo: ServerInfoResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchServerInfo: () => Promise<void>;
  refetch: () => Promise<void>;
}
```

**Usage**:
```tsx
import { useServerInfo } from '@/hooks/use-server-info';

function MyComponent() {
  const { serverInfo, isLoading, error, fetchServerInfo } = useServerInfo({
    autoRefresh: true,
    refreshInterval: 30000,
    enabled: true,
  });

  // Use the server info in your component
}
```

## Backend API

The components expect a backend API endpoint:

```csharp
[HttpGet("whoami")]
public IActionResult WhoAmI()
{
    var instance = Environment.GetEnvironmentVariable("APP_INSTANCE") ?? "unknown";
    return Ok(new { Instance = instance, Time = DateTime.UtcNow });
}
```

**Response Format**:
```json
{
  "instance": "server-01",
  "time": "2024-01-01T12:00:00.000Z"
}
```

## Configuration

The components use the SignalR configuration for the base URL:

**File**: `src/lib/signalr-config.ts`
```typescript
export const signalRConfig = {
  baseUrl: process.env.NEXT_PUBLIC_SIGNALR_URL || 'http://localhost:8080',
  // ...
};
```

The API endpoint will be called at: `${signalRConfig.baseUrl}/whoami`

## Installation

The floating ServerInfo component is automatically added to all screens via the root layout (`src/app/layout.tsx`):

```tsx
<ServerInfo 
  position="top-right"
  autoRefresh={true}
  refreshInterval={30000}
/>
```

## Customization

### Styling
The components use Tailwind CSS classes and can be customized by:
- Modifying the className props
- Updating the component styles directly
- Using CSS custom properties for theming

### Position
The floating component supports four corner positions:
- `top-right` (default)
- `top-left`
- `bottom-right`
- `bottom-left`

### Refresh Behavior
- `autoRefresh`: Enable automatic polling
- `refreshInterval`: Time between automatic refreshes (milliseconds)
- Manual refresh always available via button

## Environment Variables

Set your backend URL in your environment:

```env
NEXT_PUBLIC_SIGNALR_URL=https://your-backend-api.com
```

## Development

For development, the default configuration points to `http://localhost:8080`. Make sure your backend is running on this port or update the environment variable accordingly.
