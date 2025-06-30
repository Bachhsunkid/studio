import { useEffect, useState, useCallback, useRef } from 'react';
import { getSignalRService, resetSignalRService, SignalRService, CursorPosition } from '@/lib/signalr';
import { signalRConfig } from '@/lib/signalr-config';

interface UseSignalRProps {
  roomId: string;
  isHost: boolean;
  onCursorPositionReceived?: (position: CursorPosition) => void;
  onRoomCreated?: (roomId: string) => void;
  onUserJoinedRoom?: (message: string) => void;
  onError?: (error: string) => void;
}

export const useSignalR = ({
  roomId,
  isHost,
  onCursorPositionReceived,
  onRoomCreated,
  onUserJoinedRoom,
  onError
}: UseSignalRProps) => {
  const [connectionState, setConnectionState] = useState<string>('Disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const signalRService = useRef<SignalRService | null>(null);
  const maxRetries = 3;

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  }, []);

  const sendCursorPosition = useCallback(async (position: CursorPosition) => {
    if (!signalRService.current || !isConnected) return;
    
    try {
      await signalRService.current.sendCursorPosition(roomId, position);
    } catch (error) {
      console.error('Failed to send cursor position:', error);
      addLog(`Error sending cursor position: ${error}`);
    }
  }, [roomId, isConnected, addLog]);

  const connectWithRetry = useCallback(async (attempt: number = 0): Promise<void> => {
    if (attempt >= maxRetries) {
      throw new Error(`Failed to connect after ${maxRetries} attempts`);
    }

    try {
      if (signalRService.current) {
        await signalRService.current.connect();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error; // Don't retry abort errors
      }
      
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        addLog(`Connection failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return connectWithRetry(attempt + 1);
      }
      throw error;
    }
  }, [addLog, maxRetries]);

  useEffect(() => {
    let isMounted = true;
    let connectionTimeout: NodeJS.Timeout;

    const initConnection = async () => {
      try {
        // Add a small delay to avoid connection during navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;

        // Reset any existing service first
        resetSignalRService();
        
        signalRService.current = getSignalRService();
        
        // Set up event handlers
        console.log(`🔧 Setting up SignalR event handlers for ${isHost ? 'HOST' : 'GUEST'} in room: ${roomId}`);
        
        signalRService.current.onCursorPositionReceived((position) => {
          console.log(`📨 SignalR Hook: Received cursor position for ${isHost ? 'HOST' : 'GUEST'}:`, position);
          if (isMounted) {
            onCursorPositionReceived?.(position);
            addLog(`Received cursor position: x=${position.x}, y=${position.y}`);
          }
        });

        signalRService.current.onRoomCreated((roomId) => {
          console.log(`📨 SignalR Hook: Room created:`, roomId);
          if (isMounted) {
            onRoomCreated?.(roomId);
            addLog(`Room created: ${roomId}`);
          }
        });

        signalRService.current.onUserJoinedRoom((message) => {
          console.log(`📨 SignalR Hook: User joined:`, message);
          if (isMounted) {
            onUserJoinedRoom?.(message);
            addLog(`User joined: ${message}`);
          }
        });

        signalRService.current.onError((error) => {
          console.log(`📨 SignalR Hook: Error:`, error);
          if (isMounted) {
            onError?.(error);
            addLog(`Error: ${error}`);
          }
        });

        // Connect to SignalR with retry logic
        connectionTimeout = setTimeout(() => {
          if (isMounted) {
            addLog('Connection timeout - retrying...');
          }
        }, 10000); // 10 second timeout

        await connectWithRetry();
        
        clearTimeout(connectionTimeout);
        
        if (isMounted) {
          setIsConnected(true);
          setConnectionState('Connected');
          setRetryCount(0);
          addLog('Connected to SignalR');

          // Create or join room based on host status
          if (isHost) {
            await signalRService.current.createRoom(roomId);
            addLog(`Created room: ${roomId}`);
          } else {
            await signalRService.current.joinRoom(roomId);
            addLog(`Joined room: ${roomId}`);
          }
        }

      } catch (error) {
        clearTimeout(connectionTimeout);
        console.error('SignalR connection failed:', error);
        
        if (isMounted) {
          // Check if it's an abort error (navigation-related)
          if (error instanceof Error && error.name === 'AbortError') {
            addLog('Connection was aborted during navigation');
            setConnectionState('Aborted');
            setRetryCount(0);
          } else {
            setIsConnected(false);
            setConnectionState('Failed');
            setRetryCount(prev => prev + 1);
            addLog(`Connection failed: ${error}`);
          }
        }
      }
    };

    // Debounce connection initialization
    const debounceTimeout = setTimeout(() => {
      initConnection();
    }, 200);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(debounceTimeout);
      clearTimeout(connectionTimeout);
      
      if (signalRService.current) {
        signalRService.current.disconnect();
        setIsConnected(false);
        setConnectionState('Disconnected');
      }
    };
  }, [roomId, isHost, onCursorPositionReceived, onRoomCreated, onUserJoinedRoom, onError, addLog, connectWithRetry]);

  // Update connection state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (signalRService.current) {
        const state = signalRService.current.getConnectionState();
        const isActive = signalRService.current.isConnectionActive();
        setConnectionState(state);
        setIsConnected(isActive);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    connectionState,
    isConnected,
    logs,
    retryCount,
    sendCursorPosition,
    addLog
  };
};
