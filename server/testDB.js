const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

console.log('MONGO_URI from env:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully!');
    
    try {
      // Create a test user
      const testUser = new User({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        phone: '1234567890',
        role: 'user'
      });
      
      // Save the user
      const savedUser = await testUser.save();
      console.log('Test user saved successfully:');
      console.log(savedUser);
      
      // Find all users
      const allUsers = await User.find({});
      console.log(`Total users in database: ${allUsers.length}`);
      console.log('User emails:', allUsers.map(user => user.email));
      
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
      
    } catch (error) {
      console.error('Error creating test user:', error);
      await mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 