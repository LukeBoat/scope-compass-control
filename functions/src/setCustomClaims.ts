import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse the service account key
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8')
);

// Initialize the admin app
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://scope-53569-default-rtdb.europe-west1.firebasedatabase.app"
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
        updatedAt: FieldValue.serverTimestamp()
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