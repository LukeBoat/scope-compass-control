# Stripe Integration for ScopeSentinel

This document provides instructions for setting up and configuring Stripe payment integration for the ScopeSentinel application.

## Prerequisites

- A Stripe account (you can create one at [stripe.com](https://stripe.com))
- Firebase project with Cloud Functions enabled
- Node.js and npm installed

## Setup Steps

### 1. Install Dependencies

Install the required dependencies in both the main project and the Firebase Functions directory:

```bash
# In the main project directory
npm install @stripe/stripe-js

# In the functions directory
cd functions
npm install stripe
```

### 2. Configure Environment Variables

#### Firebase Functions

Create a `.env` file in the `functions` directory with the following variables:

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

#### Frontend

Create a `.env` file in the root directory with the following variable:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 3. Deploy Firebase Functions

Deploy the Firebase Functions to make the Stripe integration available:

```bash
firebase deploy --only functions
```

### 4. Set Up Stripe Webhook

1. Go to the Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter your Firebase Function URL: `https://your-region-your-project-id.cloudfunctions.net/stripeWebhook`
4. Select the event `payment_intent.succeeded`
5. Click "Add endpoint"
6. Copy the "Signing secret" and add it to your Firebase Functions environment variables

### 5. Test the Integration

1. Create a test invoice in the application
2. Click the "Pay Now" button
3. Use Stripe's test card numbers (e.g., 4242 4242 4242 4242) to complete the payment
4. Verify that the invoice status updates to "Paid" after successful payment

## Troubleshooting

### Common Issues

1. **Payment fails to process**
   - Check the browser console for errors
   - Verify that your Stripe keys are correctly set
   - Ensure the Firebase Functions are deployed and running

2. **Invoice status doesn't update after payment**
   - Check the Firebase Functions logs for errors
   - Verify that the webhook is correctly configured
   - Ensure the webhook secret is correctly set

3. **Stripe Elements not loading**
   - Check that the publishable key is correctly set
   - Verify that the Stripe.js library is properly loaded

## Security Considerations

- Never expose your Stripe secret key in client-side code
- Always use environment variables for sensitive keys
- Implement proper authentication checks in your Firebase Functions
- Use Stripe's test mode for development and testing

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Stripe Testing Guide](https://stripe.com/docs/testing) 