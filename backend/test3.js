require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Expense = require('./models/Expense');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.listen(5002, () => console.log('Listening on 5002'));
app.use('/api/auth', authRoutes);
const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

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
