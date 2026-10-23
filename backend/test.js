require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
console.log('URI:', uri.substring(0, 15));

mongoose.connect(uri, { family: 4 }) // Testing with family: 4
.then(async () => {
  console.log('MongoDB connected successfully');
  const User = mongoose.model('User', new mongoose.Schema({ email: String }));
  try {
    console.log('Running findOne...');
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
