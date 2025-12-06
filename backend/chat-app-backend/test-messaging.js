import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Test data
let user1Token = '';
let user2Token = '';
let user1Id = '';
let user2Id = '';

// Helper function to print test results
function printResult(testName, success, data = null, error = null) {
    console.log('\n' + '='.repeat(50));
    console.log(`TEST: ${testName}`);
    console.log('='.repeat(50));
    if (success) {
        console.log('✅ PASSED');
        if (data) console.log('Response:', JSON.stringify(data, null, 2));
    } else {
        console.log('❌ FAILED');
        if (error) console.log('Error:', error.message || error);
    }
}

// Test 1: Signup User 1
async function testSignupUser1() {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
            fullName: 'Test User One',
            email: `testuser1_${Date.now()}@test.com`,
            password: 'password123'
        });
        user1Id = response.data._id;
        user1Token = response.headers['set-cookie']?.[0] || '';
        printResult('Signup User 1', true, response.data);
        return true;
    } catch (error) {
        printResult('Signup User 1', false, null, error.response?.data || error.message);
        return false;
    }
}

// Test 2: Signup User 2
async function testSignupUser2() {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
            fullName: 'Test User Two',
            email: `testuser2_${Date.now()}@test.com`,
            password: 'password123'
        });
        user2Id = response.data._id;
        user2Token = response.headers['set-cookie']?.[0] || '';
        printResult('Signup User 2', true, response.data);
        return true;
    } catch (error) {
        printResult('Signup User 2', false, null, error.response?.data || error.message);
        return false;
    }
}

// Test 3: Get Users for Sidebar
async function testGetUsers() {
    try {
        const response = await axios.get(`${BASE_URL}/api/message/users`, {
            headers: {
                Cookie: user1Token
            }
        });
        printResult('Get Users for Sidebar', true, response.data);
        return true;
    } catch (error) {
        printResult('Get Users for Sidebar', false, null, error.response?.data || error.message);
        return false;
    }
}

// Test 4: Send Text Message
async function testSendTextMessage() {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/message/send/${user2Id}`,
            { text: 'Hello from User 1! This is a test message.' },
            {
                headers: {
                    Cookie: user1Token
                }
            }
        );
        printResult('Send Text Message', true, response.data);
        return true;
    } catch (error) {
        printResult('Send Text Message', false, null, error.response?.data || error.message);
        return false;
    }
}

// Test 5: Send Message Without Content (should fail)
async function testSendEmptyMessage() {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/message/send/${user2Id}`,
            {},
            {
                headers: {
                    Cookie: user1Token
                }
            }
        );
        printResult('Send Empty Message (Should Fail)', false, response.data);
        return false;
    } catch (error) {
        if (error.response?.status === 400) {
            printResult('Send Empty Message (Should Fail)', true, error.response.data);
            return true;
        }
        printResult('Send Empty Message (Should Fail)', false, null, error.response?.data || error.message);
        return false;
    }
}

// Test 6: Get Messages Between Users
async function testGetMessages() {
    try {
        const response = await axios.get(
            `${BASE_URL}/api/message/${user2Id}`,
            {
                headers: {
                    Cookie: user1Token
                }
            }
        );
        printResult('Get Messages', true, response.data);
        return true;
    } catch (error) {
        printResult('Get Messages', false, null, error.response?.data || error.message);
        return false;
    }
}

// Test 7: User 2 sends reply
async function testSendReply() {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/message/send/${user1Id}`,
            { text: 'Hello back from User 2! Got your message!' },
            {
                headers: {
                    Cookie: user2Token
                }
            }
        );
        printResult('Send Reply Message', true, response.data);
        return true;
    } catch (error) {
        printResult('Send Reply Message', false, null, error.response?.data || error.message);
        return false;
    }
}

// Test 8: Get Full Conversation
async function testGetFullConversation() {
    try {
        const response = await axios.get(
            `${BASE_URL}/api/message/${user2Id}`,
            {
                headers: {
                    Cookie: user1Token
                }
            }
        );
        printResult('Get Full Conversation', true, response.data);
        return true;
    } catch (error) {
        printResult('Get Full Conversation', false, null, error.response?.data || error.message);
        return false;
    }
}

// Test 9: Test Pagination
async function testPagination() {
    try {
        // Send multiple messages first
        for (let i = 1; i <= 5; i++) {
            await axios.post(
                `${BASE_URL}/api/message/send/${user2Id}`,
                { text: `Message number ${i}` },
                {
                    headers: {
                        Cookie: user1Token
                    }
                }
            );
        }

        // Get with pagination
        const response = await axios.get(
            `${BASE_URL}/api/message/${user2Id}?page=1&limit=3`,
            {
                headers: {
                    Cookie: user1Token
                }
            }
        );
        printResult('Test Pagination (limit=3)', true, response.data);
        return true;
    } catch (error) {
        printResult('Test Pagination', false, null, error.response?.data || error.message);
        return false;
    }
}

// Test 10: Send to Non-existent User (should fail)
async function testSendToNonExistentUser() {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/message/send/507f1f77bcf86cd799439011`, // fake ID
            { text: 'This should fail' },
            {
                headers: {
                    Cookie: user1Token
                }
            }
        );
        printResult('Send to Non-existent User (Should Fail)', false, response.data);
        return false;
    } catch (error) {
        if (error.response?.status === 404) {
            printResult('Send to Non-existent User (Should Fail)', true, error.response.data);
            return true;
        }
        printResult('Send to Non-existent User (Should Fail)', false, null, error.response?.data || error.message);
        return false;
    }
}

// Test 11: Check Auth
async function testCheckAuth() {
    try {
        const response = await axios.get(
            `${BASE_URL}/api/auth/check`,
            {
                headers: {
                    Cookie: user1Token
                }
            }
        );
        printResult('Check Auth', true, response.data);
        return true;
    } catch (error) {
        printResult('Check Auth', false, null, error.response?.data || error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🚀 Starting Messaging Functionality Tests...\n');
    
    const results = [];
    
    // Authentication tests
    results.push(await testSignupUser1());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testSignupUser2());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testCheckAuth());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Messaging tests
    results.push(await testGetUsers());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testSendTextMessage());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testSendEmptyMessage());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testGetMessages());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testSendReply());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testGetFullConversation());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testPagination());
    await new Promise(resolve => setTimeout(resolve, 500));
    
    results.push(await testSendToNonExistentUser());
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    console.log('='.repeat(50));
    
    process.exit(passed === total ? 0 : 1);
}

// Run the tests
runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
