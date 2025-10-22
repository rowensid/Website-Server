import { io, Socket } from 'socket.io-client';

export class PterodactylWebSocket {
  private socket: Socket | null = null;
  private token: string;
  private serverUuid: string;

  constructor(token: string, serverUuid: string) {
    this.token = token;
    this.serverUuid = serverUuid;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Connect to Pterodactyl websocket
      this.socket = io(`wss://panel.androwproject.cloud`, {
        path: `/api/servers/${this.serverUuid}/ws`,
        auth: {
          token: this.token
        },
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        console.log('Connected to Pterodactyl WebSocket');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      this.socket.on('status', (data) => {
        console.log('Server status update:', data);
      });

      this.socket.on('stats', (data) => {
        console.log('Server stats:', data);
      });
    });
  }

  onStatus(callback: (status: string) => void) {
    if (this.socket) {
      this.socket.on('status', callback);
    }
  }

  onStats(callback: (stats: any) => void) {
    if (this.socket) {
      this.socket.on('stats', callback);
    }
  }

  sendCommand(command: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('command', command);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}