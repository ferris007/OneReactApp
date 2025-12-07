import { useState, useEffect, useCallback } from "react";
import { MetricsProvider } from "../metrics";
import { BodyMetrics } from "../metrics/types";

export function useBodyMetrics() {
  const [connected, setConnected] = useState(false);
  const [metrics, setMetrics] = useState<BodyMetrics | null>(null);

  const connect = useCallback(async () => {
    const ok = await MetricsProvider.connect();
    setConnected(ok);
  }, []);

  const refresh = useCallback(async () => {
    console.log("CONNECTED", connected);

    if (connected) {
      const m = await MetricsProvider.getLatestMetrics();
      console.log("MMMM", m);

      setMetrics(m);
    }
  }, [connected]);

  const setMetricsNull = () => {
    setMetrics(null)
  }

  return { connected, metrics, connect, refresh, setMetricsNull };
}
