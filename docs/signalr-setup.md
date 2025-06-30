# SignalR Integration Setup

This document describes how to set up the SignalR integration with your .NET backend.

## Backend Requirements

Your .NET SignalR backend should expose the following hub methods at `http://localhost:8080/hubs/cursor`:

### Hub Methods (Server-side)

1. **CreateRoom**
   ```csharp
   public async Task CreateRoom(string roomId)
   ```
   - Called when a host creates a new room
   - Should add the connection to the specified room group

2. **JoinRoom**
   ```csharp
   public async Task JoinRoom(string roomId)
   ```
   - Called when a guest joins an existing room
   - Should add the connection to the specified room group

3. **SendCursorPosition**
   ```csharp
   public async Task SendCursorPosition(string roomId, CursorPosition position)
   ```
   - Called when the host sends cursor position updates
   - Should broadcast the position to all other users in the room

### Client Events (Frontend receives)

1. **CursorPositionReceived**
   - Triggered when cursor position is received from the host
   - Payload: `{ x: number, y: number }`

2. **RoomCreated**
   - Triggered when a room is successfully created
   - Payload: `roomId: string`

3. **UserJoinedRoom**
   - Triggered when a user joins the room
   - Payload: `message: string`

4. **Error**
   - Triggered when an error occurs
   - Payload: `error: string`

## Frontend Usage

### Environment Variables

Create a `.env.local` file with:
```
NEXT_PUBLIC_SIGNALR_URL=http://localhost:8080
```

### How it Works

1. **Host Flow:**
   - Host creates a room → calls `CreateRoom(roomId)`
   - Host moves cursor → calls `SendCursorPosition(roomId, position)`
   - All guests receive `CursorPositionReceived` events

2. **Guest Flow:**
   - Guest joins room → calls `JoinRoom(roomId)`
   - Guest receives cursor updates via `CursorPositionReceived`
   - Guest sees host's cursor position in real-time

### Components

- **SignalRService**: Core service managing the SignalR connection
- **useSignalR**: React hook for easy SignalR integration
- **RoomClient**: Main component that uses SignalR for real-time collaboration

### Features

- ✅ Automatic reconnection with exponential backoff
- ✅ Connection state monitoring
- ✅ Throttled cursor updates (~60 FPS)
- ✅ Comprehensive logging for debugging
- ✅ Error handling and recovery
- ✅ Clean connection lifecycle management

## Development

1. Start your .NET SignalR backend on port 8080
2. Run the frontend: `npm run dev`
3. Open two browser windows:
   - Window 1: Create a room as host
   - Window 2: Join the same room as guest
4. Move cursor in host window to see real-time updates in guest window

## Troubleshooting

- Check browser console for SignalR connection logs
- Verify backend is running on correct port (8080)
- Ensure CORS is configured on backend for frontend origin
- Check the Activity Log in the UI for connection status
