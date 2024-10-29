'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { useApiErrorHandler } from '@/hooks/use-api-error';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/use-auth';

interface VerifyTransactionResponse {
  new_balance: number;
}

export default function PaystackCallback() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const { update } = useSession();
  const { user } = useAuth();
  const { post } = useApi();
  const { handleApiError } = useApiErrorHandler();

  useEffect(() => {
    const verifyTransaction = async () => {
      const reference = searchParams?.get('reference');
      if (!reference) {
        setVerificationStatus('error');
        setMessage('No reference found in the URL.');
        return;
      }

      try {
        const response = await post<VerifyTransactionResponse>('/paystack/payment/verify', { reference });
        if (response.success) {
          setVerificationStatus('success');
          await update({
            user: {
              ...user,
              balance: response.data.new_balance,
            },
          });
          setMessage(response.message || 'Transaction verified successfully.');
        } else {
          setVerificationStatus('error');
          setMessage(response.message || 'Failed to verify transaction.');
        }
      } catch (error) {
        handleApiError(error);
        setVerificationStatus('error');
        setMessage('An error occurred while verifying the transaction.');
      }
    };

    verifyTransaction();
  }, [searchParams, post, handleApiError, update, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {verificationStatus === 'loading' && (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Verifying transaction...</p>
        </div>
      )}
      {verificationStatus === 'success' && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600 mb-2">Transaction Successful</h1>
          <p>{message}</p>
        </div>
      )}
      {verificationStatus === 'error' && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Transaction Failed</h1>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}