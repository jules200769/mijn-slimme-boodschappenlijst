const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Demo user data
const demoUser = {
  name: 'Demo User',
  email: 'demo@example.com',
  password: 'demo123'
};

async function testBackend() {
  console.log('🧪 Testing check it! Backend API...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/register`, demoUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    const token = registerResponse.data.token;
    console.log('Token received:', token.substring(0, 20) + '...\n');

    // Test 2: Login with the same user
    console.log('2. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: demoUser.email,
      password: demoUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('User:', loginResponse.data.user.name, '\n');

    // Test 3: Get user profile (protected route)
    console.log('3. Testing protected profile route...');
    const profileResponse = await axios.get(`${BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profile retrieved successfully');
    console.log('User profile:', profileResponse.data.user.name, '\n');

    // Test 4: Update user profile
    console.log('4. Testing profile update...');
    const updateResponse = await axios.put(`${BASE_URL}/profile`, {
      name: 'Updated Demo User'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profile updated successfully:', updateResponse.data.message, '\n');

    console.log('🎉 All backend tests passed! The API is working correctly.');
    console.log('\n📱 You can now test the mobile app with:');
    console.log('   - Email: demo@example.com');
    console.log('   - Password: demo123');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the demo
testBackend(); 