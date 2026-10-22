import { useEffect, useState } from "react";

interface Response<T> {
  requestId: number;
  data: T;
}

/**
 * Simulates a network request that resolves with `data` after `latency`
 * milliseconds. Call `reload` to clear the data and request it again.
 */
export function useRequest<T>(data: T, latency = 1500) {
  const [requestId, setRequestId] = useState(0);
  const [response, setResponse] = useState<Response<T>>();

  useEffect(() => {
    const timer = setTimeout(() => setResponse({ requestId, data }), latency);
    return () => clearTimeout(timer);
  }, [requestId, data, latency]);

  const loading = response?.requestId !== requestId;
  const reload = () => setRequestId((id) => id + 1);
  return { data: loading ? undefined : response.data, loading, reload };
}
