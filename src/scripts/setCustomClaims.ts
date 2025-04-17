import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with service account
const serviceAccount = {
  "type": "service_account",
  "project_id": "scope-53569",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "YOUR_PRIVATE_KEY",
  "client_email": "YOUR_CLIENT_EMAIL",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "YOUR_CERT_URL"
};

// Initialize the admin app
initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

async function setCustomClaims() {
  try {
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Set custom claims based on user role
      if (userData.role === 'admin') {
        await auth.setCustomUserClaims(userId, {
          admin: true,
          role: 'admin'
        });
        console.log(`Set admin claims for user ${userId}`);
      } else if (userData.role === 'client') {
        await auth.setCustomUserClaims(userId, {
          client: true,
          role: 'client'
        });
        console.log(`Set client claims for user ${userId}`);
      }
      
      // Update the user document to indicate claims have been set
      await userDoc.ref.update({
        claimsSet: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log('All custom claims have been set successfully');
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw error;
  }
}

// Run the script
setCustomClaims()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 