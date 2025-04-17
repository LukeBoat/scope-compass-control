import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { checkPaymentStatus } from '@/services/paymentService';

export default function PaymentComplete() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!invoiceId) {
        setStatus('error');
        setMessage('Invoice ID not found');
        return;
      }

      try {
        // Poll for payment status every 2 seconds for up to 30 seconds
        let attempts = 0;
        const maxAttempts = 15;
        
        const checkStatus = async () => {
          const paymentStatus = await checkPaymentStatus(invoiceId);
          
          if (paymentStatus === 'success') {
            setStatus('success');
            setMessage('Payment successful! Your invoice has been marked as paid.');
            toast.success('Payment successful', {
              description: 'Your invoice has been marked as paid.'
            });
            return true;
          } else if (paymentStatus === 'processing') {
            if (attempts >= maxAttempts) {
              setStatus('error');
              setMessage('Payment verification timed out. Please contact support if payment was completed.');
              toast.error('Payment verification timed out', {
                description: 'Please contact support if you completed the payment.'
              });
              return true;
            }
            return false;
          } else {
            setStatus('error');
            setMessage('Payment failed. Please try again or contact support.');
            toast.error('Payment failed', {
              description: 'Please try again or contact support.'
            });
            return true;
          }
        };

        while (attempts < maxAttempts) {
          const isDone = await checkStatus();
          if (isDone) break;
          
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment. Please contact support.');
        toast.error('Payment verification error', {
          description: 'An error occurred while verifying your payment.'
        });
      }
    };

    verifyPayment();
  }, [invoiceId]);

  const handleViewInvoice = () => {
    if (invoiceId) {
      navigate(`/invoices/${invoiceId}`);
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === 'loading' && (
                <Loader2 className="h-16 w-16 text-brand-blue animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-16 w-16 text-brand-status-success" />
              )}
              {status === 'error' && (
                <XCircle className="h-16 w-16 text-brand-status-error" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold">
              {status === 'loading' && 'Processing Payment'}
              {status === 'success' && 'Payment Successful'}
              {status === 'error' && 'Payment Verification Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">{message}</p>
            
            <div className="flex flex-col gap-3">
              {status === 'success' && (
                <Button onClick={handleViewInvoice} className="w-full">
                  View Invoice
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleReturnToDashboard}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 