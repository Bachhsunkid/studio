import * as signalR from '@microsoft/signalr';
import { signalRConfig } from './signalr-config';

export interface CursorPosition {
  x: number;
  y: number;
  timestamp?: Date | null;
}

export interface CursorUpdateMessage {
  roomId: string;
  userId: string;
  position: CursorPosition;
  timestamp: Date;
}

export interface UserConnectionMessage {
  roomId: string;
  userId: string;
  isHost: boolean;
  timestamp: Date;
}

export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(private baseUrl: string = signalRConfig.baseUrl) {
  console.log("🚀 ~ SignalRService ~ constructor ~ baseUrl: ", `${this.baseUrl}${signalRConfig.hubPath}`)

    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}${signalRConfig.hubPath}`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < signalRConfig.maxReconnectAttempts) {
            return Math.min(signalRConfig.reconnectDelayMs * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
          return null;
        }
      })
      .configureLogging(signalRConfig.enableLogging ? signalR.LogLevel.Information : signalR.LogLevel.Error)
      .build();

    this.setupConnectionEvents();
  }

  private setupConnectionEvents(): void {
    if (!this.connection) return;

    this.connection.onreconnecting(() => {
      this.isConnected = false;
      console.log('SignalR: Attempting to reconnect...');
    });

    this.connection.onreconnected(() => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('SignalR: Reconnected successfully');
    });

    this.connection.onclose((error) => {
      this.isConnected = false;
      if (error) {
        console.error('SignalR: Connection closed with error:', error);
      } else {
        console.log('SignalR: Connection closed');
      }
    });
  }

  async connect(): Promise<void> {
    if (!this.connection) return;

    // Check if already connected or connecting
    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.isConnected = true;
      return;
    }

    if (this.connection.state === signalR.HubConnectionState.Connecting) {
      console.log('SignalR: Already connecting, waiting...');
      return;
    }

    try {
      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR: Connected successfully');
    } catch (error) {
      console.error('SignalR: Failed to connect:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;

    // Only disconnect if connected or connecting
    if (this.connection.state === signalR.HubConnectionState.Disconnected || 
        this.connection.state === signalR.HubConnectionState.Disconnecting) {
      this.isConnected = false;
      return;
    }

    try {
      await this.connection.stop();
      this.isConnected = false;
      console.log('SignalR: Disconnected successfully');
    } catch (error) {
      console.error('SignalR: Failed to disconnect:', error);
      this.isConnected = false;
    }
  }

  async createRoom(roomId: string): Promise<void> {
    if (!this.connection || !this.isConnected) {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('CreateRoom', roomId);
      console.log(`SignalR: Created room ${roomId}`);
    } catch (error) {
      console.error('SignalR: Failed to create room:', error);
      throw error;
    }
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.connection || !this.isConnected) {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('JoinRoom', roomId);
      console.log(`SignalR: Joined room ${roomId}`);
    } catch (error) {
      console.error('SignalR: Failed to join room:', error);
      throw error;
    }
  }

  async sendCursorPosition(roomId: string, position: CursorPosition): Promise<void> {
    if (!this.connection || !this.isConnected) return;

    try {
      console.log(`SignalR: Sending cursor position to room ${roomId}:`, position);
      await this.connection.invoke('SendCursorPosition', roomId, position);
    } catch (error) {
      console.error('SignalR: Failed to send cursor position:', error);
    }
  }

  onCursorPositionReceived(callback: (position: CursorPosition) => void): void {
    if (!this.connection) return;
    
    // Remove any existing handlers first
    this.connection.off('ReceiveCursorPosition');
    this.connection.off('CursorPositionReceived'); 
    this.connection.off('receiveCursorPosition');
    
    // Listen for the correct event name from your backend
    this.connection.on('ReceiveCursorPosition', (position: CursorPosition) => {
      console.log('SignalR: Received cursor position via ReceiveCursorPosition:', position);
      callback(position);
    });
    
    // Also listen for alternative event names (just in case)
    this.connection.on('CursorPositionReceived', (position: CursorPosition) => {
      console.log('SignalR: Received cursor position via CursorPositionReceived:', position);
      callback(position);
    });
    
    this.connection.on('receiveCursorPosition', (position: CursorPosition) => {
      console.log('SignalR: Received cursor position via receiveCursorPosition:', position);
      callback(position);
    });
  }

  onRoomCreated(callback: (roomId: string) => void): void {
    if (!this.connection) return;
    this.connection.off('RoomCreated');
    this.connection.on('RoomCreated', callback);
  }

  onUserJoinedRoom(callback: (message: string) => void): void {
    if (!this.connection) return;
    this.connection.off('UserJoinedRoom');
    this.connection.on('UserJoinedRoom', callback);
  }

  onError(callback: (error: string) => void): void {
    if (!this.connection) return;
    this.connection.off('Error');
    this.connection.on('Error', callback);
  }

  getConnectionState(): string {
    if (!this.connection) return 'Disconnected';
    
    switch (this.connection.state) {
      case signalR.HubConnectionState.Connected:
        return 'Connected';
      case signalR.HubConnectionState.Connecting:
        return 'Connecting';
      case signalR.HubConnectionState.Disconnected:
        return 'Disconnected';
      case signalR.HubConnectionState.Disconnecting:
        return 'Disconnecting';
      case signalR.HubConnectionState.Reconnecting:
        return 'Reconnecting';
      default:
        return 'Unknown';
    }
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected;
  }

  // Cleanup method
  dispose(): void {
    if (this.connection) {
      if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
        this.connection.stop();
      }
      this.connection = null;
    }
    this.isConnected = false;
  }
}

// Singleton instance
let signalRService: SignalRService | null = null;

export const getSignalRService = (baseUrl?: string): SignalRService => {
  if (!signalRService) {
    signalRService = new SignalRService(baseUrl);
  }
  return signalRService;
};

export const resetSignalRService = (): void => {
  if (signalRService) {
    signalRService.dispose();
    signalRService = null;
  }
};
