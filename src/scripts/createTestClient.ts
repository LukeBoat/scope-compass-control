import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseConfig } from '@/lib/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Test client credentials
const TEST_CLIENT_EMAIL = 'test.client@example.com';
const TEST_CLIENT_PASSWORD = 'TestClient123!';
const TEST_CLIENT_NAME = 'Test Client';

// Test project data
const TEST_PROJECT = {
  name: 'Test Project for Client Portal',
  description: 'This is a test project to verify client portal functionality',
  status: 'Active',
  progress: 0,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  deliverables: []
};

async function createTestClient() {
  try {
    console.log('Creating test client account...');
    
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      TEST_CLIENT_EMAIL,
      TEST_CLIENT_PASSWORD
    );
    
    const user = userCredential.user;
    console.log('User account created:', user.uid);
    
    // Create client document
    const clientRef = doc(db, 'clients', user.uid);
    await setDoc(clientRef, {
      name: TEST_CLIENT_NAME,
      email: TEST_CLIENT_EMAIL,
      assignedProjects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('Client document created');
    
    // Create test project
    const projectRef = await addDoc(collection(db, 'projects'), TEST_PROJECT);
    console.log('Test project created:', projectRef.id);
    
    // Add some test deliverables
    const deliverables = [
      {
        name: 'Initial Design',
        description: 'Initial design mockups for review',
        status: 'in_review',
        fileUrl: 'https://example.com/design.pdf',
        notes: 'Please review the attached design mockups',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Project Plan',
        description: 'Detailed project plan and timeline',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    for (const deliverable of deliverables) {
      const deliverableRef = await addDoc(collection(db, 'deliverables'), {
        ...deliverable,
        projectId: projectRef.id
      });
      console.log('Deliverable created:', deliverableRef.id);
    }
    
    // Assign project to client
    await updateDoc(clientRef, {
      assignedProjects: [projectRef.id],
      updatedAt: new Date().toISOString()
    });
    
    // Update project with client reference
    await updateDoc(projectRef, {
      clients: [user.uid]
    });
    
    console.log('Project assigned to client');
    
    // Set client role using custom claims
    const setClientRole = httpsCallable(functions, 'setClientRole');
    await setClientRole({ userId: user.uid });
    
    console.log('Client role set successfully');
    console.log('Test client setup complete!');
    console.log('Email:', TEST_CLIENT_EMAIL);
    console.log('Password:', TEST_CLIENT_PASSWORD);
    
  } catch (error) {
    console.error('Error creating test client:', error);
  }
}

// Run the function
createTestClient(); 