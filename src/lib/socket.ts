import { Server } from 'socket.io';
import { fetchServerResources } from '@/lib/pterodactyl';

interface ServerResourceSubscription {
  serverId: string;
  interval: NodeJS.Timeout;
}

export const setupSocket = (io: Server) => {
  // Store active subscriptions
  const activeSubscriptions = new Map<string, ServerResourceSubscription>();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle messages
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle server resource subscription
    socket.on('subscribe-server-resources', async (data: { serverId: string }) => {
      const { serverId } = data;
      console.log(`Client ${socket.id} subscribing to server ${serverId} resources`);

      try {
        // Clear existing subscription for this server
        const existingSubscription = activeSubscriptions.get(serverId);
        if (existingSubscription) {
          clearInterval(existingSubscription.interval);
        }

        // Send initial data
        const initialData = await fetchServerResources(serverId);
        socket.emit('server-resources-update', {
          serverId,
          data: initialData,
          timestamp: new Date().toISOString(),
        });

        // Set up periodic updates every 5 seconds
        const interval = setInterval(async () => {
          try {
            const resourceData = await fetchServerResources(serverId);
            socket.emit('server-resources-update', {
              serverId,
              data: resourceData,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error(`Error fetching resources for server ${serverId}:`, error);
            socket.emit('server-resources-error', {
              serverId,
              error: 'Failed to fetch server resources',
              timestamp: new Date().toISOString(),
            });
          }
        }, 5000);

        // Store subscription
        activeSubscriptions.set(serverId, {
          serverId,
          interval,
        });

        socket.emit('subscribed-to-server-resources', { serverId });

      } catch (error) {
        console.error(`Error setting up subscription for server ${serverId}:`, error);
        socket.emit('server-resources-error', {
          serverId,
          error: 'Failed to setup resource monitoring',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle unsubscribe
    socket.on('unsubscribe-server-resources', (data: { serverId: string }) => {
      const { serverId } = data;
      console.log(`Client ${socket.id} unsubscribing from server ${serverId} resources`);

      const subscription = activeSubscriptions.get(serverId);
      if (subscription) {
        clearInterval(subscription.interval);
        activeSubscriptions.delete(serverId);
        socket.emit('unsubscribed-from-server-resources', { serverId });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up all subscriptions for this client
      activeSubscriptions.forEach((subscription, serverId) => {
        clearInterval(subscription.interval);
        activeSubscriptions.delete(serverId);
      });
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to WebSocket Server Monitoring!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};