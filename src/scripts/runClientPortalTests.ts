import { setupTestClient } from './setupTestClient';
import { testClientPortal } from './testClientPortal';

async function runTests() {
  try {
    console.log('Starting client portal tests...');
    
    // First set up the test client
    console.log('\nSetting up test client...');
    await setupTestClient();
    
    // Then run the tests
    console.log('\nRunning client portal tests...');
    await testClientPortal();
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests(); 