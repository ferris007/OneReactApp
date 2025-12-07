import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { AGENT_BASE_URL, API_BASE_URL } from "../config";

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  options?: { isFormData?: boolean }
): Promise<Response> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (method !== "GET" && data !== undefined) {
    if (options?.isFormData) {
      body = data as BodyInit;
    } else {
      body = JSON.stringify(data);
      headers["Content-Type"] = "application/json";
    }
  }

  const response = await fetch(`${AGENT_BASE_URL}${url}`, {
    method,
    headers,
    body,
  });

  return response;
}

export function getQueryFn<T = unknown>(options?: { on401?: "returnNull" }): QueryFunction<T> {
  return async ({ queryKey }) => {
    const url = String(queryKey[0]);
    const res = await apiRequest("GET", url);
    if (!res.ok) {
      if (res.status === 401 && options?.on401 === "returnNull") {
        return null as T;
      }
      const error = await res.text().catch(() => res.statusText);
      throw new Error(error);
    }
    return res.json();
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn(),
    },
  },
});
