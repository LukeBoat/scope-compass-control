import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import app, { auth, db } from '@/lib/firebase';

async function setupTestClient() {
  try {
    // Create test client account
    const testClientEmail = 'test@client.com';
    const testClientPassword = 'test123';
    
    const userCredential = await createUserWithEmailAndPassword(auth, testClientEmail, testClientPassword);
    const userId = userCredential.user.uid;
    console.log('Created test client account:', userId);

    // Create client document
    await setDoc(doc(db, 'clients', userId), {
      name: 'Test Client',
      email: testClientEmail,
      assignedProjects: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created client document');

    // Create user document with client role
    await setDoc(doc(db, 'users', userId), {
      email: testClientEmail,
      role: 'client',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created user document with client role');

    // Create a test project
    const projectRef = await addDoc(collection(db, 'projects'), {
      name: 'Test Project',
      description: 'A test project for client portal testing',
      status: 'active',
      clients: [userId],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created test project:', projectRef.id);

    // Update client's assigned projects
    await setDoc(doc(db, 'clients', userId), {
      assignedProjects: [projectRef.id],
      updatedAt: new Date()
    }, { merge: true });
    console.log('Updated client with assigned project');

    // Create a test deliverable
    await addDoc(collection(db, 'deliverables'), {
      projectId: projectRef.id,
      name: 'Test Deliverable',
      description: 'A test deliverable for client portal testing',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created test deliverable');

    console.log('Test client setup completed successfully!');
  } catch (error) {
    console.error('Error setting up test client:', error);
  }
}

// Run the setup
setupTestClient(); 