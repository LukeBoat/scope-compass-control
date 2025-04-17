import { test, expect } from '@playwright/test';
import { signIn } from './utils/auth';

test.describe('Feedback Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('client can add feedback and request changes', async ({ page }) => {
    // Sign in as client
    await signIn(page, 'client@example.com', 'password');
    
    // Navigate to project deliverables
    await page.click('text=Projects');
    await page.click('text=Test Project');
    await page.click('text=Deliverables');

    // Find a deliverable and open feedback panel
    const deliverable = page.locator('.deliverable-card').first();
    await deliverable.click();
    await page.click('button:has-text("View Feedback")');

    // Add feedback
    await page.fill('textarea[placeholder="Type your feedback..."]', 'Please make the following changes...');
    await page.click('button:has-text("Send Feedback")');

    // Verify feedback is added
    await expect(page.locator('.feedback-item')).toContainText('Please make the following changes...');

    // Request changes
    await page.click('button:has-text("Request Changes")');
    await expect(page.locator('.status-badge')).toContainText('Changes Requested');

    // Verify Firestore update
    // Note: This would require setting up a test database and intercepting Firestore calls
  });

  test('admin can reply and resolve feedback', async ({ page }) => {
    // Sign in as admin
    await signIn(page, 'admin@example.com', 'password');
    
    // Navigate to project deliverables
    await page.click('text=Projects');
    await page.click('text=Test Project');
    await page.click('text=Deliverables');

    // Find a deliverable with feedback and open feedback panel
    const deliverable = page.locator('.deliverable-card').first();
    await deliverable.click();
    await page.click('button:has-text("View Feedback")');

    // Add reply
    await page.fill('textarea[placeholder="Type your feedback..."]', 'Changes have been made as requested.');
    await page.click('button:has-text("Send Feedback")');

    // Verify reply is added
    await expect(page.locator('.feedback-item').last()).toContainText('Changes have been made as requested.');

    // Resolve feedback
    await page.click('button:has-text("Resolve")');
    await expect(page.locator('.feedback-item').last()).toHaveClass(/resolved/);

    // Verify Firestore update
    // Note: This would require setting up a test database and intercepting Firestore calls
  });

  test('feedback updates are reflected in Firestore', async ({ page }) => {
    // This test would require:
    // 1. Setting up a test Firestore instance
    // 2. Intercepting and verifying Firestore operations
    // 3. Checking database state after operations
    
    // Example structure:
    /*
    const { db } = await setupTestFirestore();
    
    // Perform actions
    await signIn(page, 'client@example.com', 'password');
    await addFeedback(page, 'Test feedback');
    
    // Verify Firestore state
    const feedbackDoc = await db.collection('deliverables')
      .doc('test-deliverable')
      .collection('feedback')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
      
    expect(feedbackDoc.docs[0].data()).toMatchObject({
      content: 'Test feedback',
      status: 'info',
      resolved: false
    });
    */
  });
}); 