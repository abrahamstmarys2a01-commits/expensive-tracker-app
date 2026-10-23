require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // require before connect

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

mongoose.connection.on('connected', () => console.log('Mongoose connected event fired!'));

mongoose.connect(uri, { family: 4 })
.then(async () => {
  console.log('MongoDB connected successfully');
  try {
    await User.findOne({ email: 'admin' });
    console.log('Query successful!');
    process.exit(0);
  } catch (err) {
    console.error('Query failed:', err);
    process.exit(1);
  }
})
.catch(err => {
  console.error('Connection failed:', err);
  process.exit(1);
});
