const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all expense routes
router.use(protect);

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add an expense
// @route   POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date, note } = req.body;

    if (!title || !amount || !category || !date) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date,
      note,
      user: req.user._id,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check for user
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this expense' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check for user
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this expense' });
    }

    await expense.deleteOne();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
