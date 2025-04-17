import { loadStripe } from '@stripe/stripe-js';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { toast } from 'sonner';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

/**
 * Initiates a payment for an invoice using Stripe
 * @param invoiceId The ID of the invoice to pay
 * @param amount The amount to charge
 * @param currency The currency code (e.g., 'usd')
 * @returns A promise that resolves when the payment is complete
 */
export async function initiatePayment(invoiceId: string, amount: number, currency: string): Promise<void> {
  try {
    // Get the Stripe instance
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }
    
    // Call the Firebase function to create a payment intent
    const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
    const { data } = await createPaymentIntent({ 
      invoiceId,
      amount,
      currency,
      description: `Payment for Invoice #${invoiceId}`
    });
    
    const { clientSecret } = data as { clientSecret: string };
    
    // Redirect to the payment page
    const { error } = await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/invoices/${invoiceId}/payment-complete`,
      },
      elements: stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      }),
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Payment error:', error);
    toast.error('Payment failed', {
      description: error instanceof Error ? error.message : 'An unknown error occurred',
    });
    throw error;
  }
}

/**
 * Checks the payment status of an invoice
 * @param invoiceId The ID of the invoice to check
 * @returns A promise that resolves with the payment status
 */
export async function checkPaymentStatus(invoiceId: string): Promise<'success' | 'processing' | 'failed'> {
  try {
    // Get the invoice document from Firestore
    const checkStatus = httpsCallable(functions, 'checkPaymentStatus');
    const { data } = await checkStatus({ invoiceId });
    
    return (data as { status: 'success' | 'processing' | 'failed' }).status;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
} 