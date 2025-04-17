import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl012MnO",
  authDomain: "scope-53569.firebaseapp.com",
  projectId: "scope-53569",
  storageBucket: "scope-53569.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl",
  measurementId: "G-ABC123DEF45"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface CreateUserParams {
  email: string;
  password: string;
  role: 'admin' | 'client';
  name: string;
}

async function createUser({ email, password, role, name }: CreateUserParams) {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Set user role and details in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role,
      name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`${role} user created successfully:`, user.uid);
    return user.uid;
  } catch (error: any) {
    console.error(`Error creating ${role} user:`, error.message);
    throw error;
  }
}

// Create admin account
const adminAccount = {
  email: 'admin@scopesentinel.com',
  password: 'Admin123!',
  role: 'admin' as const,
  name: 'Admin User'
};

// Create client account
const clientAccount = {
  email: 'client@scopesentinel.com',
  password: 'Client123!',
  role: 'client' as const,
  name: 'Client User'
};

// Function to set up both accounts
async function setupAccounts() {
  try {
    console.log('Setting up accounts...');
    
    // Create admin account
    const adminId = await createUser(adminAccount);
    console.log('Admin account created with ID:', adminId);
    
    // Create client account
    const clientId = await createUser(clientAccount);
    console.log('Client account created with ID:', clientId);
    
    console.log('All accounts created successfully!');
    console.log('\nAccount Credentials:');
    console.log('Admin:', adminAccount.email, adminAccount.password);
    console.log('Client:', clientAccount.email, clientAccount.password);
    
  } catch (error: any) {
    console.error('Error setting up accounts:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupAccounts().then(() => {
  console.log('Setup completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
}); 