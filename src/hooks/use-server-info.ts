import { useState, useEffect, useCallback } from 'react';
import { signalRConfig, getRandomWhoAmIUrl } from "@/lib/signalr-config";

interface ServerInfoResponse {
  instance: string;
  time: string;
}

interface UseServerInfoOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enabled?: boolean;
}

export const useServerInfo = (options: UseServerInfoOptions = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    enabled = true,
  } = options;

  const [serverInfo, setServerInfo] = useState<ServerInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServerInfo = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use random backend URL for whoami API
      const whoAmIUrl = getRandomWhoAmIUrl();
      console.log(`🔍 Fetching server info from: ${whoAmIUrl}`);

      const response = await fetch(whoAmIUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setServerInfo(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch server info"
      );
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefresh && refreshInterval > 0 && enabled) {
      // Initial fetch
      fetchServerInfo();
      // Set up interval
      interval = setInterval(fetchServerInfo, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, enabled, fetchServerInfo]);

  return {
    serverInfo,
    isLoading,
    error,
    fetchServerInfo,
    refetch: fetchServerInfo,
  };
};
