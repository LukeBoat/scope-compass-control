import * as functions from 'firebase-functions/v2';
import { onCall, CallableRequest, HttpsError } from 'firebase-functions/v2/https';
import { 
  onDocumentCreated, 
  onDocumentWritten, 
  DocumentSnapshot, 
  Change,
  FirestoreEvent,
  QueryDocumentSnapshot 
} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import * as sgMail from '@sendgrid/mail';
import { DocumentData } from 'firebase-admin/firestore';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface InviteData {
  email: string;
  projectId: string;
  role: string;
}

interface RemoveClientData {
  clientId: string;
  uid: string;
}

interface UpdateRoleData {
  role: string;
  userId: string;
}

interface UserData {
  role?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProjectData {
  name: string;
  description: string;
  clientId: string;
  members: string[];
}

interface CreatePaymentIntentData {
  invoiceId: string;
  amount: number;
  currency: string;
  description: string;
}

interface CreateSubscriptionData {
  priceId: string;
  customerId: string;
  projectId: string;
}

interface WebhookData {
  signature: string;
  payload: string;
}

interface CheckPaymentStatusData {
  invoiceId: string;
}

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  total: number;
  currency: string;
  dueDate: Date;
  status: 'created' | 'updated' | 'paid' | 'overdue';
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

interface SendInvoiceEmailData {
  invoiceId: string;
}

interface ActivityLog {
  id: string;
  actionType: "feedback" | "approval" | "revision";
  actorId: string;
  actorName: string;
  actorRole: string;
  projectId: string;
  deliverableId: string;
  message: string;
  timestamp: admin.firestore.Timestamp;
  metadata?: Record<string, any>;
}

export const onTeamMemberInvite = onCall(async (request: CallableRequest<InviteData>) => {
  // Ensure user is authenticated
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { email, projectId, role } = request.data;

  // Validate input
  if (!email || !projectId || !role) {
    throw new HttpsError(
      'invalid-argument',
      'The function requires email, projectId, and role.'
    );
  }

  try {
    // Create a custom token for the invited user
    const customToken = await admin.auth().createCustomToken(email);

    // Store the invite in Firestore
    await admin.firestore().collection('teamInvites').add({
      email,
      projectId,
      role,
      invitedBy: request.auth?.uid,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send email with sign-in link
    const actionCodeSettings = {
      url: process.env.APP_URL + `/join-project?projectId=${projectId}`,
      handleCodeInApp: true,
    };

    const link = await admin.auth().generateSignInWithEmailLink(
      email,
      actionCodeSettings
    );

    // Here you would typically send the email using your preferred email service
    // For example, using SendGrid, Mailgun, etc.

    return { success: true, link };
  } catch (error) {
    console.error('Error inviting team member:', error);
    throw new HttpsError(
      'internal',
      'An error occurred while inviting the team member.'
    );
  }
});

/**
 * Cloud Function to set client claims for a user
 * This function should be called from a secure environment (admin SDK)
 */
export const setClientClaims = onCall(async (request: CallableRequest<RemoveClientData>) => {
  // Check if the request is made by an authenticated user
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  // Verify the caller is an admin
  const callerUid = request.auth?.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
    throw new HttpsError(
      'permission-denied',
      'Only admins can set client claims.'
    );
  }

  const { clientId, uid } = request.data;
  
  if (!clientId || !uid) {
    throw new HttpsError(
      'invalid-argument',
      'The function requires clientId and uid parameters.'
    );
  }

  try {
    // Verify the client exists
    const clientDoc = await admin.firestore().collection('clients').doc(clientId).get();
    if (!clientDoc.exists) {
      throw new HttpsError(
        'not-found',
        'Client not found.'
      );
    }

    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(uid, {
      clientId: clientId
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting client claims:', error);
    throw new HttpsError(
      'internal',
      'An error occurred while setting client claims.'
    );
  }
});

/**
 * Cloud Function to remove client claims from a user
 */
export const removeClientClaims = onCall(async (request: CallableRequest<RemoveClientData>) => {
  // Check if the request is made by an authenticated user
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  // Verify the caller is an admin
  const callerUid = request.auth?.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
  
  if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
    throw new HttpsError(
      'permission-denied',
      'Only admins can remove client claims.'
    );
  }

  const { uid } = request.data;
  
  if (!uid) {
    throw new HttpsError(
      'invalid-argument',
      'The function requires a uid parameter.'
    );
  }

  try {
    // Remove client claims from the user
    await admin.auth().setCustomUserClaims(uid, {
      clientId: null
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing client claims:', error);
    throw new HttpsError(
      'internal',
      'An error occurred while removing client claims.'
    );
  }
});

export const onUserCreated = onDocumentCreated('users/{userId}', async (event: FirestoreEvent<QueryDocumentSnapshot | undefined>) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('No data associated with the event');
    return;
  }

  const userData = snapshot.data() as UserData;
  const userId = event.params?.userId;

  if (!userId) {
    console.error('No userId found in event params');
    return;
  }

  try {
    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(userId, {
      role: userData.role || 'user'
    });

    console.log(`Custom claims set for user ${userId}`);
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
});

export const updateUserRole = functions.https.onCall(async (request: functions.https.CallableRequest<UpdateRoleData>) => {
  const { role, userId } = request.data;
  // Implementation of the function
});

export const createProject = functions.https.onCall(async (request: functions.https.CallableRequest<ProjectData>) => {
  const { name, description, clientId, members } = request.data;
  // Implementation of the function
});

/**
 * Creates a payment intent for invoice payment
 */
export const createPaymentIntent = onCall(async (request: CallableRequest<CreatePaymentIntentData>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { invoiceId, amount, currency, description } = request.data;

  if (!invoiceId || !amount || !currency) {
    throw new HttpsError('invalid-argument', 'Missing required parameters.');
  }

  try {
    // Get the invoice details
    const invoiceRef = admin.firestore().collection('invoices').doc(invoiceId);
    const invoice = await invoiceRef.get();

    if (!invoice.exists) {
      throw new HttpsError('not-found', 'Invoice not found.');
    }

    const invoiceData = invoice.data();
    if (invoiceData?.status === 'Paid') {
      throw new HttpsError('already-exists', 'Invoice has already been paid.');
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        invoiceId,
        userId: request.auth.uid,
      },
      description: `Payment for Invoice #${invoiceId}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update invoice status to Processing
    await invoiceRef.update({
      status: 'Processing',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new HttpsError('internal', 'An error occurred while creating the payment intent.');
  }
});

/**
 * Creates a subscription for recurring payments
 */
export const createSubscription = onCall(async (request: CallableRequest<CreateSubscriptionData>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { priceId, customerId, projectId } = request.data;

  if (!priceId || !customerId || !projectId) {
    throw new HttpsError('invalid-argument', 'Missing required parameters.');
  }

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        projectId,
        userId: request.auth.uid,
      },
    });

    // Store subscription details in Firestore
    await admin.firestore().collection('subscriptions').doc(subscription.id).set({
      projectId,
      userId: request.auth.uid,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { subscriptionId: subscription.id };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new HttpsError('internal', 'An error occurred while creating the subscription.');
  }
});

/**
 * Handles Stripe webhook events
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    res.status(400).send('Missing stripe-signature or webhook secret');
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      webhookSecret
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: unknown) {
    console.error('Error handling webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).send(`Webhook Error: ${errorMessage}`);
  }
});

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { invoiceId, userId } = paymentIntent.metadata;

  if (invoiceId) {
    const invoiceRef = admin.firestore().collection('invoices').doc(invoiceId);
    
    await invoiceRef.update({
      status: 'Paid',
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentId: paymentIntent.id,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create a payment record
    await admin.firestore().collection('payments').add({
      invoiceId,
      userId,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      status: 'succeeded',
      paymentIntentId: paymentIntent.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { invoiceId } = paymentIntent.metadata;

  if (invoiceId) {
    const invoiceRef = admin.firestore().collection('invoices').doc(invoiceId);
    
    await invoiceRef.update({
      status: 'Failed',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      lastError: paymentIntent.last_payment_error?.message || 'Payment failed',
    });
  }
}

/**
 * Checks the payment status of an invoice
 */
export const checkPaymentStatus = onCall(async (request: CallableRequest<CheckPaymentStatusData>) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { invoiceId } = request.data;

  if (!invoiceId) {
    throw new HttpsError('invalid-argument', 'Invoice ID is required.');
  }

  try {
    // Get the invoice details
    const invoiceRef = admin.firestore().collection('invoices').doc(invoiceId);
    const invoice = await invoiceRef.get();

    if (!invoice.exists) {
      throw new HttpsError('not-found', 'Invoice not found.');
    }

    const invoiceData = invoice.data();
    
    if (invoiceData?.status === 'Paid') {
      return { status: 'success' };
    } else if (invoiceData?.status === 'Processing') {
      return { status: 'processing' };
    } else {
      return { status: 'failed' };
    }
  } catch (error: unknown) {
    console.error('Error checking payment status:', error);
    if (error instanceof Error) {
      throw new HttpsError('internal', error.message);
    }
    throw new HttpsError('internal', 'An error occurred while checking payment status.');
  }
});

/**
 * Sends an email using SendGrid
 */
async function sendEmail(data: EmailData): Promise<void> {
  try {
    await sgMail.send({
      to: data.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@scopesentinel.com',
      subject: data.subject,
      text: data.text,
      html: data.html,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error sending email:', errorMessage);
    throw new HttpsError('internal', 'Failed to send email');
  }
}

/**
 * Sends an invoice email
 */
export const sendInvoiceEmail = functions.https.onCall<SendInvoiceEmailData>(async (request: CallableRequest<SendInvoiceEmailData>) => {
  try {
    const { invoiceId } = request.data;
    if (!invoiceId) {
      throw new Error('Invoice ID is required');
    }

    const invoiceDoc = await admin.firestore().collection('invoices').doc(invoiceId).get();
    if (!invoiceDoc.exists) {
      throw new Error('Invoice not found');
    }

    const invoiceData = invoiceDoc.data() as DocumentData;
    const invoice = convertToInvoice(invoiceData);
    const project = await getProjectDetails(invoice.projectId);

    const subject = invoice.status === 'paid' 
      ? `Invoice #${invoice.invoiceNumber} has been paid`
      : invoice.status === 'overdue'
      ? `Invoice #${invoice.invoiceNumber} is overdue`
      : invoice.status === 'created'
      ? `New Invoice #${invoice.invoiceNumber}`
      : `Invoice #${invoice.invoiceNumber} Updated`;

    const text = invoice.status === 'paid'
      ? `Invoice #${invoice.invoiceNumber} for ${project.name} has been marked as paid.`
      : invoice.status === 'overdue'
      ? `Invoice #${invoice.invoiceNumber} for ${project.name} is overdue. Please make payment as soon as possible.`
      : invoice.status === 'created'
      ? `A new invoice has been created for ${project.name}.`
      : `The invoice for ${project.name} has been updated.`;

    const html = invoice.status === 'paid'
      ? `
        <h2>Invoice Paid</h2>
        <p>Invoice #${invoice.invoiceNumber} for ${project.name} has been marked as paid.</p>
        <p>Thank you for your payment!</p>
      `
      : invoice.status === 'overdue'
      ? `
        <h2>Invoice Overdue</h2>
        <p>Invoice #${invoice.invoiceNumber} for ${project.name} is overdue.</p>
        <p>Please make payment as soon as possible.</p>
      `
      : invoice.status === 'created'
      ? `
        <h2>New Invoice</h2>
        <p>A new invoice has been created for ${project.name}.</p>
      `
      : `
        <h2>Invoice Updated</h2>
        <p>The invoice for ${project.name} has been updated.</p>
      `;

    await sendEmail({
      to: project.clientId,
      subject,
      text,
      html,
    });
  } catch (error: unknown) {
    console.error('Error sending invoice email:', error instanceof Error ? error.message : 'Unknown error');
    throw new functions.https.HttpsError('internal', error instanceof Error ? error.message : 'Unknown error');
  }
});

// Helper function to convert DocumentData to Invoice
function convertToInvoice(data: DocumentData): Invoice {
  return {
    id: data.id,
    invoiceNumber: data.invoiceNumber,
    total: data.total,
    currency: data.currency,
    dueDate: data.dueDate,
    status: data.status,
    projectId: data.projectId,
  };
}

// Helper function to convert DocumentData to Project
function convertToProject(data: DocumentData): Project {
  return {
    id: data.id,
    name: data.name,
    clientId: data.clientId,
  };
}

// Update the places where we call sendInvoiceEmail to use the conversion functions
export const onInvoiceStatusChange = onDocumentWritten('invoices/{invoiceId}', async (event: FirestoreEvent<Change<DocumentSnapshot> | undefined>) => {
  if (!event.data) return;

  try {
    const newData = event.data.after?.data();
    const previousData = event.data.before?.data();

    if (!newData || !previousData) {
      console.log('No data available');
      return;
    }

    const invoice = convertToInvoice(newData);
    const project = await getProjectDetails(invoice.projectId);

    if (newData.status !== previousData.status) {
      await handleInvoiceStatusChange(invoice, project);
    }
  } catch (error: unknown) {
    console.error('Error in onInvoiceStatusChange:', error instanceof Error ? error.message : 'Unknown error');
    throw new HttpsError('internal', 'Failed to process invoice status change');
  }
});

// Helper function to get project details
async function getProjectDetails(projectId: string): Promise<Project> {
  const projectDoc = await admin.firestore().collection('projects').doc(projectId).get();
  if (!projectDoc.exists) {
    throw new Error('Project not found');
  }
  return projectDoc.data() as Project;
}

// Helper function to handle invoice status change
async function handleInvoiceStatusChange(invoice: Invoice, project: Project): Promise<void> {
  const emailData = {
    subject: getEmailSubject(invoice),
    text: getEmailText(invoice, project),
    html: getEmailHtml(invoice, project),
    to: project.clientId
  };
  
  await sendEmail(emailData);
}

// Helper function to get email subject
function getEmailSubject(invoice: Invoice): string {
  if (invoice.status === 'paid') {
    return `Invoice #${invoice.invoiceNumber} has been paid`;
  } else if (invoice.status === 'overdue') {
    return `Invoice #${invoice.invoiceNumber} is overdue`;
  } else if (invoice.status === 'created') {
    return `New Invoice #${invoice.invoiceNumber}`;
  } else {
    return `Invoice #${invoice.invoiceNumber} Updated`;
  }
}

// Helper function to get email text
function getEmailText(invoice: Invoice, project: Project): string {
  if (invoice.status === 'paid') {
    return `Invoice #${invoice.invoiceNumber} for ${project.name} has been marked as paid.`;
  } else if (invoice.status === 'overdue') {
    return `Invoice #${invoice.invoiceNumber} for ${project.name} is overdue. Please make payment as soon as possible.`;
  } else if (invoice.status === 'created') {
    return `A new invoice has been created for ${project.name}.`;
  } else {
    return `The invoice for ${project.name} has been updated.`;
  }
}

// Helper function to get email HTML
function getEmailHtml(invoice: Invoice, project: Project): string {
  if (invoice.status === 'paid') {
    return `
      <h2>Invoice Paid</h2>
      <p>Invoice #${invoice.invoiceNumber} for ${project.name} has been marked as paid.</p>
      <p>Thank you for your payment!</p>
    `;
  } else if (invoice.status === 'overdue') {
    return `
      <h2>Invoice Overdue</h2>
      <p>Invoice #${invoice.invoiceNumber} for ${project.name} is overdue.</p>
      <p>Please make payment as soon as possible.</p>
    `;
  } else if (invoice.status === 'created') {
    return `
      <h2>New Invoice</h2>
      <p>A new invoice has been created for ${project.name}.</p>
    `;
  } else {
    return `
      <h2>Invoice Updated</h2>
      <p>The invoice for ${project.name} has been updated.</p>
    `;
  }
}

/**
 * Handles invoice creation
 */
export const onInvoiceCreated = onDocumentCreated('invoices/{invoiceId}', async (event: FirestoreEvent<QueryDocumentSnapshot | undefined>) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('No data associated with the event');
    return;
  }

  const invoiceData = snapshot.data() as DocumentData;
  const invoiceId = event.params?.invoiceId;

  if (!invoiceId) {
    console.error('No invoiceId found in event params');
    return;
  }

  try {
    // Get project details
    const projectRef = admin.firestore().collection('projects').doc(invoiceData.projectId);
    const project = await projectRef.get();
    
    if (!project.exists) {
      console.error('Project not found for invoice:', invoiceId);
      return;
    }

    const projectData = project.data() as DocumentData;
    const convertedProject = convertToProject(projectData);

    // Get client details
    const clientRef = admin.firestore().collection('clients').doc(convertedProject.clientId);
    const client = await clientRef.get();
    
    if (!client.exists) {
      console.error('Client not found for project:', convertedProject.id);
      return;
    }

    const clientData = client.data();

    // Convert and send email notification
    const invoice = convertToInvoice(invoiceData);
    await handleInvoiceStatusChange(invoice, convertedProject);
  } catch (error: unknown) {
    console.error('Error handling invoice creation:', error instanceof Error ? error.message : 'Unknown error');
  }
});

/**
 * Handles invoice updates
 */
export const onInvoiceUpdated = functions.firestore
  .onDocumentUpdated('invoices/{invoiceId}', async (event) => {
    const newData = event.data?.after.data();
    const previousData = event.data?.before.data();
    const invoiceId = event.params.invoiceId;

    if (!newData || !previousData) {
      console.error('No data associated with the event');
      return;
    }

    // Only send email if status changed to Paid
    if (newData.status === 'Paid' && previousData.status !== 'Paid') {
      try {
        // Get project details
        const projectRef = admin.firestore().collection('projects').doc(newData.projectId);
        const project = await projectRef.get();
        
        if (!project.exists) {
          console.error('Project not found for invoice:', invoiceId);
          return;
        }

        const projectData = project.data() as DocumentData;
        const convertedProject = convertToProject(projectData);

        // Get client details
        const clientRef = admin.firestore().collection('clients').doc(convertedProject.clientId);
        const client = await clientRef.get();
        
        if (!client.exists) {
          console.error('Client not found for project:', convertedProject.id);
          return;
        }

        const clientData = client.data();

        // Convert and send email notification
        const invoice = convertToInvoice(newData);
        await handleInvoiceStatusChange(invoice, convertedProject);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error handling invoice update:', errorMessage);
      }
    }
  });

// Helper function to create activity log
async function createActivityLog(data: Omit<ActivityLog, "id" | "timestamp">): Promise<void> {
  const activityRef = admin.firestore().collection("activityLogs").doc();
  await activityRef.set({
    ...data,
    id: activityRef.id,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Cloud Function to log feedback creation
export const onFeedbackCreate = onDocumentCreated("deliverables/{deliverableId}/feedback/{feedbackId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }

  const feedbackData = snapshot.data();
  const deliverableId = event.params.deliverableId;

  try {
    // Get deliverable details
    const deliverableDoc = await admin.firestore()
      .collection("deliverables")
      .doc(deliverableId)
      .get();
    
    if (!deliverableDoc.exists) {
      console.error("Deliverable not found:", deliverableId);
      return;
    }

    const deliverableData = deliverableDoc.data();
    const projectId = deliverableData?.projectId;

    // Get actor details
    const actorDoc = await admin.firestore()
      .collection("users")
      .doc(feedbackData.authorId)
      .get();

    const actorData = actorDoc.data();

    await createActivityLog({
      actionType: "feedback",
      actorId: feedbackData.authorId,
      actorName: actorData?.name || feedbackData.author,
      actorRole: actorData?.role || "unknown",
      projectId,
      deliverableId,
      message: `Added feedback: ${feedbackData.content.substring(0, 100)}${feedbackData.content.length > 100 ? "..." : ""}`,
      metadata: {
        feedbackId: snapshot.id,
        feedbackType: feedbackData.type,
        status: feedbackData.status,
      },
    });
  } catch (error) {
    console.error("Error creating feedback activity log:", error);
  }
});

// Cloud Function to log approval changes
export const onApprovalChange = onDocumentWritten("deliverables/{deliverableId}", async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  
  if (!beforeData || !afterData) {
    console.log("No data associated with the event");
    return;
  }

  // Only proceed if approval status has changed
  if (beforeData.approvalStatus === afterData.approvalStatus) {
    return;
  }

  const deliverableId = event.params.deliverableId;
  const projectId = afterData.projectId;

  try {
    // Get actor details (assuming the last user who modified the document is the actor)
    const actorId = afterData.updatedBy || afterData.approvedBy;
    let actorName = "Unknown";
    let actorRole = "unknown";

    if (actorId) {
      const actorDoc = await admin.firestore()
        .collection("users")
        .doc(actorId)
        .get();

      const actorData = actorDoc.data();
      actorName = actorData?.name || "Unknown";
      actorRole = actorData?.role || "unknown";
    }

    await createActivityLog({
      actionType: "approval",
      actorId: actorId || "system",
      actorName,
      actorRole,
      projectId,
      deliverableId,
      message: `Changed approval status from ${beforeData.approvalStatus} to ${afterData.approvalStatus}`,
      metadata: {
        previousStatus: beforeData.approvalStatus,
        newStatus: afterData.approvalStatus,
        approvedBy: afterData.approvedBy,
        approvedAt: afterData.approvedAt,
      },
    });
  } catch (error) {
    console.error("Error creating approval activity log:", error);
  }
});

// Cloud Function to log revision creation
export const onRevisionCreate = onDocumentCreated("deliverables/{deliverableId}/revisions/{revisionId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }

  const revisionData = snapshot.data();
  const deliverableId = event.params.deliverableId;

  try {
    // Get deliverable details
    const deliverableDoc = await admin.firestore()
      .collection("deliverables")
      .doc(deliverableId)
      .get();
    
    if (!deliverableDoc.exists) {
      console.error("Deliverable not found:", deliverableId);
      return;
    }

    const deliverableData = deliverableDoc.data();
    const projectId = deliverableData?.projectId;

    // Get actor details
    const actorDoc = await admin.firestore()
      .collection("users")
      .doc(revisionData.authorId)
      .get();

    const actorData = actorDoc.data();

    await createActivityLog({
      actionType: "revision",
      actorId: revisionData.authorId,
      actorName: actorData?.name || revisionData.author,
      actorRole: actorData?.role || "unknown",
      projectId,
      deliverableId,
      message: `Added revision ${revisionData.version}: ${revisionData.changes.substring(0, 100)}${revisionData.changes.length > 100 ? "..." : ""}`,
      metadata: {
        revisionId: snapshot.id,
        version: revisionData.version,
        status: revisionData.status,
        files: revisionData.files,
      },
    });
  } catch (error) {
    console.error("Error creating revision activity log:", error);
  }
});

