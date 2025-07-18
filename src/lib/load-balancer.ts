import { signalRConfig } from './signalr-config';

export type LoadBalanceStrategy = 'random' | 'round-robin' | 'sticky';

export interface ServerEndpoint {
  url: string;
  isHealthy: boolean;
  lastHealthCheck: Date;
  responseTime?: number;
}

class LoadBalancerService {
  private servers: ServerEndpoint[] = [];
  private currentIndex = 0;
  private selectedServer: string | null = null;
  private strategy: LoadBalanceStrategy = 'random';

  constructor(urls: string[] = signalRConfig.baseUrls) {
    this.initializeServers(urls);
  }

  private initializeServers(urls: string[]): void {
    this.servers = urls.map(url => ({
      url: url.trim(),
      isHealthy: true,
      lastHealthCheck: new Date(),
    }));
  }

  /**
   * Get a server URL based on the current load balancing strategy
   */
  getServerUrl(): string {
    const healthyServers = this.servers.filter(server => server.isHealthy);
    
    if (healthyServers.length === 0) {
      // Fallback to the first server if none are healthy
      console.warn('No healthy servers available, falling back to first server');
      return this.servers[0]?.url || signalRConfig.baseUrl;
    }

    switch (this.strategy) {
      case 'round-robin':
        return this.getRoundRobinServer(healthyServers);
      case 'sticky':
        return this.getStickyServer(healthyServers);
      case 'random':
      default:
        return this.getRandomServer(healthyServers);
    }
  }

  /**
   * Get a random server from healthy servers
   */
  private getRandomServer(healthyServers: ServerEndpoint[]): string {
    const randomIndex = Math.floor(Math.random() * healthyServers.length);
    const selectedServer = healthyServers[randomIndex];
    console.log(`🎲 Load Balancer: Selected random server: ${selectedServer.url}`);
    return selectedServer.url;
  }

  /**
   * Get next server in round-robin fashion
   */
  private getRoundRobinServer(healthyServers: ServerEndpoint[]): string {
    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex = (this.currentIndex + 1) % healthyServers.length;
    console.log(`🔄 Load Balancer: Selected round-robin server: ${server.url}`);
    return server.url;
  }

  /**
   * Get the sticky server (same server for the session)
   */
  private getStickyServer(healthyServers: ServerEndpoint[]): string {
    // If no sticky server selected or it's not healthy, select a new one
    if (!this.selectedServer || !healthyServers.find(s => s.url === this.selectedServer)) {
      this.selectedServer = this.getRandomServer(healthyServers);
    }
    console.log(`📌 Load Balancer: Selected sticky server: ${this.selectedServer}`);
    return this.selectedServer;
  }

  /**
   * Set the load balancing strategy
   */
  setStrategy(strategy: LoadBalanceStrategy): void {
    this.strategy = strategy;
    if (strategy !== 'sticky') {
      this.selectedServer = null; // Reset sticky selection
    }
    console.log(`⚖️ Load Balancer: Strategy changed to ${strategy}`);
  }

  /**
   * Get current strategy
   */
  getStrategy(): LoadBalanceStrategy {
    return this.strategy;
  }

  /**
   * Add a new server URL
   */
  addServer(url: string): void {
    if (!this.servers.find(server => server.url === url)) {
      this.servers.push({
        url: url.trim(),
        isHealthy: true,
        lastHealthCheck: new Date(),
      });
      console.log(`➕ Load Balancer: Added server: ${url}`);
    }
  }

  /**
   * Remove a server URL
   */
  removeServer(url: string): void {
    const index = this.servers.findIndex(server => server.url === url);
    if (index > -1) {
      this.servers.splice(index, 1);
      console.log(`➖ Load Balancer: Removed server: ${url}`);
      
      // Reset sticky server if it was removed
      if (this.selectedServer === url) {
        this.selectedServer = null;
      }
    }
  }

  /**
   * Mark a server as unhealthy
   */
  markServerUnhealthy(url: string): void {
    const server = this.servers.find(s => s.url === url);
    if (server) {
      server.isHealthy = false;
      server.lastHealthCheck = new Date();
      console.warn(`❌ Load Balancer: Marked server as unhealthy: ${url}`);
    }
  }

  /**
   * Mark a server as healthy
   */
  markServerHealthy(url: string): void {
    const server = this.servers.find(s => s.url === url);
    if (server) {
      server.isHealthy = true;
      server.lastHealthCheck = new Date();
      console.log(`✅ Load Balancer: Marked server as healthy: ${url}`);
    }
  }

  /**
   * Get all servers with their health status
   */
  getServers(): ServerEndpoint[] {
    return [...this.servers];
  }

  /**
   * Get healthy servers only
   */
  getHealthyServers(): ServerEndpoint[] {
    return this.servers.filter(server => server.isHealthy);
  }

  /**
   * Perform health check on all servers
   */
  async performHealthCheck(): Promise<void> {
    console.log('🏥 Load Balancer: Starting health check...');
    
    const healthChecks = this.servers.map(async (server) => {
      try {
        const startTime = Date.now();
        const response = await fetch(`${server.url}/health`, {
          method: 'GET',
          timeout: 5000,
        } as RequestInit);
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          server.isHealthy = true;
          server.responseTime = responseTime;
          console.log(`✅ Health check passed for ${server.url} (${responseTime}ms)`);
        } else {
          server.isHealthy = false;
          console.warn(`❌ Health check failed for ${server.url}: ${response.status}`);
        }
      } catch (error) {
        server.isHealthy = false;
        console.warn(`❌ Health check failed for ${server.url}:`, error);
      }
      
      server.lastHealthCheck = new Date();
    });

    await Promise.all(healthChecks);
    console.log('🏥 Load Balancer: Health check completed');
  }

  /**
   * Reset all servers to healthy state
   */
  resetServerHealth(): void {
    this.servers.forEach(server => {
      server.isHealthy = true;
      server.lastHealthCheck = new Date();
    });
    console.log('🔄 Load Balancer: Reset all servers to healthy');
  }
}

// Singleton instance
let loadBalancer: LoadBalancerService | null = null;

export const getLoadBalancer = (): LoadBalancerService => {
  if (!loadBalancer) {
    loadBalancer = new LoadBalancerService();
  }
  return loadBalancer;
};

export const resetLoadBalancer = (): void => {
  loadBalancer = null;
};

export default LoadBalancerService;
