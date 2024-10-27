import { useState, useCallback } from 'react';
import { UseFormSetError } from 'react-hook-form';
import { toast } from 'sonner';

interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

export function useApiErrorHandler() {
    const [error, setError] = useState<ApiError | null>(null);

    const handleApiError = useCallback((error: unknown, setFormError?: UseFormSetError<any>) => {
        if (typeof error === 'object' && error !== null && 'message' in error) {
            const apiError = error as ApiError;
            setError(apiError);

            // Display general error message
            toast.error('Error', {
                description: apiError.message || 'An unexpected error occurred.',
            });

            // Set form errors if setFormError is provided
            if (setFormError && apiError.errors) {
                Object.entries(apiError.errors).forEach(([field, messages]) => {
                    setFormError(field as any, {
                        type: 'manual',
                        message: messages[0],
                    });
                });
            }
        } else {
            setError({ message: 'An unexpected error occurred.' });
            toast.error('Error', {
                description: 'An unexpected error occurred.',
            });
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return { error, handleApiError, clearError };
}