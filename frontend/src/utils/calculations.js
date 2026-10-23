export const calculateTotal = (expenses) => {
  return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
};

export const calculateThisMonthTotal = (expenses) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  return calculateTotal(thisMonthExpenses);
};

export const calculateTodayTotal = (expenses) => {
  const today = new Date().toISOString().split('T')[0];

  const todayExpenses = expenses.filter((exp) => exp.date === today);

  return calculateTotal(todayExpenses);
};

export const getExpensesByCategory = (expenses) => {
  const categoryTotals = {};

  expenses.forEach((exp) => {
    if (categoryTotals[exp.category]) {
      categoryTotals[exp.category] += parseFloat(exp.amount);
    } else {
      categoryTotals[exp.category] = parseFloat(exp.amount);
    }
  });

  return Object.keys(categoryTotals).map((category) => ({
    category,
    total: categoryTotals[category],
  })).sort((a, b) => b.total - a.total);
};

export const getHighestSpendingCategory = (expenses) => {
  const byCategory = getExpensesByCategory(expenses);
  return byCategory.length > 0 ? byCategory[0].category : 'N/A';
};

export const calculateAverageDailySpending = (expenses) => {
  if (expenses.length === 0) return 0;
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });

  const totalThisMonth = calculateTotal(thisMonthExpenses);
  const currentDay = now.getDate();
  
  return totalThisMonth / currentDay;
};
