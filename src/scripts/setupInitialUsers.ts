import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOSfz3RQH96vXfBW33uhxla2miQSNPp3g",
  authDomain: "scope-53569.firebaseapp.com",
  projectId: "scope-53569",
  storageBucket: "scope-53569.firebasestorage.app",
  messagingSenderId: "436099853043",
  appId: "1:436099853043:web:8b90b7a2c0290b088ee586",
  measurementId: "G-V1JGZEW2LJ",
  databaseURL: "https://scope-53569-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setupInitialUsers() {
  try {
    // Create admin user
    const adminEmail = 'admin@scopesentinel.com';
    const adminPassword = 'Admin123!';
    
    console.log('Creating admin user...');
    const adminCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUser = adminCredential.user;

    // Set admin role in Firestore
    await setDoc(doc(db, 'users', adminUser.uid), {
      email: adminEmail,
      role: 'admin',
      name: 'Admin User',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Admin user created successfully:', adminUser.uid);

    // Create client user
    const clientEmail = 'client@scopesentinel.com';
    const clientPassword = 'Client123!';
    
    console.log('Creating client user...');
    const clientCredential = await createUserWithEmailAndPassword(auth, clientEmail, clientPassword);
    const clientUser = clientCredential.user;

    // Set client role in Firestore
    await setDoc(doc(db, 'users', clientUser.uid), {
      email: clientEmail,
      role: 'client',
      name: 'Client User',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Client user created successfully:', clientUser.uid);

    console.log('All users created successfully!');
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
}

// Run the setup
setupInitialUsers()
  .then(() => console.log('Setup completed successfully'))
  .catch((error) => console.error('Setup failed:', error)); 