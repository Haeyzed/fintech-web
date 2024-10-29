import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import client, { ApiResponse } from '@/lib/api-client';
import { ErrorResponse } from '@/types';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiHook {
    data: ApiResponse | null;
    error: ErrorResponse | null;
    isLoading: boolean;
    get: <TResponse>(endpoint: string, params?: Record<string, string>) => Promise<ApiResponse<TResponse>>;
    post: <TResponse, TRequest extends Record<string, unknown> = Record<string, unknown>>(
      endpoint: string,
      body?: TRequest | FormData,
      params?: Record<string, string>
    ) => Promise<ApiResponse<TResponse>>;
    put: <TResponse, TRequest extends Record<string, unknown> = Record<string, unknown>>(
      endpoint: string,
      body: TRequest | FormData,
      params?: Record<string, string>
    ) => Promise<ApiResponse<TResponse>>;
    patch: <TResponse, TRequest extends Record<string, unknown> = Record<string, unknown>>(
      endpoint: string,
      body: TRequest | FormData,
      params?: Record<string, string>
    ) => Promise<ApiResponse<TResponse>>;
    del: <TResponse>(endpoint: string, params?: Record<string, string>) => Promise<ApiResponse<TResponse>>;
}

export function useApi(): ApiHook {
    const [data, setData] = useState<ApiResponse | null>(null); // Replaces any with unknown
    const [error, setError] = useState<ErrorResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { data: session } = useSession();

    const execute = useCallback(
      async <TResponse, TRequest extends Record<string, unknown> = Record<string, unknown>>(
        method: ApiMethod,
        endpoint: string,
        body?: TRequest | FormData,
        params?: Record<string, string>
      ): Promise<ApiResponse<TResponse>> => {
          setIsLoading(true);
          setError(null);

          try {
              const result = await client<TResponse, TRequest>(endpoint, {
                  method,
                  body,
                  params,
                  token: session?.user?.token,
              });
              setData(result);
              return result;
          } catch (err) {
              const errorResponse = err as ErrorResponse;
              setError(errorResponse);
              throw errorResponse;
          } finally {
              setIsLoading(false);
          }
      },
      [session]
    );

    const get = useCallback(<TResponse>(endpoint: string, params?: Record<string, string>) => execute<TResponse>('GET', endpoint, undefined, params), [execute]);
    const post = useCallback(<TResponse, TRequest extends Record<string, unknown> = Record<string, unknown>>(endpoint: string, body?: TRequest | FormData, params?: Record<string, string>) => execute<TResponse, TRequest>('POST', endpoint, body, params), [execute]);
    const put = useCallback(<TResponse, TRequest extends Record<string, unknown> = Record<string, unknown>>(endpoint: string, body: TRequest | FormData, params?: Record<string, string>) => execute<TResponse, TRequest>('PUT', endpoint, body, params), [execute]);
    const patch = useCallback(<TResponse, TRequest extends Record<string, unknown> = Record<string, unknown>>(endpoint: string, body: TRequest | FormData, params?: Record<string, string>) => execute<TResponse, TRequest>('PATCH', endpoint, body, params), [execute]);
    const del = useCallback(<TResponse>(endpoint: string, params?: Record<string, string>) => execute<TResponse>('DELETE', endpoint, undefined, params), [execute]);

    return { data, error, isLoading, get, post, put, patch, del };
}
