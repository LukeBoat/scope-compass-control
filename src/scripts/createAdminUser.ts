import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface CreateAdminUserParams {
  email: string;
  password: string;
}

export async function createAdminUser({ email, password }: CreateAdminUserParams) {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Set admin role in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Admin user created successfully:', user.uid);
    return user.uid;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Example usage:
// createAdminUser({
//   email: 'admin@example.com',
//   password: 'secure-password'
// }); 