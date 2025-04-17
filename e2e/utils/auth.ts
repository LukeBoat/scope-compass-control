import { Page } from '@playwright/test';

export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation after successful login
  await page.waitForURL('/dashboard');
}

export async function signOut(page: Page) {
  await page.click('button[aria-label="Open user menu"]');
  await page.click('button:has-text("Sign out")');
  
  // Wait for navigation after logout
  await page.waitForURL('/login');
}

export async function setupTestUser(role: 'client' | 'admin') {
  // This would integrate with your Firebase Admin SDK to create test users
  // Example implementation:
  /*
  const { auth, db } = await initializeTestFirebase();
  
  const userCredential = await auth.createUser({
    email: `${role}@example.com`,
    password: 'password',
  });

  await db.collection('users').doc(userCredential.uid).set({
    role,
    name: `Test ${role}`,
    email: `${role}@example.com`,
  });

  return userCredential;
  */
} 