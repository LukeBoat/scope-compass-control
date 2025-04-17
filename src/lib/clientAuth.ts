import { auth, db } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

/**
 * Sets custom claims for a client user
 * This function should be called from a secure server environment (Cloud Functions)
 * @param clientId The ID of the client
 * @param uid The user ID to set claims for
 */
export async function setClientClaims(clientId: string, uid: string): Promise<void> {
  try {
    // This function should be called from a secure server environment
    // For client-side, we'll use a Cloud Function
    const setClientClaimsFunction = httpsCallable(functions, 'setClientClaims');
    await setClientClaimsFunction({ clientId, uid });
  } catch (error) {
    console.error('Error setting client claims:', error);
    throw error;
  }
}

/**
 * Gets the current user's client ID from custom claims
 * @returns The client ID if the user has client claims, null otherwise
 */
export function getCurrentClientId(): string | null {
  const user = auth.currentUser;
  if (!user) return null;
  
  // Get the ID token result which includes custom claims
  return user.getIdTokenResult().then(idTokenResult => {
    return idTokenResult.claims.clientId || null;
  });
}

/**
 * Checks if the current user is a client
 * @returns A promise that resolves to true if the user is a client, false otherwise
 */
export async function isCurrentUserClient(): Promise<boolean> {
  const clientId = await getCurrentClientId();
  return clientId !== null;
}

/**
 * Gets the client document for the current user
 * @returns A promise that resolves to the client document if the user is a client, null otherwise
 */
export async function getCurrentClient() {
  const clientId = await getCurrentClientId();
  if (!clientId) return null;
  
  try {
    const clientDoc = await db.collection('clients').doc(clientId).get();
    if (!clientDoc.exists) return null;
    
    return { id: clientDoc.id, ...clientDoc.data() };
  } catch (error) {
    console.error('Error getting client document:', error);
    return null;
  }
}

/**
 * Gets all projects assigned to the current client
 * @returns A promise that resolves to an array of project documents
 */
export async function getCurrentClientProjects() {
  const clientId = await getCurrentClientId();
  if (!clientId) return [];
  
  try {
    const projectsQuery = await db.collection('projects')
      .where('clients', 'array-contains', clientId)
      .get();
    
    return projectsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting client projects:', error);
    return [];
  }
} 