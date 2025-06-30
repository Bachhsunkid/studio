'use client';

import { useState, useRef, useCallback } from 'react';
import CursorCanvas from './cursor-canvas';
import CoordinateLog from './coordinate-log';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSignalR } from '@/hooks/use-signalr';
import { CursorPosition as SignalRCursorPosition } from '@/lib/signalr';

type CursorPosition = {
  x: number;
  y: number;
};

type RoomClientProps = {
  roomId: string;
  isHost: boolean;
};

export default function RoomClient({ roomId, isHost }: RoomClientProps) {
  const [hostCursor, setHostCursor] = useState<CursorPosition | null>(null);
  const [receivedCursor, setReceivedCursor] = useState<CursorPosition | null>(null);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const lastUpdateTime = useRef(0);
  // const THROTTLE_MS = 16; // ~60 FPS

    const THROTTLE_MS = 200; // ~60 FPS


  // SignalR integration
  const { connectionState, isConnected, logs, retryCount, sendCursorPosition } = useSignalR({
    roomId,
    isHost,
    
    onCursorPositionReceived: useCallback((position: SignalRCursorPosition) => {
      console.log(`🎯 Guest received cursor position:`, position, `isHost: ${isHost}`);
      // Update received cursor position for all users (including host for debugging)
      setReceivedCursor(position);
      const newLog = `Received cursor: { x: ${position.x.toFixed(0)}, y: ${position.y.toFixed(0)} }`;
      setConnectionLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 99)]);
    }, [isHost]),

    onRoomCreated: useCallback((roomId: string) => {
      console.log(`📦 Room created: ${roomId}`);
      setConnectionLogs((prevLogs) => [`Room created: ${roomId}`, ...prevLogs.slice(0, 99)]);
    }, []),

    onUserJoinedRoom: useCallback((message: string) => {
      console.log(`👤 User joined: ${message}`);
      setConnectionLogs((prevLogs) => [`User joined: ${message}`, ...prevLogs.slice(0, 99)]);
    }, []),
    
    onError: useCallback((error: string) => {
      console.error(`❌ SignalR Error: ${error}`);
      setConnectionLogs((prevLogs) => [`Error: ${error}`, ...prevLogs.slice(0, 99)]);
    }, [])
  });

  const handleMouseMove = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHost || !isConnected) return;

    const now = Date.now();
    if (now - lastUpdateTime.current < THROTTLE_MS) {
      return;
    }
    lastUpdateTime.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const positionData: CursorPosition = { x, y };

    // Update local cursor immediately for smooth experience (host only)
    if (isHost) {
      setHostCursor(positionData);
      console.log(`🖱️ Host cursor updated locally:`, positionData);
    }

    // Send to SignalR
    console.log(`📡 Sending cursor position to SignalR:`, positionData);
    await sendCursorPosition(positionData);

    const newLog = `Sent: { x: ${x.toFixed(0)}, y: ${y.toFixed(0)} }`;
    setConnectionLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 99)]);
  }, [isHost, isConnected, sendCursorPosition]);

  // Determine which cursor position to display
  const displayCursor = isHost ? hostCursor : receivedCursor;
  
  // Debug logging for cursor state
  console.log(`🔍 Debug - isHost: ${isHost}, hostCursor:`, hostCursor, `receivedCursor:`, receivedCursor, `displayCursor:`, displayCursor);

  // Combine connection logs with cursor logs
  const allLogs = [...connectionLogs, ...logs];

  return (
    <Card className="w-full max-w-6xl shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">Room: {roomId}</CardTitle>
                <CardDescription>
                    You are {isHost ? 'hosting' : 'a guest'}.
                    {isHost ? " Move your cursor over the canvas." : " Watch the host's cursor."}
                    <br />
                    <small className="text-xs">
                        Debug: {isHost ? 'Host' : 'Guest'} | 
                        Local: {hostCursor ? `(${hostCursor.x}, ${hostCursor.y})` : 'null'} | 
                        Received: {receivedCursor ? `(${receivedCursor.x}, ${receivedCursor.y})` : 'null'} | 
                        Display: {displayCursor ? `(${displayCursor.x}, ${displayCursor.y})` : 'null'}
                    </small>
                </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant={isHost ? "default" : "secondary"} className="text-lg">
                    {isHost ? "Host" : "Guest"}
                </Badge>
                <Badge variant={isConnected ? "default" : "destructive"} className="text-sm">
                    {connectionState}
                    {retryCount > 0 && ` (${retryCount})`}
                </Badge>
            </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            <h3 className="font-headline mb-2 text-lg">Collaboration Canvas</h3>
            <CursorCanvas
                isHost={isHost}
                onMouseMove={handleMouseMove}
                hostCursorPosition={displayCursor}
            />
        </div>
        <div className="md:col-span-1">
            <h3 className="font-headline mb-2 text-lg">Activity Log</h3>
            <CoordinateLog logs={allLogs} />
        </div>
      </CardContent>
    </Card>
  );
}
