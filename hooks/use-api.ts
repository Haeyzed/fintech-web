import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import client, { ApiResponse } from '@/lib/api-client';
import { ErrorResponse } from '@/types/auth';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiHook<TResponse, TRequest = TResponse> {
    data: ApiResponse<TResponse> | null;
    error: ErrorResponse | null;
    isLoading: boolean;
    get: (params?: Record<string, string>) => Promise<ApiResponse<TResponse>>;
    post: (body: TRequest | FormData, params?: Record<string, string>) => Promise<ApiResponse<TResponse>>;
    put: (body: TRequest | FormData, params?: Record<string, string>) => Promise<ApiResponse<TResponse>>;
    patch: (body: TRequest | FormData, params?: Record<string, string>) => Promise<ApiResponse<TResponse>>;
    del: (params?: Record<string, string>) => Promise<ApiResponse<TResponse>>;
}

export function useApi<TResponse, TRequest extends Record<string, unknown> = Record<string, unknown>>(endpoint: string): ApiHook<TResponse, TRequest> {
    const [data, setData] = useState<ApiResponse<TResponse> | null>(null);
    const [error, setError] = useState<ErrorResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { data: session } = useSession();

    const execute = useCallback(
        async (method: ApiMethod, body?: TRequest | FormData, params?: Record<string, string>) => {
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
        [endpoint, session]
    );

    const get = useCallback(
        (params?: Record<string, string>) => execute('GET', undefined, params),
        [execute]
    );

    const post = useCallback(
        (body: TRequest | FormData, params?: Record<string, string>) => execute('POST', body, params),
        [execute]
    );

    const put = useCallback(
        (body: TRequest | FormData, params?: Record<string, string>) => execute('PUT', body, params),
        [execute]
    );

    const patch = useCallback(
        (body: TRequest | FormData, params?: Record<string, string>) => execute('PATCH', body, params),
        [execute]
    );

    const del = useCallback(
        (params?: Record<string, string>) => execute('DELETE', undefined, params),
        [execute]
    );

    return { data, error, isLoading, get, post, put, patch, del };
}