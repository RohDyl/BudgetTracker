document.addEventListener('DOMContentLoaded', () => {
// --- DOM Elements ---
const dateInput = document.getElementById('dateInput');
const incomeInput = document.getElementById('incomeInput');
const expenseCategoryInput = document.getElementById('expenseCategoryInput');
const expenseAmountInput = document.getElementById('expenseAmountInput');
const descriptionInput = document.getElementById('descriptionInput');
const addEntryBtn = document.getElementById('addEntryBtn');
const budgetEntriesList = document.getElementById('budgetEntriesList');
const clearAllDataBtn = document.getElementById('clearAllDataBtn');

const selectedDateDisplay = document.getElementById('selectedDateDisplay');
const dailyIncomeDisplay = document.getElementById('dailyIncomeDisplay');
const dailyExpenseDisplay = document.getElementById('dailyExpenseDisplay');
const dailyBalanceDisplay = document.getElementById('dailyBalanceDisplay');

const overallIncomeDisplay = document.getElementById('overallIncomeDisplay');
const overallExpenseDisplay = document.getElementById('overallExpenseDisplay');
const overallBalanceDisplay = document.getElementById('overallBalanceDisplay');

const filterDateInput = document.getElementById('filterDate');
const clearFilterBtn = document.getElementById('clearFilterBtn');

const budgetLimitsContainer = document.getElementById('budgetLimitsContainer');
const saveBudgetLimitsBtn = document.getElementById('saveBudgetLimitsBtn');
const monthlyBudgetUsageContainer = document.getElementById('monthlyBudgetUsageContainer');

// --- Data Storage ---
let budgetEntries = JSON.parse(localStorage.getItem('budgetEntries')) || [];
let monthlyBudgets = JSON.parse(localStorage.getItem('monthlyBudgets')) || {};

// --- Comprehensive Default Categories ---
const defaultCategories = {
    'Monthly Fixed Expenses': [
        'Rent/Mortgage', 'Rates & Taxes', 'Security', 'Electricity', 'Water',
        'Internet', 'Cell Phone', 'Insurance (Home/Car)', 'Loan Repayments',
        'Childcare/School Fees', 'HOA/Body Corporate Fees', 'Waste Management'
    ],
    'Monthly Variable Expenses': [
        'Groceries', 'Fuel/Petrol', 'Public Transport', 'Vehicle Maintenance',
        'Dining Out/Takeaways', 'Personal Care', 'Clothing', 'Entertainment',
        'Health/Medical', 'Pet Care', 'Gifts/Donations', 'Subscriptions (Other)',
        'Home Maintenance Fund', 'Miscellaneous', 'Coffee/Snacks', 'Parking/Tolls'
    ],
    'Savings & Investments': [
        'Emergency Fund', 'Retirement Savings', 'Investments', 'Holiday Fund',
        'New Car Fund', 'Education Fund', 'Large Purchase Fund'
    ],
    'Debt Repayments (Non-Mortgage)': [
        'Credit Card Payments', 'Personal Loans', 'Student Loans'
    ]
};

// --- Initial Setup ---
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const todayFormatted = `${year}-${month}-${day}`;
dateInput.value = todayFormatted;
filterDateInput.value = todayFormatted;

// --- Helper Functions ---

// Get current month in YYYY-MM format
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// --- Data Persistence Functions ---

function saveBudgetEntries() {
    localStorage.setItem('budgetEntries', JSON.stringify(budgetEntries));
}

function saveMonthlyBudgets() {
    localStorage.setItem('monthlyBudgets', JSON.stringify(monthlyBudgets));
}

// --- UI Population Functions ---

function populateExpenseCategories() {
    expenseCategoryInput.innerHTML = ''; // Clear existing options

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Category';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    expenseCategoryInput.appendChild(defaultOption);

    for (const group in defaultCategories) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group;
        defaultCategories[group].forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            optgroup.appendChild(option);
        });
        expenseCategoryInput.appendChild(optgroup);
    }
}

function renderBudgetLimits() {
    budgetLimitsContainer.innerHTML = ''; // Clear existing inputs

    const allCategories = [];
    for (const group in defaultCategories) {
        allCategories.push(...defaultCategories[group]);
    }
    allCategories.sort(); // Sort alphabetically for consistent display

    allCategories.forEach(category => {
        const div = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = category + ':';
        // Create a valid ID by replacing spaces and special chars
        const inputId = `budget-${category.replace(/[^a-zA-Z0-9]/g, '')}`;
        label.setAttribute('for', inputId);

        const input = document.createElement('input');
        input.type = 'number';
        input.id = inputId;
        input.placeholder = 'R0.00';
        input.value = monthlyBudgets[category] || ''; // Pre-fill if a limit exists

        div.appendChild(label);
        div.appendChild(input);
        budgetLimitsContainer.appendChild(div);
    });
}

// --- Summary and Display Functions ---

function updateMonthlyBudgetUsage() {
    monthlyBudgetUsageContainer.innerHTML = ''; // Clear existing display

    const currentMonth = getCurrentMonth();

    const monthlySpent = {};
    budgetEntries.forEach(entry => {
        // Ensure it's an expense, from the current month, and has a category
        if (entry.type === 'expense' && entry.date.startsWith(currentMonth) && entry.category) {
            monthlySpent[entry.category] = (monthlySpent[entry.category] || 0) + entry.amount;
        }
    });

    const allCategories = [];
    for (const group in defaultCategories) {
        allCategories.push(...defaultCategories[group]);
    }
    allCategories.sort();

    let hasBudgetsToDisplay = false;
    allCategories.forEach(category => {
        const limit = monthlyBudgets[category];
        if (limit !== undefined && limit > 0) { // Only show categories with a set, positive limit
            hasBudgetsToDisplay = true;
            const spent = monthlySpent[category] || 0;
            const percentage = (spent / limit * 100).toFixed(2);

            const div = document.createElement('div');
            div.classList.add('monthly-budget-usage-item');

            const categoryNameSpan = document.createElement('span');
            categoryNameSpan.classList.add('category-name');
            categoryNameSpan.textContent = category;

            const usageAmountsSpan = document.createElement('span');
            usageAmountsSpan.classList.add('usage-amounts');
            usageAmountsSpan.innerHTML = `R${spent.toFixed(2)} / R${limit.toFixed(2)}`;

            const percentageSpan = document.createElement('span');
            percentageSpan.classList.add('percentage');
            if (parseFloat(percentage) > 100) {
                percentageSpan.classList.add('over-budget');
            } else {
                percentageSpan.classList.remove('over-budget'); // Ensure class is removed if no longer over
                if (parseFloat(percentage) > 0) { // Only add under-budget if some spending occurred
                    percentageSpan.classList.add('under-budget');
                }
            }
            percentageSpan.textContent = ` (${percentage}%)`;

            usageAmountsSpan.appendChild(percentageSpan);
            div.appendChild(categoryNameSpan);
            div.appendChild(usageAmountsSpan);
            monthlyBudgetUsageContainer.appendChild(div);
        }
    });

    if (!hasBudgetsToDisplay) {
        monthlyBudgetUsageContainer.innerHTML = '<p style="text-align: center; font-style: italic; color: #777;">No monthly budget limits set or all limits are zero. Set them above!</p>';
    }
}

function renderEntries(filterDate = null) {
    budgetEntriesList.innerHTML = ''; // Clear existing entries

    let filteredEntries = budgetEntries;
    if (filterDate) {
        filteredEntries = budgetEntries.filter(entry => entry.date === filterDate);
    }

    if (filteredEntries.length === 0) {
        const li = document.createElement('li');
        li.textContent = filterDate ? "No entries for this date." : "No entries yet. Add one!";
        li.style.textAlign = 'center';
        li.style.fontStyle = 'italic';
        li.style.color = '#777';
        budgetEntriesList.appendChild(li);
        return;
    }

    // Sort entries by date (newest first)
    filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredEntries.forEach((entry) => {
        const li = document.createElement('li');

        const entryDetails = document.createElement('div');
        entryDetails.classList.add('entry-details');

        const entryDateSpan = document.createElement('span');
        entryDateSpan.classList.add('entry-date');
        entryDateSpan.textContent = entry.date;

        const entryDescriptionSpan = document.createElement('span');
        entryDescriptionSpan.classList.add('entry-description');
        entryDescriptionSpan.textContent = entry.description ? ` (${entry.description})` : '';

        const entryCategorySpan = document.createElement('span');
        entryCategorySpan.classList.add('entry-category');
        // Only show category for expenses
        entryCategorySpan.textContent = entry.type === 'expense' && entry.category ? `Category: ${entry.category}` : '';

        const entryAmountSpan = document.createElement('span');
        entryAmountSpan.classList.add('entry-amount');
        entryAmountSpan.textContent = `R${entry.amount.toFixed(2)}`;
        entryAmountSpan.classList.add(entry.type); // 'income' or 'expense'

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteEntry(entry.id));

        entryDetails.appendChild(entryDateSpan);
        entryDetails.appendChild(entryDescriptionSpan);
        if (entry.type === 'expense' && entry.category) { // Only append if it's an expense with a category
            entryDetails.appendChild(entryCategorySpan);
        }

        li.appendChild(entryDetails);
        li.appendChild(entryAmountSpan);
        li.appendChild(deleteBtn);

        budgetEntriesList.appendChild(li);
    });
}

function updateDailySummary(date) {
    selectedDateDisplay.textContent = date || 'N/A';
    let dailyIncome = 0;
    let dailyExpense = 0;

    budgetEntries.forEach(entry => {
        if (entry.date === date) {
            if (entry.type === 'income') {
                dailyIncome += entry.amount;
            } else if (entry.type === 'expense') {
                dailyExpense += entry.amount;
            }
        }
    });

    const dailyBalance = dailyIncome - dailyExpense;

    dailyIncomeDisplay.textContent = dailyIncome.toFixed(2);
    dailyExpenseDisplay.textContent = dailyExpense.toFixed(2);
    dailyBalanceDisplay.textContent = dailyBalance.toFixed(2);

    if (dailyBalance < 0) {
        dailyBalanceDisplay.classList.add('negative');
    } else {
        dailyBalanceDisplay.classList.remove('negative');
    }
}

function updateOverallSummary() {
    let overallIncome = 0;
    let overallExpense = 0;

    budgetEntries.forEach(entry => {
        if (entry.type === 'income') {
            overallIncome += entry.amount;
        } else if (entry.type === 'expense') {
            overallExpense += entry.amount;
        }
    });

    const overallBalance = overallIncome - overallExpense;

    overallIncomeDisplay.textContent = overallIncome.toFixed(2);
    overallExpenseDisplay.textContent = overallExpense.toFixed(2);
    overallBalanceDisplay.textContent = overallBalance.toFixed(2);

    if (overallBalance < 0) {
        overallBalanceDisplay.classList.add('negative');
    } else {
        overallBalanceDisplay.classList.remove('negative');
    }
}

// --- Core Logic Functions ---

function addEntry() {
    const date = dateInput.value;
    const income = parseFloat(incomeInput.value);
    const expenseAmount = parseFloat(expenseAmountInput.value);
    const expenseCategory = expenseCategoryInput.value;
    const description = descriptionInput.value.trim();

    if (!date) {
        alert('Please select a date.');
        return;
    }

    // Check if at least one of income or expense is entered
    if (isNaN(income) && isNaN(expenseAmount)) {
        alert('Please enter either an income or an expense amount.');
        return;
    }

    // Handle income entry
    if (!isNaN(income) && income > 0) {
        budgetEntries.push({
            id: Date.now(), // Unique ID
            date: date,
            type: 'income',
            amount: income,
            description: description
        });
    }

    // Handle expense entry
    if (!isNaN(expenseAmount) && expenseAmount > 0) {
        if (!expenseCategory) {
            alert('Please select a category for the expense.');
            return;
        }
        budgetEntries.push({
            id: Date.now() + 1, // Ensure unique ID if both are added quickly
            date: date,
            type: 'expense',
            amount: expenseAmount,
            category: expenseCategory, // Add category
            description: description
        });
    }

    saveBudgetEntries();
    renderEntries(filterDateInput.value);
    updateDailySummary(filterDateInput.value);
    updateOverallSummary();
    updateMonthlyBudgetUsage(); // Update monthly usage after adding entry

    // Clear input fields
    incomeInput.value = '';
    expenseAmountInput.value = '';
    expenseCategoryInput.value = ''; // Reset category dropdown
    descriptionInput.value = '';
    dateInput.value = todayFormatted; // Reset date to today
}

function deleteEntry(idToDelete) {
    if (confirm('Are you sure you want to delete this entry?')) {
        budgetEntries = budgetEntries.filter(entry => entry.id !== idToDelete);
        saveBudgetEntries();
        renderEntries(filterDateInput.value);
        updateDailySummary(filterDateInput.value);
        updateOverallSummary();
        updateMonthlyBudgetUsage(); // Update monthly usage after deleting entry
    }
}

function clearAllData() {
    if (confirm('Are you sure you want to clear ALL saved budget data (entries AND budget limits)? This cannot be undone.')) {
        localStorage.removeItem('budgetEntries');
        localStorage.removeItem('monthlyBudgets'); // Clear budget limits too
        budgetEntries = [];
        monthlyBudgets = {}; // Reset in memory
        renderEntries(filterDateInput.value);
        updateDailySummary(filterDateInput.value);
        updateOverallSummary();
        renderBudgetLimits(); // Re-render empty budget limits
        updateMonthlyBudgetUsage(); // Re-render empty usage
        alert('All data cleared!');
    }
}

function saveBudgetLimits() {
    const allCategories = [];
    for (const group in defaultCategories) {
        allCategories.push(...defaultCategories[group]);
    }

    allCategories.forEach(category => {
        const inputId = `budget-${category.replace(/[^a-zA-Z0-9]/g, '')}`;
        const input = document.getElementById(inputId);
        if (input) {
            const limit = parseFloat(input.value);
            if (!isNaN(limit) && limit >= 0) {
                monthlyBudgets[category] = limit;
            } else {
                delete monthlyBudgets[category]; // Remove if invalid or empty
            }
        }
    });
    saveMonthlyBudgets();
    updateMonthlyBudgetUsage(); // Update usage display after saving limits
    alert('Monthly budget limits saved!');
}

// --- Event Listeners ---
addEntryBtn.addEventListener('click', addEntry);
clearAllDataBtn.addEventListener('click', clearAllData);
saveBudgetLimitsBtn.addEventListener('click', saveBudgetLimits);

filterDateInput.addEventListener('change', () => {
    const selectedFilterDate = filterDateInput.value;
    renderEntries(selectedFilterDate);
    updateDailySummary(selectedFilterDate);
});

clearFilterBtn.addEventListener('click', () => {
    filterDateInput.value = '';
    renderEntries();
    updateDailySummary('');
});

// --- Initial Load ---
populateExpenseCategories();
renderBudgetLimits();
renderEntries(filterDateInput.value);
updateDailySummary(filterDateInput.value);
updateOverallSummary();
updateMonthlyBudgetUsage();
});


