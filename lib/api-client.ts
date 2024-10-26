import { getSession } from "next-auth/react";
import { ErrorResponse } from '@/types/auth';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://fintech-api.test/api/v1';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<T> extends Omit<RequestInit, 'method' | 'body'> {
    method?: HttpMethod;
    params?: Record<string, string>;
    body?: T;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        per_page: number;
        last_page: number;
        current_page: number;
        total: number;
    };
    message?: string;
    errors?: Record<string, string[]>;
}

async function client<TResponse, TRequest extends Record<string, any> = Record<string, any>>(
    endpoint: string,
    { params, ...customConfig }: RequestOptions<TRequest> = {}
): Promise<ApiResponse<TResponse>> {
    const session = await getSession();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (session?.user?.token) {
        headers['Authorization'] = `Bearer ${session.user.token}`;
    }

    const config: RequestInit = {
        method: customConfig.method || 'GET',
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (customConfig.body) {
        config.body = JSON.stringify(customConfig.body);
    }

    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    try {
        const response = await fetch(url.toString(), config);
        const data: ApiResponse<TResponse> = await response.json();

        if (response.ok) {
            return data;
        }

        const errorResponse: ErrorResponse = {
            success: false,
            message: data.message || 'An error occurred',
            errors: data.errors
        };
        return Promise.reject(errorResponse);
    } catch (error) {
        const errorResponse: ErrorResponse = {
            success: false,
            message: error instanceof Error ? `Network error: ${error.message}` : 'Unknown network error',
        };
        return Promise.reject(errorResponse);
    }
}

export default client;