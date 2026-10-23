require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Expense = require('./models/Expense');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
  res.send('SpendWise API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

mongoose.connect(uri, { family: 4 })
.then(async () => {
  console.log('MongoDB connected successfully');
  try {
    const adminExists = await User.findOne({ email: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin',
        password: 'admin123'
      });
      console.log('Admin user seeded automatically.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (seedErr) {
    console.error('Error seeding admin:', seedErr);
  }
})
.catch((err) => console.error('MongoDB connection error:', err));
