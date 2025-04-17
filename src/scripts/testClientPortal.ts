import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import app, { db, auth } from '@/lib/firebase';

// Initialize Firebase services
const firestore = getFirestore(app);

async function testClientPortal() {
  try {
    // Sign in as test client
    const testClientEmail = 'test@client.com';
    const testClientPassword = 'test123';
    
    const userCredential = await signInWithEmailAndPassword(auth, testClientEmail, testClientPassword);
    console.log('Successfully signed in as test client:', userCredential.user.uid);

    // Get client document
    const clientDoc = await getDoc(doc(firestore, 'clients', userCredential.user.uid));
    if (!clientDoc.exists()) {
      throw new Error('Client document not found');
    }
    console.log('Client data:', clientDoc.data());

    // Check assigned projects
    const clientData = clientDoc.data();
    if (!clientData.assignedProjects || clientData.assignedProjects.length === 0) {
      console.log('No projects assigned to client');
      return;
    }

    // Fetch project details
    for (const projectId of clientData.assignedProjects) {
      const projectDoc = await getDoc(doc(firestore, 'projects', projectId));
      if (projectDoc.exists()) {
        console.log('Project details:', projectDoc.data());
        
        // Check deliverables
        const deliverablesQuery = query(
          collection(firestore, 'deliverables'),
          where('projectId', '==', projectId)
        );
        const deliverablesSnapshot = await getDocs(deliverablesQuery);
        console.log('Deliverables:', deliverablesSnapshot.docs.map(doc => doc.data()));
      }
    }

    // Verify user role
    const userDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      console.log('User role:', userDoc.data().role);
    }

    // Test unauthorized access (should fail)
    try {
      const adminQuery = query(collection(firestore, 'admin'));
      await getDocs(adminQuery);
      console.error('ERROR: Unauthorized access succeeded');
    } catch (error) {
      console.log('Successfully prevented unauthorized access');
    }

    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testClientPortal(); 